import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Parse the UUID from the request URL and decode it
    const url = new URL(request.url);
    const uuid = decodeURIComponent(url.pathname.split('/').pop() || '');

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    const result = (await sql`
      SELECT * FROM "Problem"
      WHERE uid = ${uuid}
    `) as { rows: { uid: string; tests: any[] }[] };

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    const problem = result.rows[0];
    return NextResponse.json({
      uid: problem.uid,
      tests: problem.tests,
      sampleTest: {
        input: problem.tests[0]?.input,
        expectedOutput: problem.tests[0]?.output
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    );
  }
}