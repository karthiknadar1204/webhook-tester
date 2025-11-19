'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = async (text, binId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(binId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };


  const fetchBins = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://webhook-tester-production-5c77.up.railway.app/bin/user/${user.id}`);
      const data = await response.json();
      setBins(data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (isLoaded && user) {
      fetchBins();
    }
  }, [isLoaded, user]);


  const createBin = async () => {
    if (!user?.id) return;
    
    setCreating(true);
    try {
      const response = await fetch('https://webhook-tester-production-5c77.up.railway.app/bin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clerkId: user.id }),
      });
      
      if (response.ok) {
        await fetchBins();
      }
    } catch (error) {
      console.error('Error creating bin:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="container mx-auto max-w-6xl space-y-8">
        <header className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Webhook bins</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Your collection of webhook bins</h1>
            <p className="text-gray-600">
              Create bins to capture and inspect payloads from Stripe, GitHub, or any third-party integration.
              Each bin keeps a rolling history of the most recent requests for quick debugging.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {bins.length} active {bins.length === 1 ? 'bin' : 'bins'}
            </div>
          </div>
          <button
            onClick={createBin}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-60 transition-colors"
          >
            {creating ? 'Creating...' : 'Create new bin'}
          </button>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-600">Loading your bins...</p>
          </div>
        ) : bins.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-3">
            <p className="text-lg font-semibold text-gray-900">No bins yet</p>
            <p className="text-gray-600">Create your first bin to start capturing webhook payloads.</p>
            <button
              onClick={createBin}
              disabled={creating}
              className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create your first bin'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bins.map((bin) => (
              <div key={bin.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 hover:border-gray-200 transition-colors">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bin ID</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{bin.binId}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Webhook URL</div>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <div className="font-mono text-xs text-gray-700 break-all flex-1">
                      {bin.binUrl}
                    </div>
                    <button
                      onClick={() => copyToClipboard(bin.binUrl, bin.binId)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 whitespace-nowrap transition-colors"
                    >
                      {copiedId === bin.binId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/${bin.binId}`)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors"
                >
                  View captured requests →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}