"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface TestStats {
  totalAttempts: number;
  averageScore?: number;
  averageBandScore?: number;
}

interface BaseTest {
  id: string;
  title: string;
  totalQuestions: number;
  stats?: TestStats;
  [key: string]: any;
}

interface TestManagerProps {
  testType: 'listening' | 'reading';
  isAdmin: boolean;
}

const TestManager: React.FC<TestManagerProps> = ({ testType, isAdmin }) => {
  const [tests, setTests] = useState<BaseTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const testTypeCapitalized = testType.charAt(0).toUpperCase() + testType.slice(1);

  useEffect(() => {
    if (isAdmin) {
      fetchTests();
    }
  }, [isAdmin, testType]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { getListeningTestsWithStats, getReadingTestsWithStats } = await import('@/lib/actions/admin.actions');
      
      // Use the appropriate fetch function based on test type
      const result = testType === 'listening' 
        ? await getListeningTestsWithStats()
        : await getReadingTestsWithStats();
      
      if (result.success) {
        setTests(result.data as BaseTest[]);
      } else {
        toast.error(`Failed to fetch ${testType} tests`);
      }
    } catch (error) {
      console.error(`Error fetching ${testType} tests:`, error);
      toast.error(`Error fetching ${testType} tests`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a JSON file');
      return;
    }

    try {
      setUploading(true);
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);
      
      // Extract test data - reading tests have nested structure
      const testData = testType === 'reading' && jsonData.test ? jsonData.test : jsonData;
      
      // Generate ID from filename if not present
      const testId = testData.id || selectedFile.name.replace('.json', '');
      
      // Import the appropriate action
      if (testType === 'listening') {
        const { createListeningTest } = await import('@/lib/actions/listening-tests.actions');
        const result = await createListeningTest(testData);
        
        if (result.success) {
          toast.success('Test uploaded successfully!');
          setShowUploadModal(false);
          setSelectedFile(null);
          fetchTests();
        } else {
          toast.error(result.message || 'Failed to upload test');
        }
      } else {
        // Reading test upload
        const { createReadingTest } = await import('@/lib/actions/admin.actions');
        
        const testWithId = {
          ...testData,
          id: testId
        };
        
        const result = await createReadingTest(testWithId);
        
        if (result.success) {
          toast.success('Test uploaded successfully!');
          setShowUploadModal(false);
          setSelectedFile(null);
          fetchTests();
        } else {
          toast.error(result.message || 'Failed to upload test');
        }
      }
    } catch (error) {
      console.error('Error uploading test:', error);
      toast.error('Error uploading test. Please check the JSON format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    try {
      if (testType === 'listening') {
        const { deleteListeningTest } = await import('@/lib/actions/listening-tests.actions');
        const result = await deleteListeningTest(testId);
        
        if (result.success) {
          toast.success('Test deleted successfully!');
          fetchTests();
        } else {
          toast.error(result.message || 'Failed to delete test');
        }
      } else {
        // Reading test deletion
        const { deleteReadingTest } = await import('@/lib/actions/admin.actions');
        const result = await deleteReadingTest(testId);
        
        if (result.success) {
          toast.success('Test deleted successfully!');
          fetchTests();
        } else {
          toast.error(result.message || 'Failed to delete test');
        }
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Error deleting test');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading tests...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{testTypeCapitalized} Test Manager</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Upload New Test
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{test.title}</h3>
              {test.difficulty && (
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  test.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {test.difficulty.toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Test ID:</span> {test.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Questions:</span> {test.totalQuestions}
              </p>
              {test.timeLimit && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time Limit:</span> {test.timeLimit} minutes
                </p>
              )}
              {test.totalTime && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Time:</span> {test.totalTime} minutes
                </p>
              )}
              {testType === 'listening' && test.sections && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Sections:</span> {test.sections.length}
                </p>
              )}
              {testType === 'reading' && test.passages && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Passages:</span> {test.passages.length}
                </p>
              )}
              {test.stats && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Attempts:</span> {test.stats.totalAttempts}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const jsonString = JSON.stringify(test, null, 2);
                  navigator.clipboard.writeText(jsonString);
                  toast.success('Test JSON copied to clipboard!');
                }}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Copy JSON
              </button>
              <button
                onClick={() => handleDeleteTest(test.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {testType} tests found.</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first test to get started.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload New {testTypeCapitalized} Test</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManager;
