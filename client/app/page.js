'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [bins, setBins] = useState([]);
  const [currentBin, setCurrentBin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load requests for a bin
  const loadRequests = async (binId) => {
    try {
      const response = await fetch(`http://localhost:3005/bin/${binId}/requests`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  // Refresh requests for current bin
  const refreshRequests = async () => {
    if (!currentBin) return;
    setRefreshing(true);
    await loadRequests(currentBin.binId);
    setRefreshing(false);
  };

  // Load bins from localStorage on component mount
  useEffect(() => {
    const savedBins = localStorage.getItem('webhook-bins');
    if (savedBins) {
      const parsedBins = JSON.parse(savedBins);
      setBins(parsedBins);
      // Auto-select the first bin if available
      if (parsedBins.length > 0) {
        setCurrentBin(parsedBins[0]);
        loadRequests(parsedBins[0].binId);
      }
    }
  }, []);

  // Save bins to localStorage whenever bins change
  useEffect(() => {
    if (bins.length > 0) {
      localStorage.setItem('webhook-bins', JSON.stringify(bins));
    }
  }, [bins]);

  // Create new bin
  const createBin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3005/bin/create', {
        method: 'POST',
      });
      const data = await response.json();
      const binId = data.binUrl.split('/').pop();
      const newBin = { binId, binUrl: data.binUrl };
      
      setBins(prev => [newBin, ...prev]);
      setCurrentBin(newBin);
    } catch (error) {
      console.error('Error creating bin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Select bin
  const selectBin = (bin) => {
    setCurrentBin(bin);
    loadRequests(bin.binId);
  };

  // Delete bin
  const deleteBin = (binId) => {
    const updatedBins = bins.filter(bin => bin.binId !== binId);
    setBins(updatedBins);
    
    if (currentBin?.binId === binId) {
      if (updatedBins.length > 0) {
        setCurrentBin(updatedBins[0]);
        loadRequests(updatedBins[0].binId);
      } else {
        setCurrentBin(null);
        setRequests([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Webhook Tester</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Bin Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Bin</h2>
            <button
              onClick={createBin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Bin'}
            </button>

            {bins.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Your Bins</h3>
                <div className="space-y-2">
                  {bins.map((bin) => (
                    <div
                      key={bin.binId}
                      className={`p-3 border rounded ${
                        currentBin?.binId === bin.binId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => selectBin(bin)}
                      >
                        <div className="font-mono text-sm text-gray-900 font-semibold">{bin.binId}</div>
                        <div className="text-xs text-gray-600">{bin.binUrl}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBin(bin.binId);
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Request Viewer */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Captured Requests</h2>
              {currentBin && (
                <button
                  onClick={refreshRequests}
                  disabled={refreshing}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
            </div>
            
            {!currentBin ? (
              <p className="text-gray-700 font-medium">Select a bin to view requests</p>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <div className="text-sm font-semibold text-gray-800">Webhook URL:</div>
                  <div className="font-mono text-sm break-all text-gray-900">
                    http://localhost:3005/bin/{currentBin.binId}
                  </div>
                </div>

                {requests.length === 0 ? (
                  <p className="text-gray-700 font-medium">No requests captured yet</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {requests.map((request, index) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.method === 'GET' ? 'bg-green-100 text-green-800' :
                            request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.method}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(request.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {request.headers && (
                          <div className="mb-2">
                            <div className="text-sm font-semibold text-gray-800">Headers:</div>
                            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto text-gray-900 font-mono">
                              {JSON.stringify(request.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {request.body && Object.keys(request.body).length > 0 && (
                          <div className="mb-2">
                            <div className="text-sm font-semibold text-gray-800">Body:</div>
                            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto text-gray-900 font-mono">
                              {JSON.stringify(request.body, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {request.query && Object.keys(request.query).length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-gray-800">Query:</div>
                            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto text-gray-900 font-mono">
                              {JSON.stringify(request.query, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}