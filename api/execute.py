from http.server import BaseHTTPRequestHandler
import json
import sys
from io import StringIO
import contextlib

@contextlib.contextmanager
def capture_output():
    new_out = StringIO()
    new_err = StringIO()
    old_out = sys.stdout
    old_err = sys.stderr
    try:
        sys.stdout = new_out
        sys.stderr = new_err
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout = old_out
        sys.stderr = old_err

def run_code(code, test_input):
    # Create a namespace for the code to run in
    namespace = {}
    
    try:
        # Redirect stdin to use the test input
        sys.stdin = StringIO(test_input)
        
        # Capture stdout and stderr
        with capture_output() as (out, err):
            exec(code, namespace)
            
        return {
            'output': out.getvalue().strip(),
            'error': err.getvalue().strip() or None
        }
    except Exception as e:
        return {
            'output': '',
            'error': str(e)
        }
    finally:
        sys.stdin = sys.__stdin__

def handler(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            body = json.loads(request.body)
            code = body.get('code', '')
            test_cases = body.get('testCases', [])

            # Run each test case
            results = []
            for test in test_cases:
                result = run_code(code, test['input'])
                results.append({
                    'input': test['input'],
                    'expectedOutput': test['output'],
                    'output': result['output'],
                    'passed': result['output'] == test['output'].strip(),
                    'error': result['error']
                })

            return {
                'statusCode': 200,
                'body': json.dumps({'results': results}),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)}),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
    else:
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'}),
            'headers': {
                'Content-Type': 'application/json'
            }
        }