'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {

      fetch('http://localhost:3005/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || 'User',
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('User synced:', data);
        })
        .catch(error => {
          console.error('Error syncing user:', error);
        });
    }
  }, [user, isLoaded]);

  return null;
}
