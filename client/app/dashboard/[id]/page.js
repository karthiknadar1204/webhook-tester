'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function BinDetail() {
  const params = useParams();
  const router = useRouter();
  const binId = params.id;
  
  const [bin, setBin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Fetch bin details
  const fetchBin = async () => {
    try {
      const response = await fetch(`https://webhook-tester-production-5c77.up.railway.app/bin/${binId}`);
      if (!response.ok) {
        setNotFound(true);
        return;
      }
      const data = await response.json();
      setBin(data);
    } catch (error) {
      console.error('Error fetching bin:', error);
      setNotFound(true);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const response = await fetch(`https://webhook-tester-production-5c77.up.railway.app/bin/${binId}/requests`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    if (binId) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchBin(), fetchRequests()]);
        setLoading(false);
      };
      loadData();
    }
  }, [binId]);

  const refreshRequests = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !bin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center py-12">
            <div className="text-gray-600">Bin not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bin: {bin.binId}</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">Webhook URL:</div>
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded">
              <div className="font-mono text-sm break-all text-gray-900 flex-1">
                {bin.binUrl}
              </div>
              <button
                onClick={() => copyToClipboard(bin.binUrl)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Captured Requests</h2>
            <button
              onClick={refreshRequests}
              disabled={refreshing}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
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
      </div>
    </div>
  );
}
