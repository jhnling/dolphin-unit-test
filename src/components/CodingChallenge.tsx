'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const CodingChallenge = () => {
  const [uuid, setUuid] = useState('');
  const [code, setCode] = useState('# Write your Python solution here...\n\ndef solve():\n    # Your code here\n    pass');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ uuid, code });
    // Handle submission logic here
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Logo Section */}
      <div className="flex justify-center mb-12">
        <div className="relative w-32 h-12">
          <Image
            src="/scale-logo.png"
            alt="Scale AI Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Scale AI Coding Challenges
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {/* UUID Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Problem UUID
              </label>
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter problem UUID"
              />
            </div>

            {/* Code Editor */}
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

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors duration-200"
          >
            Submit Solution
          </button>
        </form>
      </div>
    </div>
  );
};

export default CodingChallenge;