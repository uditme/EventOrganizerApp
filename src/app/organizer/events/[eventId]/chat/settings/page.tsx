'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ChatSettingsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading Chat Settings...</p>
          <p className="text-sm text-gray-500">Please wait...</p>
          <p className="text-xs text-gray-400">Event Organizer App by Udit</p>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading...</p>
          <p className="text-sm text-gray-500">Please wait...</p>
          <p className="text-xs text-gray-400">Event Organizer App by Udit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push(`/organizer/events/${eventId}/chat`)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Chat
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Chat Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-medium text-gray-900">Settings</h2>
        <p className="text-sm text-gray-600">This section will allow you to configure the chat settings for your event.</p>
        {/* Placeholder for settings form */}
        <div className="mt-6 bg-white shadow p-6 rounded-lg">
          <p className="text-gray-600">Coming Soon: Custom chat room settings!</p>
        </div>
      </div>
    </div>
  );
}

