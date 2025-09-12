"use client";

import React, { useState, useEffect } from 'react';
import { ListeningTest } from '@/types/listening';
import { getListeningTests, createListeningTest, getListeningTestAnalytics } from '@/lib/actions/listening-tests.actions';
import { toast } from 'sonner';

const ListeningTestManager: React.FC = () => {
  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTests();
  }, [selectedDifficulty]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const result = await getListeningTests(selectedDifficulty || undefined);
      if (result.success) {
        setTests(result.data);
      } else {
        toast.error('Failed to load tests');
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TestCard: React.FC<{ test: ListeningTest }> = ({ test }) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const loadAnalytics = async () => {
      if (!showAnalytics) {
        const result = await getListeningTestAnalytics(test.id);
        if (result.success) {
          setAnalytics(result.data);
        }
      }
      setShowAnalytics(!showAnalytics);
    };

    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-black mb-2">{test.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{test.metadata.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(test.difficulty)}`}>
                {test.difficulty.toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {test.totalQuestions} Questions
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                {test.sections.length} Sections
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {test.metadata.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={loadAnalytics}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Edit
            </button>
            <button className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>

        {/* Test Sections Overview */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Sections:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {test.sections.map((section, index) => (
              <div key={section.id} className="bg-gray-50 rounded p-3 border">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-sm">Section {index + 1}: {section.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">{section.questions.length} questions</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {section.questions.map(q => q.type).join(', ').substring(0, 30)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics */}
        {showAnalytics && analytics && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Test Analytics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalAttempts}</div>
                <div className="text-xs text-blue-700">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.averageScore}%</div>
                <div className="text-xs text-blue-700">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.averageBandScore}</div>
                <div className="text-xs text-blue-700">Average Band</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(analytics.averageTimeSpent / 60)}m</div>
                <div className="text-xs text-blue-700">Average Time</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>Created: {new Date(test.metadata.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(test.metadata.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-black">Listening Test Manager</h1>
          <p className="text-gray-600 mt-2">Manage IELTS listening tests and view analytics</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create New Test
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Tests</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or tags..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTests}
              className="w-full btn-secondary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{tests.length}</div>
          <div className="text-sm text-gray-600">Total Tests</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{tests.filter(t => t.difficulty === 'easy').length}</div>
          <div className="text-sm text-gray-600">Easy Tests</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{tests.filter(t => t.difficulty === 'medium').length}</div>
          <div className="text-sm text-gray-600">Medium Tests</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{tests.filter(t => t.difficulty === 'hard').length}</div>
          <div className="text-sm text-gray-600">Hard Tests</div>
        </div>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No tests found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or create a new test.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTests.map(test => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeningTestManager;