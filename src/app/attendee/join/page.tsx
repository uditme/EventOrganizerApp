'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Calendar, MapPin, Users } from 'lucide-react';

interface EventDetails {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  eventCode: string;
  organizerId: {
    name: string;
    email: string;
  };
  attendees: any[];
}

export default function JoinEventPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [eventCode, setEventCode] = useState('');
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'attendee')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  const searchEvent = async () => {
    if (!eventCode.trim()) {
      setError('Please enter an event code');
      return;
    }

    setIsSearching(true);
    setError('');
    setEventDetails(null);

    try {
      const response = await fetch(`/api/events/search?code=${eventCode.trim()}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (response.ok) {
        const event = await response.json();
        setEventDetails(event);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Event not found');
      }
    } catch (error) {
      console.error('Error searching event:', error);
      setError('Failed to search for event. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const joinEvent = async () => {
    if (!eventDetails || !user) return;

    setIsJoining(true);
    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ eventCode: eventDetails.eventCode }),
      });

      if (response.ok) {
        router.push('/attendee/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      setError('Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading Join Event...</p>
          <p className="text-sm text-gray-500">Please wait...</p>
          <p className="text-xs text-gray-400">Event Organizer App by Udit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Join Event</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Enter Event Code</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character event code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
                maxLength={6}
              />
            </div>
            <button
              onClick={searchEvent}
              disabled={isSearching || !eventCode.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Event Details */}
        {eventDetails && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{eventDetails.name}</h3>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                {eventDetails.eventCode}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">{eventDetails.description}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{new Date(eventDetails.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{eventDetails.location}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Users className="h-5 w-5 text-gray-400" />
                <span>Organized by {eventDetails.organizerId.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Users className="h-5 w-5 text-gray-400" />
                <span>{eventDetails.attendees.length} attendees</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setEventDetails(null);
                  setEventCode('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Search Another
              </button>
              <button
                onClick={joinEvent}
                disabled={isJoining}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join Event'}
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">How to join an event?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Get the 6-character event code from the organizer</li>
            <li>• Enter the code in the search box above</li>
            <li>• Review the event details and click "Join Event"</li>
            <li>• You'll receive updates and can give feedback once joined</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
