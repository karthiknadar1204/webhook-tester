import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Webhook Tester
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Test, debug, and monitor webhooks in real-time
          </p>
          
          <SignedOut>
            <div className="space-y-4">
              <p className="text-gray-700 mb-8">
                Sign in to start testing webhooks
              </p>
            </div>
          </SignedOut>
          
          <SignedIn>
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}