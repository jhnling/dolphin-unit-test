// src/app/api/execute/route.ts
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
      }),
      // Add timeout configuration
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Execution failed: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution timed out. Please try again.' },
      { status: error instanceof Error && error.name === 'TimeoutError' ? 504 : 500 }
    );
  }
}

export const runtime = 'edge'; // Add edge runtime for better performance
export const maxDuration = 60; // Maximum execution time in seconds