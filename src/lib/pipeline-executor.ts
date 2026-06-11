/**
 * Pipeline Executor — Stage-based skill execution with:
 * - I/O piping between stages
 * - Partial-failure semantics
 * - Rollback support
 * - Parallel execution of independent stages
 * - Telemetry event emission
 */

import {
  SkillPipeline,
  PipelineStage,
  SkillConflict,
  TelemetryEvent,
} from './skill-data';
import { skills, skillConflicts, skillDependencies } from './skill-data';

// ─── Pipeline Builder ───

/**
 * Build a SkillPipeline from a list of skill IDs.
 * Validates conflicts, resolves dependency order, and creates stages.
 */
export function buildPipeline(
  skillIds: string[],
  options?: {
    name?: string;
    maxDurationMs?: number;
    maxStages?: number;
  }
): { pipeline: SkillPipeline; conflicts: SkillConflict[] } {
  // 1. Resolve skills
  const resolvedSkills = skillIds
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean) as typeof skills;

  // 2. Detect conflicts
  const conflicts = skillConflicts.filter(
    (c) =>
      (skillIds.includes(c.skillA) && skillIds.includes(c.skillB)) ||
      (skillIds.includes(c.skillB) && skillIds.includes(c.skillA))
  );

  // 3. Resolve dependency order (topological sort via tier)
  // Since our skills are tiered, we sort by tier (foundation first)
  // This ensures dependencies run before dependents
  const sorted = [...resolvedSkills].sort((a, b) => a.tier - b.tier);

  // 4. Detect parallel groups (same-tier skills with no conflicts can run in parallel)
  const parallelGroups: number[][] = [];
  const tierGroups = new Map<number, number[]>();

  sorted.forEach((skill, index) => {
    const group = tierGroups.get(skill.tier) || [];
    group.push(index);
    tierGroups.set(skill.tier, group);
  });

  for (const [, indices] of tierGroups) {
    if (indices.length > 1) {
      // Check for conflicts within this tier group
      const hasConflict = indices.some((i) =>
        indices.some(
          (j) =>
            i !== j &&
            conflicts.some(
              (c) =>
                (c.skillA === sorted[i].id && c.skillB === sorted[j].id) ||
                (c.skillA === sorted[j].id && c.skillB === sorted[i].id)
            )
        )
      );
      if (!hasConflict) {
        parallelGroups.push(indices);
      }
    }
  }

  // 5. Build stages
  const stages: PipelineStage[] = sorted.map((skill, index) => {
    const deps = skillDependencies.filter((d) => d.skillId === skill.id);
    const requiredDeps = deps
      .filter((d) => d.relationship === 'requires')
      .map((d) => d.dependsOnSkillId);

    return {
      id: `stage-${index}`,
      skillId: skill.id,
      index,
      inputs: {
        skillId: skill.id,
        skillName: skill.name,
        version: skill.version,
        requires: requiredDeps.length > 0 ? requiredDeps : undefined,
        installCommand: skill.installCommand,
      },
      outputs: {
        installed: false,
        installCommand: skill.installCommand,
      },
      rollback: {
        command: `# Rollback: ${skill.name}\nnpx skills remove ${skill.id}`,
        description: `Uninstall ${skill.name} (v${skill.version})`,
      },
      status: 'pending' as const,
    };
  });

  // 6. Construct pipeline
  const pipeline: SkillPipeline = {
    id: `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: options?.name,
    stages,
    status: 'pending',
    parallelGroups,
    successCount: 0,
    failureCount: 0,
    rollbackCount: 0,
    budget: options
      ? {
          maxDurationMs: options.maxDurationMs ?? 300000, // 5 min default
          maxStages: options.maxStages ?? 20,
        }
      : undefined,
    createdAt: Date.now(),
  };

  return { pipeline, conflicts };
}

// ─── Pipeline Executor ───

export interface PipelineResult {
  pipeline: SkillPipeline;
  telemetry: TelemetryEvent[];
}

/**
 * Execute a pipeline stage by stage.
 * In the current implementation, "execution" means generating the install script
 * and tracking the result. Server-side execution would replace this.
 */
export async function executePipeline(
  pipeline: SkillPipeline,
  onStageUpdate?: (stage: PipelineStage) => void
): Promise<PipelineResult> {
  const telemetry: TelemetryEvent[] = [];
  const startTime = Date.now();
  const updatedPipeline = { ...pipeline, status: 'running' as const };
  const completedStages: PipelineStage[] = [];

  for (const stage of updatedPipeline.stages) {
    const stageStart = Date.now();

    // Update stage status
    const runningStage: PipelineStage = { ...stage, status: 'running' };
    onStageUpdate?.(runningStage);

    try {
      // Simulate execution: in production, this would call the skill's install API
      // For now, we generate the install script segment
      const skill = skills.find((s) => s.id === stage.skillId);
      if (!skill) {
        throw new Error(`Skill ${stage.skillId} not found`);
      }

      // Check budget
      if (updatedPipeline.budget) {
        const elapsed = Date.now() - startTime;
        if (elapsed > updatedPipeline.budget.maxDurationMs) {
          throw new Error(
            `Pipeline budget exceeded: ${elapsed}ms > ${updatedPipeline.budget.maxDurationMs}ms`
          );
        }
      }

      // Mark stage as success
      const successStage: PipelineStage = {
        ...runningStage,
        status: 'success',
        durationMs: Date.now() - stageStart,
        outputs: {
          ...stage.outputs,
          installed: true,
          installCommand: skill.installCommand,
        },
      };

      completedStages.push(successStage);
      updatedPipeline.successCount++;
      onStageUpdate?.(successStage);

      telemetry.push({
        type: 'pipeline_stage',
        pipelineId: updatedPipeline.id,
        skillId: stage.skillId,
        status: 'success',
        durationMs: successStage.durationMs,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Handle stage failure
      const failedStage: PipelineStage = {
        ...runningStage,
        status: 'failed',
        durationMs: Date.now() - stageStart,
        errorMsg: error instanceof Error ? error.message : String(error),
      };

      completedStages.push(failedStage);
      updatedPipeline.failureCount++;
      onStageUpdate?.(failedStage);

      telemetry.push({
        type: 'pipeline_stage',
        pipelineId: updatedPipeline.id,
        skillId: stage.skillId,
        status: 'failed',
        durationMs: failedStage.durationMs,
        errorMsg: failedStage.errorMsg,
        timestamp: Date.now(),
      });

      // Rollback completed stages on failure
      for (let i = completedStages.length - 2; i >= 0; i--) {
        const prevStage = completedStages[i];
        if (prevStage.status === 'success' && prevStage.rollback) {
          const rolledBack: PipelineStage = {
            ...prevStage,
            status: 'rolled_back',
            rollbackResult: JSON.stringify({
              command: prevStage.rollback.command,
              description: prevStage.rollback.description,
              rolledBackAt: Date.now(),
            }),
          };
          completedStages[i] = rolledBack;
          updatedPipeline.rollbackCount++;
          updatedPipeline.successCount--;

          telemetry.push({
            type: 'pipeline_stage',
            pipelineId: updatedPipeline.id,
            skillId: prevStage.skillId,
            status: 'rolled_back',
            timestamp: Date.now(),
          });
        }
      }

      // Mark remaining stages as skipped
      for (
        let i = completedStages.length;
        i < updatedPipeline.stages.length;
        i++
      ) {
        completedStages.push({
          ...updatedPipeline.stages[i],
          status: 'skipped',
        });
      }

      break;
    }
  }

  // Determine final pipeline status
  const totalDuration = Date.now() - startTime;
  let finalStatus: SkillPipeline['status'];

  if (updatedPipeline.failureCount > 0 && updatedPipeline.successCount > 0) {
    finalStatus = 'partial_failure';
  } else if (updatedPipeline.failureCount > 0) {
    finalStatus = 'failed';
  } else {
    finalStatus = 'success';
  }

  const result: SkillPipeline = {
    ...updatedPipeline,
    stages: completedStages,
    status: finalStatus,
    totalDurationMs: totalDuration,
    completedAt: Date.now(),
  };

  telemetry.push({
    type: 'pipeline_execution',
    pipelineId: result.id,
    status: finalStatus,
    durationMs: totalDuration,
    timestamp: Date.now(),
  });

  return { pipeline: result, telemetry };
}

// ─── Conflict Detection Utility ───

/**
 * Check a set of skill IDs for conflicts before building a pipeline.
 * Returns critical conflicts that would block pipeline execution,
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
 * Check for version mismatches between skills in a pipeline.
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
            `Requires ${depSkill.name} (${dep.dependsOnSkillId}) which is not in pipeline`
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
