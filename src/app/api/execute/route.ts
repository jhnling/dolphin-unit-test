import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, testCases } = await request.json();

    const response = await fetch(process.env.REPLIT_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        testCases
      })
    });

    if (!response.ok) {
      throw new Error('Failed to execute code');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: 'Code execution failed' },
      { status: 500 }
    );
  }
}