'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Users,
  MessageSquare
} from 'lucide-react';

interface Event {
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
  createdAt: string;
}

export default function AttendeeFeedbackPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'attendee')) {
      router.push('/');
    } else if (user && userProfile?.role === 'attendee') {
      fetchEvents();
    }
  }, [user, userProfile, loading, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events/attendee', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (loading || loadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading Feedback...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Give Feedback</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-blue-900 mb-2">Share Your Experience</h2>
          <p className="text-blue-700">
            Select an event below to share your feedback and help organizers improve future events.
          </p>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Events</h3>
            <p className="text-sm text-gray-600">Choose an event to give feedback</p>
          </div>
          <div className="px-6 py-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No events to review</h4>
                <p className="text-gray-600 mb-4">You haven't joined any events yet.</p>
                <button
                  onClick={() => router.push('/attendee/join')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Your First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {event.eventCode}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Organized by {event.organizerId.name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button
                          onClick={() => router.push(`/attendee/events/${event._id}/feedback`)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Star className="h-4 w-4" />
                          <span>Give Feedback</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">About Event Feedback</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Rate events from 1 to 5 stars based on your experience</li>
            <li>• Share detailed comments to help organizers improve</li>
            <li>• Your feedback is visible to other attendees and organizers</li>
            <li>• You can only submit feedback once per event</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
