/**
 * Skill Invoker — Independent skill invocation with standard I/O piping.
 *
 * Replaces the pipeline orchestration model. Each skill is independently
 * invocable. Skills can be piped together (shell pipeline model):
 *   invoke(S01) | invoke(S03) | invoke(S10)
 *
 * Key differences from the old pipeline executor:
 * - No pipeline object — just an array of invocations
 * - No rollback semantics — each skill is independent
 * - No budget tracking at the orchestration level
 * - I/O piping: output of skill N becomes input of skill N+1
 * - Failures don't cascade — a failed skill returns an error,
 *   the next skill receives the error as input and decides what to do
 * - Standard I/O model, like Unix pipes
 */

import {
  SkillInvocation,
  PipeResult,
  SkillConflict,
  TelemetryEvent,
} from './skill-data';
import { skills, skillConflicts, skillDependencies } from './skill-data';

// ─── Single Skill Invocation ───

/**
 * Invoke a single skill with input and return the invocation result.
 * In the current implementation, "invocation" means generating the install
 * command and tracking the result. Server-side execution would replace this.
 */
export async function invokeSkill(
  skillId: string,
  input: Record<string, unknown> = {}
): Promise<SkillInvocation> {
  const skill = skills.find((s) => s.id === skillId);
  const invocation: SkillInvocation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    skillId,
    input,
    status: 'running',
    invokedAt: Date.now(),
  };

  if (!skill) {
    return {
      ...invocation,
      status: 'failed',
      errorMsg: `Skill ${skillId} not found in registry`,
      durationMs: 0,
      completedAt: Date.now(),
    };
  }

  const start = Date.now();

  // Simulate execution: in production, this would call the skill's API
  // For now, we generate the install command as output
  const output: Record<string, unknown> = {
    installed: true,
    installCommand: skill.installCommand,
    skillId: skill.id,
    skillName: skill.name,
    version: skill.version,
    // Pipe forward: carry forward any previous output that downstream
    // skills might need, plus add this skill's output
    ...input,
    [`${skill.id}_output`]: {
      command: skill.installCommand,
      role: skill.primaryRole,
    },
  };

  return {
    ...invocation,
    status: 'success',
    output,
    durationMs: Date.now() - start,
    completedAt: Date.now(),
  };
}

// ─── I/O Piping ───

/**
 * Pipe a sequence of skills — each skill's output becomes the next skill's input.
 * This is the shell pipeline model: skill1 | skill2 | skill3
 *
 * Unlike the old pipeline executor:
 * - Failures do NOT cascade — a failed skill's error is passed as input
 *   to the next skill, which can decide how to handle it
 * - No rollback — each skill is independent
 * - No budget — callers manage their own constraints
 * - No parallel groups — skills are sequential pipes
 */
export async function pipeSkills(
  skillIds: string[],
  initialInput: Record<string, unknown> = {},
  onInvocationUpdate?: (invocation: SkillInvocation, index: number) => void
): Promise<PipeResult> {
  const startTime = Date.now();
  const invocations: SkillInvocation[] = [];
  const telemetry: TelemetryEvent[] = [];
  const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let currentInput = initialInput;

  for (let i = 0; i < skillIds.length; i++) {
    const skillId = skillIds[i];
    const invocation = await invokeSkill(skillId, currentInput);

    invocations.push(invocation);
    onInvocationUpdate?.(invocation, i);

    // Emit telemetry for each invocation
    telemetry.push({
      type: 'skill_invocation',
      skillId,
      batchId,
      status: invocation.status,
      durationMs: invocation.durationMs,
      errorMsg: invocation.errorMsg,
      timestamp: Date.now(),
    });

    // Pipe: output of this skill becomes input of the next skill
    // If the skill failed, pipe the error context forward
    if (invocation.status === 'success' && invocation.output) {
      currentInput = invocation.output;
    } else if (invocation.status === 'failed') {
      // Pass error context forward — next skill can read it from input
      currentInput = {
        ...currentInput,
        _error: {
          skillId,
          errorMsg: invocation.errorMsg,
          failedAt: Date.now(),
        },
      };
    }
  }

  // Emit batch telemetry
  const totalDuration = Date.now() - startTime;
  telemetry.push({
    type: 'batch_invocation',
    batchId,
    status: invocations.every((inv) => inv.status === 'success')
      ? 'success'
      : invocations.some((inv) => inv.status === 'success')
        ? 'partial_failure'
        : 'failed',
    durationMs: totalDuration,
    timestamp: Date.now(),
  });

  return {
    invocations,
    finalOutput: currentInput,
    successCount: invocations.filter((inv) => inv.status === 'success').length,
    failureCount: invocations.filter((inv) => inv.status === 'failed').length,
    totalDurationMs: totalDuration,
  };
}

// ─── Conflict Detection Utility ───

/**
 * Check a set of skill IDs for conflicts before piping.
 * Returns critical conflicts that would block execution,
 * and warnings that should be surfaced to the user.
 */
export function detectConflicts(skillIds: string[]): {
  critical: SkillConflict[];
  warnings: SkillConflict[];
  info: SkillConflict[];
} {
  const detected = skillConflicts.filter(
    (c) =>
      (skillIds.includes(c.skillA) && skillIds.includes(c.skillB)) ||
      (skillIds.includes(c.skillB) && skillIds.includes(c.skillA))
  );

  return {
    critical: detected.filter((c) => c.severity === 'critical'),
    warnings: detected.filter((c) => c.severity === 'warning'),
    info: detected.filter((c) => c.severity === 'info'),
  };
}

// ─── Version Compatibility Check ───

/**
 * Check for version mismatches between skills in a pipe.
 * In a real implementation, this would query the SkillVersion table.
 */
export function checkVersionCompatibility(
  skillIds: string[]
): { skillId: string; version: string; issues: string[] }[] {
  return skillIds
    .map((id) => {
      const skill = skills.find((s) => s.id === id);
      if (!skill) return null;

      const issues: string[] = [];

      // Check if any dependency requires a different version
      const deps = skillDependencies.filter(
        (d) => d.skillId === id && d.relationship === 'requires'
      );
      for (const dep of deps) {
        const depSkill = skills.find((s) => s.id === dep.dependsOnSkillId);
        if (depSkill && !skillIds.includes(dep.dependsOnSkillId)) {
          issues.push(
            `Requires ${depSkill.name} (${dep.dependsOnSkillId}) which is not in pipe`
          );
        }
      }

      return {
        skillId: id,
        version: skill.version,
        issues,
      };
    })
    .filter(Boolean) as { skillId: string; version: string; issues: string[] }[];
}

// ─── Install Script Generator ───

/**
 * Generate an install script from a list of skill IDs.
 * This is the "copy to clipboard" functionality that the old
 * PipelineView's "Run Pipeline" button used.
 */
export function generateInstallScript(skillIds: string[]): string {
  const basketSkills = skillIds
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean) as typeof skills;

  if (basketSkills.length === 0) return '';

  const script = basketSkills
    .map((s) => `# ${s.name} (T${s.tier} ${s.tierName})\n${s.installCommand}`)
    .join('\n\n');

  return `#!/bin/bash\n# Skill Install Script — ${basketSkills.length} skills\n# Generated at ${new Date().toISOString()}\n\nset -e\n\n${script}\n\necho "✅ Install complete: ${basketSkills.length} skills installed"`;
}
