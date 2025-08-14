'use client';

import React, { useState, useEffect } from 'react';

interface DatabaseStatus {
  seeded: boolean;
  lastSeeded?: string;
  totalQuestions?: {
    part1: number;
    part2: number;
    part3: number;
  };
  version?: string;
}

interface SeedingProgress {
  completed?: string;
  totalSeeded: number;
}

function SeedDatabasePage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState<SeedingProgress | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seed-questions');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setError('Failed to check database status');
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setSeeding(true);
      setMessage('Starting database seeding...');
      setError('');
      setSeedingProgress(null);
      
      const response = await fetch('/api/admin/seed-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Database seeded successfully! ${result.data.totalQuestions} questions added.`);
        
        // Refresh status
        setTimeout(() => {
          checkDatabaseStatus();
        }, 1000);
        
      } else {
        setError(`❌ Seeding failed: ${result.message}`);
        if (result.progress) {
          setSeedingProgress(result.progress);
        }
      }
      
    } catch (error) {
      console.error('Error seeding database:', error);
      setError('Failed to seed database. Please check your connection and try again.');
    } finally {
      setSeeding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Speaking Questions Database
            </h1>
            <p className="text-gray-600">
              Manage and seed IELTS speaking questions database
            </p>
          </div>

          {/* Status Card */}
          <div className="mb-8">
            <div className={`p-6 rounded-lg border-2 ${
              status?.seeded 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  status?.seeded ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <h3 className={`text-lg font-bold ${
                  status?.seeded ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  Database Status: {status?.seeded ? 'Seeded' : 'Not Seeded'}
                </h3>
              </div>
              
              {status?.seeded ? (
                <div className="space-y-2 text-green-700">
                  <p><strong>Last Seeded:</strong> {status.lastSeeded ? formatDate(status.lastSeeded) : 'Unknown'}</p>
                  <p><strong>Version:</strong> {status.version || 'Unknown'}</p>
                  {status.totalQuestions && (
                    <div>
                      <strong>Total Questions:</strong>
                      <div className="ml-4 mt-1">
                        <p>• Part 1: {status.totalQuestions.part1} questions</p>
                        <p>• Part 2: {status.totalQuestions.part2} questions</p>
                        <p>• Part 3: {status.totalQuestions.part3} questions</p>
                        <p>• <strong>Total: {status.totalQuestions.part1 + status.totalQuestions.part2 + status.totalQuestions.part3} questions</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-yellow-700">
                  The speaking questions database needs to be seeded before you can use the speaking test functionality.
                </p>
              )}
            </div>
          </div>

          {/* Action Section */}
          <div className="mb-8">
            <div className="flex justify-center">
              <button
                onClick={seedDatabase}
                disabled={seeding}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all duration-300 ${
                  seeding
                    ? 'bg-gray-400 cursor-not-allowed'
                    : status?.seeded
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-primary hover:bg-red-700'
                }`}
              >
                {seeding ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Seeding Database...
                  </div>
                ) : status?.seeded ? (
                  'Re-seed Database'
                ) : (
                  'Seed Database Now'
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
              {seedingProgress && (
                <div className="mt-2 text-red-700">
                  <p>Progress: {seedingProgress.totalSeeded} questions seeded</p>
                  {seedingProgress.completed && (
                    <p>Last completed: {seedingProgress.completed}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What will be seeded?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Question Database</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• 15 Part 1 questions (Introduction & familiar topics)</li>
                  <li>• 10 Part 2 questions (Individual long turn with cue cards)</li>
                  <li>• 15 Part 3 questions (Abstract discussion topics)</li>
                  <li>• Conversation templates and greetings</li>
                  <li>• Question metadata and categorization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Test Templates</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Balanced practice test (mixed difficulty)</li>
                  <li>• Beginner-friendly test (easy questions)</li>
                  <li>• Advanced practice test (challenging questions)</li>
                  <li>• Proper difficulty distribution</li>
                  <li>• Estimated duration calculations</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> This process will create the necessary database collections and documents 
                for the speaking test functionality. It's safe to run multiple times - existing data will be updated.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <a 
              href="/exercise/speaking" 
              className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Speaking Tests
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeedDatabasePage;
