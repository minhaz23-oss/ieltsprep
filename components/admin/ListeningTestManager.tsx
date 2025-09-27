"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminListeningTest, ListeningTest } from '@/types/listening';

interface ListeningTestManagerProps {
  isAdmin: boolean;
}

const ListeningTestManager: React.FC<ListeningTestManagerProps> = ({ isAdmin }) => {
  const [tests, setTests] = useState<AdminListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingTest, setEditingTest] = useState<AdminListeningTest | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'sections' | 'advanced'>('metadata');

  useEffect(() => {
    if (isAdmin) {
      fetchTests();
    }
  }, [isAdmin]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { getListeningTestsWithStats } = await import('@/lib/actions/admin.actions');
      const result = await getListeningTestsWithStats();
      
      if (result.success) {
        setTests(result.data as AdminListeningTest[]);
      } else {
        toast.error('Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Error fetching tests');
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
      const testData = JSON.parse(fileContent);

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
      const { deleteListeningTest } = await import('@/lib/actions/listening-tests.actions');
      const result = await deleteListeningTest(testId);

      if (result.success) {
        toast.success('Test deleted successfully!');
        fetchTests();
      } else {
        toast.error(result.message || 'Failed to delete test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Error deleting test');
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;

    try {
      const { updateListeningTest } = await import('@/lib/actions/listening-tests.actions');
      const result = await updateListeningTest(editingTest.id, editingTest);

      if (result.success) {
        toast.success('Test updated successfully!');
        setShowEditModal(false);
        setEditingTest(null);
        fetchTests();
      } else {
        toast.error(result.message || 'Failed to update test');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Error updating test');
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
        <h1 className="text-3xl font-bold text-gray-900">Listening Test Manager</h1>
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
              <h3 className="text-lg font-semibold text-gray-900 truncate">{test.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                test.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {test.difficulty.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Questions:</span> {test.totalQuestions}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time Limit:</span> {test.timeLimit} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Sections:</span> {test.sections.length}
              </p>
              {test.stats && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Attempts:</span> {test.stats.totalAttempts}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingTest(test);
                  setShowEditModal(true);
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Edit
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
          <p className="text-gray-500 text-lg">No listening tests found.</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first test to get started.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload New Listening Test</h2>
            
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

      {/* Edit Modal */}
      {showEditModal && editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Listening Test</h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'metadata' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('metadata')}
              >
                Metadata
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'sections' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('sections')}
              >
                Sections ({editingTest.sections.length})
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'advanced' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced Editor
              </button>
            </div>

            {activeTab === 'metadata' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingTest.title}
                    onChange={(e) => setEditingTest({...editingTest, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={editingTest.difficulty}
                    onChange={(e) => setEditingTest({...editingTest, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={editingTest.timeLimit}
                    onChange={(e) => setEditingTest({...editingTest, timeLimit: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingTest.metadata.description}
                    onChange={(e) => setEditingTest({
                      ...editingTest,
                      metadata: {...editingTest.metadata, description: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingTest.metadata.tags.join(', ')}
                    onChange={(e) => setEditingTest({
                      ...editingTest,
                      metadata: {...editingTest.metadata, tags: e.target.value.split(',').map(tag => tag.trim())}
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4">
                {editingTest.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold">Section {sectionIndex + 1}: {section.title}</h4>
                      <button
                        onClick={() => {
                          const newSections = editingTest.sections.filter((_, i) => i !== sectionIndex);
                          setEditingTest({...editingTest, sections: newSections});
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Section
                      </button>
                    </div>

                    {/* Basic Section Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...editingTest.sections];
                            newSections[sectionIndex].title = e.target.value;
                            setEditingTest({...editingTest, sections: newSections});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL</label>
                        <input
                          type="text"
                          value={section.audioUrl}
                          onChange={(e) => {
                            const newSections = [...editingTest.sections];
                            newSections[sectionIndex].audioUrl = e.target.value;
                            setEditingTest({...editingTest, sections: newSections});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Custom Section Fields */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                        <button
                          onClick={() => {
                            const newSections = [...editingTest.sections];
                            if (!newSections[sectionIndex].customFields) {
                              newSections[sectionIndex].customFields = {};
                            }
                            const fieldName = prompt('Enter field name:');
                            if (fieldName) {
                              const fieldValue = prompt(`Enter value for ${fieldName}:`);
                              if (fieldValue !== null) {
                                newSections[sectionIndex].customFields![fieldName] = fieldValue;
                                setEditingTest({...editingTest, sections: newSections});
                              }
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Add Field
                        </button>
                      </div>

                      {section.customFields && Object.entries(section.customFields).map(([fieldName, fieldValue]) => (
                        <div key={fieldName} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700 min-w-[120px]">{fieldName}:</span>
                          <input
                            type="text"
                            value={fieldValue as string}
                            onChange={(e) => {
                              const newSections = [...editingTest.sections];
                              if (!newSections[sectionIndex].customFields) {
                                newSections[sectionIndex].customFields = {};
                              }
                              newSections[sectionIndex].customFields![fieldName] = e.target.value;
                              setEditingTest({...editingTest, sections: newSections});
                            }}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => {
                              const newSections = [...editingTest.sections];
                              if (newSections[sectionIndex].customFields) {
                                delete newSections[sectionIndex].customFields![fieldName];
                                setEditingTest({...editingTest, sections: newSections});
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Groups ({section.questionGroups.length})</label>
                      {section.questionGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="border border-gray-300 rounded p-3 mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">Question Group {groupIndex + 1}</h5>
                            <button
                              onClick={() => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].questionGroups = newSections[sectionIndex].questionGroups.filter((_, i) => i !== groupIndex);
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove Group
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
                              <input
                                type="text"
                                value={group.groupId}
                                onChange={(e) => {
                                  const newSections = [...editingTest.sections];
                                  newSections[sectionIndex].questionGroups[groupIndex].groupId = e.target.value;
                                  setEditingTest({...editingTest, sections: newSections});
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Display Type</label>
                              <select
                                value={group.displayType}
                                onChange={(e) => {
                                  const newSections = [...editingTest.sections];
                                  newSections[sectionIndex].questionGroups[groupIndex].displayType = e.target.value as any;
                                  setEditingTest({...editingTest, sections: newSections});
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                <option value="form">Form</option>
                                <option value="single-choice">Single Choice</option>
                                <option value="multiple-answer">Multiple Answer</option>
                                <option value="matching">Matching</option>
                                <option value="notes">Notes</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                            <textarea
                              value={group.instructions}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].questionGroups[groupIndex].instructions = e.target.value;
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16"
                            />
                          </div>

                          {/* Custom Question Group Fields */}
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                              <button
                                onClick={() => {
                                  const newSections = [...editingTest.sections];
                                  if (!newSections[sectionIndex].questionGroups[groupIndex].customFields) {
                                    newSections[sectionIndex].questionGroups[groupIndex].customFields = {};
                                  }
                                  const fieldName = prompt('Enter field name:');
                                  if (fieldName) {
                                    const fieldValue = prompt(`Enter value for ${fieldName}:`);
                                    if (fieldValue !== null) {
                                      newSections[sectionIndex].questionGroups[groupIndex].customFields![fieldName] = fieldValue;
                                      setEditingTest({...editingTest, sections: newSections});
                                    }
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Add Field
                              </button>
                            </div>

                            {group.customFields && Object.entries(group.customFields).map(([fieldName, fieldValue]) => (
                              <div key={fieldName} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700 min-w-[120px]">{fieldName}:</span>
                                <input
                                  type="text"
                                  value={fieldValue as string}
                                  onChange={(e) => {
                                    const newSections = [...editingTest.sections];
                                    if (!newSections[sectionIndex].questionGroups[groupIndex].customFields) {
                                      newSections[sectionIndex].questionGroups[groupIndex].customFields = {};
                                    }
                                    newSections[sectionIndex].questionGroups[groupIndex].customFields![fieldName] = e.target.value;
                                    setEditingTest({...editingTest, sections: newSections});
                                  }}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <button
                                  onClick={() => {
                                    const newSections = [...editingTest.sections];
                                    if (newSections[sectionIndex].questionGroups[groupIndex].customFields) {
                                      delete newSections[sectionIndex].questionGroups[groupIndex].customFields![fieldName];
                                      setEditingTest({...editingTest, sections: newSections});
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm px-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newSections = [...editingTest.sections];
                          newSections[sectionIndex].questionGroups.push({
                            groupId: `group_${Date.now()}`,
                            instructions: 'New question group instructions',
                            displayType: 'form',
                            content: {
                              type: 'questions',
                              fields: []
                            }
                          });
                          setEditingTest({...editingTest, sections: newSections});
                        }}
                        className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Add Question Group
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newSection = {
                      id: editingTest.sections.length + 1,
                      title: `Section ${editingTest.sections.length + 1}`,
                      audioUrl: '',
                      questionGroups: []
                    };
                    setEditingTest({
                      ...editingTest,
                      sections: [...editingTest.sections, newSection]
                    });
                  }}
                  className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
                >
                  Add New Section
                </button>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Raw JSON Editor */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Raw JSON Editor</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const jsonString = JSON.stringify(editingTest, null, 2);
                          navigator.clipboard.writeText(jsonString);
                          toast.success('JSON copied to clipboard!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy JSON
                      </button>
                      <button
                        onClick={() => {
                          const textarea = document.querySelector('#json-editor') as HTMLTextAreaElement;
                          if (textarea) {
                            try {
                              const parsed = JSON.parse(textarea.value);
                              setEditingTest(parsed);
                              toast.success('JSON updated successfully!');
                            } catch (error) {
                              toast.error('Invalid JSON format');
                            }
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="json-editor"
                    value={JSON.stringify(editingTest, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditingTest(parsed);
                      } catch (error) {
                        // Invalid JSON, don't update state
                      }
                    }}
                    className="w-full h-96 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                    placeholder="Edit the complete test JSON here..."
                  />
                </div>

                {/* Quick Field Editor */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Field Editor</h3>

                  {/* Test Level Fields */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-3">Test Properties</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test ID</label>
                        <input
                          type="text"
                          value={editingTest.id}
                          onChange={(e) => setEditingTest({...editingTest, id: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                        <input
                          type="number"
                          value={editingTest.totalQuestions}
                          onChange={(e) => setEditingTest({...editingTest, totalQuestions: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section Fields Editor */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-3">Section Properties</h4>
                    {editingTest.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border border-gray-200 rounded p-3 mb-3">
                        <h5 className="font-medium mb-2">Section {sectionIndex + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section ID</label>
                            <input
                              type="number"
                              value={section.id}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].id = parseInt(e.target.value);
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].title = e.target.value;
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL</label>
                            <input
                              type="text"
                              value={section.audioUrl}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].audioUrl = e.target.value;
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Question Group Content Editor */}
                  <div>
                    <h4 className="text-md font-medium mb-3">Question Group Content</h4>
                    {editingTest.sections.map((section, sectionIndex) =>
                      section.questionGroups.map((group, groupIndex) => (
                        <div key={`${sectionIndex}-${groupIndex}`} className="border border-gray-200 rounded p-3 mb-3">
                          <h5 className="font-medium mb-2">Section {sectionIndex + 1} - Group {groupIndex + 1}</h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
                              <input
                                type="text"
                                value={group.groupId}
                                onChange={(e) => {
                                  const newSections = [...editingTest.sections];
                                  newSections[sectionIndex].questionGroups[groupIndex].groupId = e.target.value;
                                  setEditingTest({...editingTest, sections: newSections});
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Display Type</label>
                              <select
                                value={group.displayType}
                                onChange={(e) => {
                                  const newSections = [...editingTest.sections];
                                  newSections[sectionIndex].questionGroups[groupIndex].displayType = e.target.value as any;
                                  setEditingTest({...editingTest, sections: newSections});
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                <option value="form">Form</option>
                                <option value="single-choice">Single Choice</option>
                                <option value="multiple-answer">Multiple Answer</option>
                                <option value="matching">Matching</option>
                                <option value="notes">Notes</option>
                              </select>
                            </div>
                          </div>

                          {/* Content Type Selector */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                            <select
                              value={group.content.type}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].questionGroups[groupIndex].content.type = e.target.value;
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="questions">Questions</option>
                              <option value="form">Form</option>
                              <option value="matching">Matching</option>
                              <option value="notes">Notes</option>
                            </select>
                          </div>

                          {/* Dynamic Content Editor based on type */}
                          {group.content.type === 'questions' && (
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Questions (JSON)</label>
                              <textarea
                                value={JSON.stringify(group.content.questions || [], null, 2)}
                                onChange={(e) => {
                                  try {
                                    const questions = JSON.parse(e.target.value);
                                    const newSections = [...editingTest.sections];
                                    newSections[sectionIndex].questionGroups[groupIndex].content.questions = questions;
                                    setEditingTest({...editingTest, sections: newSections});
                                  } catch (error) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-20 font-mono"
                                placeholder="Enter questions array as JSON"
                              />
                            </div>
                          )}

                          {group.content.type === 'form' && (
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fields (JSON)</label>
                              <textarea
                                value={JSON.stringify(group.content.fields || [], null, 2)}
                                onChange={(e) => {
                                  try {
                                    const fields = JSON.parse(e.target.value);
                                    const newSections = [...editingTest.sections];
                                    newSections[sectionIndex].questionGroups[groupIndex].content.fields = fields;
                                    setEditingTest({...editingTest, sections: newSections});
                                  } catch (error) {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-20 font-mono"
                                placeholder="Enter fields array as JSON"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                            <textarea
                              value={group.instructions}
                              onChange={(e) => {
                                const newSections = [...editingTest.sections];
                                newSections[sectionIndex].questionGroups[groupIndex].instructions = e.target.value;
                                setEditingTest({...editingTest, sections: newSections});
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTest(null);
                  setActiveTab('metadata');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTest}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Update Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeningTestManager;