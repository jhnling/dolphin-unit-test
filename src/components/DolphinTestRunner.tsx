'use client';

type TestSummary = { 
  total: number; 
  passed: number; 
};

interface TestCase {
  input: string;
  expectedOutput: string;
  output: string;
  passed: boolean;
  error?: string | null;
  failureReason?: string;
  customReason?: string;
}

import React, { useState } from 'react';
import Image from 'next/image';

const TestSummary = ({ total, passed }: TestSummary) => {
  const allPassed = passed === total;
  
  return (
    <div className={`mt-4 p-4 rounded-lg ${allPassed ? 'bg-green-600/10' : 'bg-red-600/10'}`}>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-medium ${allPassed ? 'text-green-500' : 'text-red-500'}`}>
          {allPassed ? (
            <span className="flex items-center gap-2">
              <span className="text-xl">✓</span> All tests passed!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-xl">✗</span> Some tests failed
            </span>
          )}
        </span>
      </div>
      <div className={`text-sm mt-1 ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
        Passed {passed} of {total} test cases
      </div>
    </div>
  );
};

const DolphinTestRunner = () => {
  const [uuid, setUuid] = useState('test-addition-1');
  const [code, setCode] = useState('# Write your Python solution here...\n\ndef solve():\n    # Your code here\n    pass');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [showTests, setShowTests] = useState(false);
  const [expandedTests, setExpandedTests] = useState<number[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const failureOptions = [
    { value: 'formatting', label: 'Formatting' },
    { value: 'floating_point', label: 'Floating Point' },
    { value: 'type_mismatch', label: 'Type Mismatch' },
    { value: 'wrong_test', label: 'Wrong Unit Test' },
    { value: 'other', label: 'Other' }
  ];

  const handleFailureReasonChange = (index: number, reason: string) => {
    setTestCases(prev => prev.map((test, i) => 
      i === index ? { ...test, failureReason: reason, customReason: reason === 'other' ? test.customReason : '' } : test
    ));
  };

  const handleCustomReasonChange = (index: number, reason: string) => {
    setTestCases(prev => prev.map((test, i) => 
      i === index ? { ...test, customReason: reason } : test
    ));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      uid: uuid,
      code: code,
      testCases: testCases.map(test => ({
        input: test.input,
        expectedOutput: test.expectedOutput,
        output: test.output,
        passed: test.passed,
        failureReason: test.failureReason,
        customReason: test.customReason
      })),
      passRate: summary ? `${summary.passed}/${summary.total}` : '0/0'
    };

    try {
      const response = await fetch('https://formspree.io/f/xdkogvlw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {  // Changed from err to error
      console.error('Form submission error:', error);  // Log the error
      setError(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    if (!uuid.trim()) {
      setError('Please enter a UUID');
      return;
    }

    setLoading(true);
    setError(null);
    setTestCases([]);
    setExpandedTests([]);
    setSummary(null);

    try {
      const encodedUuid = encodeURIComponent(uuid);
      const response = await fetch(`/api/problems/${encodedUuid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test cases');
      }

      const data = await response.json();
      const formattedTests = data.tests.map((test: any) => ({
        input: test.input,
        expectedOutput: test.output,
        output: '',
        passed: false
      }));

      setTestCases(formattedTests);
      setShowTests(true);
      setExpandedTests([0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
  
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          testCases: testCases.map(test => ({
            input: test.input,
            output: test.expectedOutput
          }))
        })
      });
  
      if (!response.ok) {
        throw new Error('Execution failed');
      }
  
      const { results } = await response.json();
      
      // Update test cases with results
      setTestCases(results);
      
      // Show all test cases after execution
      setShowTests(true);
      
      // Expand any failed test cases
      const failedIndexes = results
        .map((result: TestCase, index: number) => result.passed ? -1 : index)
        .filter((index: number) => index !== -1);
      
      setExpandedTests(prev => [...new Set([...prev, ...failedIndexes])]);
  
      // Show summary
      const passCount = results.filter((r: TestCase) => r.passed).length;
      setSummary({ total: results.length, passed: passCount });
  
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (index: number) => {
    setExpandedTests(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Logo Section */}
      <div className="flex justify-center mb-12">
        <div className="relative w-32 h-12">
          <Image
            src="/scale-logo.png"
            alt="Dolphin Unit Tests"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Dolphin Unit Tests
        </h1>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Problem UUID
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter problem UUID"
                />
                <button
                  type="button"
                  onClick={loadTests}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  {loading ? 'Loading...' : 'Load Unit Tests'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Code Implementation
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-md font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                spellCheck={false}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          {summary && <TestSummary total={summary.total} passed={summary.passed} />}

          <button 
            onClick={handleSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Running Tests...' : 'Submit Solution'}
          </button>

          {testCases.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setShowTests(!showTests)}
                  className="flex items-center gap-2 text-lg font-medium text-white"
                >
                  <span className="transform transition-transform duration-200" style={{
                    display: 'inline-block',
                    transform: showTests ? 'rotate(90deg)' : 'none'
                  }}>
                    ▶
                  </span>
                  Unit Tests ({testCases.length})
                </button>
              </div>
              
              {showTests && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="space-y-2">
                    {testCases.map((test, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg">
                        <button
                          onClick={() => toggleTest(index)}
                          className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">Test {index + 1}</span>
                            {test.passed !== undefined && (
                              test.passed ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-red-500">✗</span>
                              )
                            )}
                          </div>
                          <span className="transform transition-transform duration-200" style={{
                            display: 'inline-block',
                            transform: expandedTests.includes(index) ? 'rotate(90deg)' : 'none'
                          }}>
                            ▶
                          </span>
                        </button>
                        
                        {expandedTests.includes(index) && (
                          <div className="p-4 border-t border-gray-700">
                            <div className="grid gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-400 mb-1">Input</div>
                                <pre className="text-sm whitespace-pre-wrap bg-gray-900 p-2 rounded">{test.input}</pre>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-400 mb-1">Expected Output</div>
                                <pre className="text-sm whitespace-pre-wrap bg-gray-900 p-2 rounded">{test.expectedOutput}</pre>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-400 mb-1">Your Output</div>
                                <pre className="text-sm whitespace-pre-wrap bg-gray-900 p-2 rounded">{test.output || '(No output yet)'}</pre>
                              </div>
                              {test.error && (
                                <div>
                                  <div className="text-sm font-medium text-red-400 mb-1">Error</div>
                                  <pre className="text-sm whitespace-pre-wrap bg-gray-900 p-2 rounded text-red-400">{test.error}</pre>
                                </div>
                              )}
                              {!test.passed && (
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-gray-400 mb-1">Failure Reason</div>
                                  <select
                                    value={test.failureReason || ''}
                                    onChange={(e) => handleFailureReasonChange(index, e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-full"
                                  >
                                    <option value="">Select a reason</option>
                                    {failureOptions.map(option => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                  {test.failureReason === 'other' && (
                                    <textarea
                                      value={test.customReason || ''}
                                      onChange={(e) => handleCustomReasonChange(index, e.target.value)}
                                      placeholder="Please explain the issue..."
                                      className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                                      rows={3}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {testCases.length > 0 && !loading && (
            <div className="mt-8">
              <button
                onClick={handleFormSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                Submit Results
              </button>
            </div>
          )}

          {submitSuccess && (
            <div className="mt-4 p-4 bg-green-600/10 rounded-lg">
              <div className="text-green-500 font-medium">
                Thank you for your feedback on problem {uuid}!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DolphinTestRunner;