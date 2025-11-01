'use client';

import { useState } from 'react';

export default function StorageSetupPage() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '1. Open Supabase Dashboard',
      description: 'Click the button below to open your Supabase project dashboard in a new tab',
      action: () => {
        window.open('https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/storage/buckets', '_blank');
        setStep(1);
      },
      buttonText: 'Open Supabase Dashboard',
      icon: '🌐',
    },
    {
      title: '2. Create New Bucket',
      description: 'In the Supabase Dashboard, click the "New Bucket" button',
      details: [
        'Look for the green "New Bucket" button in the top right',
        'Click it to open the bucket creation dialog'
      ],
      icon: '📦',
    },
    {
      title: '3. Configure Bucket Settings',
      description: 'Enter the following settings exactly:',
      details: [
        'Bucket name: mood-captures',
        'Public bucket: ✅ MUST BE CHECKED',
        'File size limit: 5 MB (or 5242880 bytes)',
        'Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp'
      ],
      icon: '⚙️',
    },
    {
      title: '4. Create the Bucket',
      description: 'Click "Create bucket" to save your configuration',
      details: [
        'Double-check that "Public bucket" is enabled',
        'Click the "Create bucket" button at the bottom'
      ],
      icon: '✨',
    },
    {
      title: '5. Set Up Storage Policies',
      description: 'Now we need to set up access policies for the bucket',
      action: () => {
        window.open('https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new', '_blank');
      },
      buttonText: 'Open SQL Editor',
      details: [
        'Click the button above to open the SQL Editor',
        'Copy the entire contents of: supabase-setup-storage.sql',
        'Paste it into the SQL Editor',
        'Click "Run" to execute the SQL'
      ],
      icon: '🔐',
    },
    {
      title: '6. Restart Your App',
      description: 'Final step - restart your Next.js development server',
      details: [
        'Go to your terminal',
        'Press Ctrl+C to stop the server',
        'Run: npm run dev',
        'The storage bucket error should be gone!'
      ],
      icon: '🎉',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            📦 Storage Bucket Setup
          </h1>
          <p className="text-xl text-gray-300">
            Follow these steps to fix the "mood-captures bucket not found" error
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-full h-2 mx-1 rounded ${
                  index <= step ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((stepInfo, index) => (
            <div
              key={index}
              className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border ${
                index === step
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : index < step
                  ? 'border-green-500/50'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{stepInfo.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {stepInfo.title}
                  </h2>
                  <p className="text-gray-300 mb-4">{stepInfo.description}</p>

                  {stepInfo.details && (
                    <ul className="space-y-2 mb-4">
                      {stepInfo.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-400">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {stepInfo.action && (
                    <button
                      onClick={stepInfo.action}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {stepInfo.buttonText}
                    </button>
                  )}

                  {index > 0 && index === step && (
                    <button
                      onClick={() => setStep(index + 1)}
                      className="ml-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Done - Next Step →
                    </button>
                  )}

                  {index < step && (
                    <div className="mt-2 text-green-500 font-semibold">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion */}
        {step >= steps.length && (
          <div className="mt-8 bg-green-500/20 border border-green-500 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Setup Complete!
            </h2>
            <p className="text-gray-300 mb-6">
              Your storage bucket is now configured. Restart your app to see the changes.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Return to App →
            </a>
          </div>
        )}

        {/* Troubleshooting */}
        <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">
            🔧 Troubleshooting
          </h3>
          <div className="space-y-3 text-gray-400">
            <p>
              <strong className="text-white">Still seeing errors?</strong>
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Make sure "Public bucket" is checked when creating the bucket</li>
              <li>• Verify you ran the SQL from supabase-setup-storage.sql</li>
              <li>• Check that the bucket name is exactly "mood-captures" (lowercase)</li>
              <li>• Restart your development server after making changes</li>
              <li>• Clear your browser cache and reload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
