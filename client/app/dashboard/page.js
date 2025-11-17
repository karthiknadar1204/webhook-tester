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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bins</h1>
          <button
            onClick={createBin}
            disabled={creating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Bin'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading bins...</div>
        ) : bins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No bins yet. Create your first bin to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bins.map((bin) => (
              <div key={bin.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Bin ID</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{bin.binId}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Webhook URL</div>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <div className="font-mono text-xs text-gray-700 break-all flex-1">
                      {bin.binUrl}
                    </div>
                    <button
                      onClick={() => copyToClipboard(bin.binUrl, bin.binId)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 whitespace-nowrap"
                    >
                      {copiedId === bin.binId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/${bin.binId}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Logs
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}