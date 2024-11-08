// src/app/api/execute/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, testCase, testIndex } = await request.json();

    const response = await fetch(process.env.REPLIT_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        testCase
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout per test
    });

    if (!response.ok) {
      throw new Error('Execution failed');
    }

    const data = await response.json();
    return NextResponse.json({ ...data, testIndex });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: 'Execution failed or timed out', testIndex: -1 },
      { status: 500 }
    );
  }
}