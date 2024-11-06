import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { uuid: string } }
) {
  try {
    const uuid = params.uuid;
    // Use type assertion for sql query
    const result = await sql`
      SELECT * FROM "Problem"
      WHERE uid = ${uuid}
    ` as unknown as { rows: any[] };

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