// src/app/api/execute/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';

async function runPythonCode(code: string, input: string): Promise<{ output: string; error: string | null }> {
  const tempDir = '/tmp'; // Use /tmp for writable temporary storage
  const filePath = path.join(tempDir, 'solution.py');

  try {
    // Create temp directory (not strictly needed for /tmp, but safe for other environments)
    await mkdir(tempDir, { recursive: true });
    await writeFile(filePath, code);

    return new Promise((resolve) => {
      let output = '';
      let error = '';

      const process = spawn('python3', [filePath]);

      // Send input to stdin
      process.stdin.write(input);
      process.stdin.end();

      // Collect output
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      // Handle process completion
      process.on('close', () => {
        resolve({
          output: output.trim(),
          error: error || null
        });
      });

      // Handle timeout
      setTimeout(() => {
        process.kill();
        resolve({
          output: '',
          error: 'Execution timed out'
        });
      }, 5000);
    });
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Execution failed'
    };
  }
}

export async function POST(request: Request) {
  try {
    const { code, testCases } = await request.json();

    const results = await Promise.all(
      testCases.map(async (test: any) => {
        const { output, error } = await runPythonCode(code, test.input);
        return {
          input: test.input,
          expectedOutput: test.output,
          output: output,
          passed: output === test.output,
          error: error
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: 'Code execution failed' },
      { status: 500 }
    );
  }
}
