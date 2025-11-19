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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            ← Back to Dashboard
          </button>
          <span className="text-sm text-gray-500">
            Last refreshed {new Date().toLocaleTimeString()}
          </span>
        </div>

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Bin overview</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Bin {bin.binId}
          </h1>
          <p className="text-gray-600">
            Monitor inbound webhook requests for this bin in real time. Copy the URL below into any service
            that supports webhooks to start capturing payloads instantly.
          </p>
        </header>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-2">Webhook URL</div>
              <div className="text-xs text-gray-500">Share this endpoint with any provider to capture the payload.</div>
            </div>
            <span className="inline-flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {requests.length} captured {requests.length === 1 ? 'request' : 'requests'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <div className="font-mono text-sm break-all text-gray-900 flex-1">
              {bin.binUrl}
            </div>
            <button
              onClick={() => copyToClipboard(bin.binUrl)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Captured Requests</h2>
              <p className="text-sm text-gray-500">Live feed of the most recent payloads received by this bin.</p>
            </div>
            <button
              onClick={refreshRequests}
              disabled={refreshing}
              className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Refresh feed'}
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-600 font-medium">No requests captured yet</p>
              <p className="text-sm text-gray-500 mt-2">Send a webhook payload to this bin to see it appear here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-112 overflow-y-auto pr-2">
              {requests.map((request, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors bg-gray-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        request.method === 'GET' ? 'bg-emerald-100 text-emerald-800' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        request.method === 'PUT' ? 'bg-amber-100 text-amber-900' :
                        request.method === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {request.method}
                      </span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                        #{requests.length - index}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {request.headers && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Headers</div>
                      <pre className="text-sm bg-white border border-gray-200 p-3 rounded-lg overflow-x-auto text-gray-900 font-mono">
                        {JSON.stringify(request.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {request.body && Object.keys(request.body).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Body</div>
                      <pre className="text-sm bg-white border border-gray-200 p-3 rounded-lg overflow-x-auto text-gray-900 font-mono">
                        {JSON.stringify(request.body, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {request.query && Object.keys(request.query).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Query</div>
                      <pre className="text-sm bg-white border border-gray-200 p-3 rounded-lg overflow-x-auto text-gray-900 font-mono">
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
