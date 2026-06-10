import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const skillName = request.nextUrl.searchParams.get('skill');

  if (!skillName) {
    return NextResponse.json({ error: 'Missing skill parameter' }, { status: 400 });
  }

  // Sanitize skill name to prevent path traversal
  const sanitized = skillName.replace(/[^a-zA-Z0-9_-]/g, '');
  if (sanitized !== skillName) {
    return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 });
  }

  const skillPath = join(process.cwd(), 'skills-local', sanitized, 'SKILL.md');

  try {
    const content = await readFile(skillPath, 'utf-8');
    return NextResponse.json({
      skill: sanitized,
      content,
      length: content.length,
    });
  } catch {
    return NextResponse.json({ error: 'Skill not found', skill: sanitized }, { status: 404 });
  }
}
