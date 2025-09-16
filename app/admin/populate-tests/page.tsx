"use client";

import { useState } from 'react';

export default function PopulateTestsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePopulate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/populate-listening-tests', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-black mb-8">Admin: Populate Listening Tests</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-6">
            This will populate your Firestore database with listening tests from the JSON files in the public directory.
          </p>
          
          <button
            onClick={handlePopulate}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Populating...' : 'Populate Listening Tests'}
          </button>
          
          {result && (
            <div className="mt-6 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              
              {result.success ? (
                <div>
                  <p className="text-green-600 mb-2">{result.message}</p>
                  
                  {result.results && (
                    <div className="mb-4">
                      <h4 className="font-semibold">Import Results:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {result.results.map((res: string, index: number) => (
                          <li key={index}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.documentIds && (
                    <div>
                      <h4 className="font-semibold">Documents in Database:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {result.documentIds.map((id: string, index: number) => (
                          <li key={index}>{id}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-600">{result.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}