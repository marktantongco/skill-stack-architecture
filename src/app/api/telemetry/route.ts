import { NextRequest, NextResponse } from 'next/server';

/**
 * Telemetry API Route — Records and queries skill execution metrics.
 *
 * POST /api/telemetry  — Record a telemetry event
 * GET  /api/telemetry  — Query metrics (aggregate stats)
 *
 * In production, this would write to the Prisma database (SkillInvocation,
 * BatchInvocation models). Currently uses an in-memory store for
 * demonstration, with a clear path to database migration.
 */

interface TelemetryRecord {
  id: string;
  type: 'skill_invocation' | 'batch_invocation';
  skillId?: string;
  batchId?: string;
  status: string;
  durationMs?: number;
  errorMsg?: string;
  timestamp: number;
}

// In-memory store — replace with Prisma in production
const telemetryStore: TelemetryRecord[] = [];
const MAX_STORE_SIZE = 10000;

function trimStore() {
  if (telemetryStore.length > MAX_STORE_SIZE) {
    telemetryStore.splice(0, telemetryStore.length - MAX_STORE_SIZE);
  }
}

/**
 * POST /api/telemetry
 * Record a new telemetry event.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: type, status' },
        { status: 400 }
      );
    }

    const validTypes = ['skill_invocation', 'batch_invocation'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const record: TelemetryRecord = {
      id: `tel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: body.type,
      skillId: body.skillId,
      batchId: body.batchId,
      status: body.status,
      durationMs: body.durationMs,
      errorMsg: body.errorMsg,
      timestamp: body.timestamp ?? Date.now(),
    };

    telemetryStore.push(record);
    trimStore();

    return NextResponse.json(
      {
        ok: true,
        id: record.id,
        recorded: true,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

/**
 * GET /api/telemetry
 * Query aggregate metrics.
 *
 * Query params:
 *   type       — Filter by event type
 *   skillId    — Filter by skill ID
 *   batchId    — Filter by batch ID
 *   status     — Filter by status
 *   limit      — Max records to return (default 100, max 1000)
 *   aggregate  — If "true", return aggregate stats instead of raw records
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get('type');
  const skillId = searchParams.get('skillId');
  const batchId = searchParams.get('batchId');
  const status = searchParams.get('status');
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') ?? '100', 10), 1),
    1000
  );
  const aggregate = searchParams.get('aggregate') === 'true';

  // Filter records
  let filtered = [...telemetryStore];

  if (type) filtered = filtered.filter((r) => r.type === type);
  if (skillId) filtered = filtered.filter((r) => r.skillId === skillId);
  if (batchId) filtered = filtered.filter((r) => r.batchId === batchId);
  if (status) filtered = filtered.filter((r) => r.status === status);

  if (aggregate) {
    // Return aggregate statistics
    const totalInvocations = filtered.filter(
      (r) => r.type === 'skill_invocation'
    ).length;
    const successCount = filtered.filter(
      (r) => r.status === 'success'
    ).length;
    const failureCount = filtered.filter(
      (r) => r.status === 'failed'
    ).length;

    const durations = filtered
      .filter((r) => r.durationMs != null)
      .map((r) => r.durationMs!);

    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    const p99Duration =
      durations.length > 0
        ? durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.99)]
        : null;

    // Per-skill success rate
    const skillIds = [...new Set(filtered.map((r) => r.skillId).filter(Boolean))];
    const skillMetrics = skillIds.map((sid) => {
      const skillRecords = filtered.filter((r) => r.skillId === sid);
      const skillSuccess = skillRecords.filter(
        (r) => r.status === 'success'
      ).length;
      const skillFailed = skillRecords.filter(
        (r) => r.status === 'failed'
      ).length;
      const skillDurations = skillRecords
        .filter((r) => r.durationMs != null)
        .map((r) => r.durationMs!);
      const skillAvgDuration =
        skillDurations.length > 0
          ? Math.round(
              skillDurations.reduce((a, b) => a + b, 0) /
                skillDurations.length
            )
          : null;

      return {
        skillId: sid,
        totalInvocations: skillRecords.length,
        successCount: skillSuccess,
        failureCount: skillFailed,
        successRate:
          skillRecords.length > 0
            ? Math.round((skillSuccess / skillRecords.length) * 100)
            : null,
        avgDurationMs: skillAvgDuration,
      };
    });

    return NextResponse.json({
      aggregate: {
        totalInvocations,
        successCount,
        failureCount,
        successRate:
          totalInvocations > 0
            ? Math.round((successCount / totalInvocations) * 100)
            : null,
        avgDurationMs: avgDuration,
        p99DurationMs: p99Duration,
      },
      skillMetrics,
      period: {
        from: filtered.length > 0 ? filtered[0].timestamp : null,
        to:
          filtered.length > 0
            ? filtered[filtered.length - 1].timestamp
            : null,
        recordCount: filtered.length,
      },
    });
  }

  // Return raw records (most recent first)
  const records = filtered
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return NextResponse.json({
    records,
    total: filtered.length,
    limit,
  });
}
