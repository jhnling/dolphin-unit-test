import { NextResponse, NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Parse the UUID from the request URL
    const url = new URL(request.url);
    const uuid = url.pathname.split('/').pop();

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    // Type assertion for sql query result
    const result = (await sql`
      SELECT * FROM "Problem"
      WHERE uid = ${uuid}
    `) as { rows: any[] };

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uid: result.rows[0].uid,
      tests: result.rows[0].tests
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    );
  }
}