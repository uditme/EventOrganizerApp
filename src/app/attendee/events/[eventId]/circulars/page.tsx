'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  MessageSquare,
  Mic,
  Type,
  Clock,
  Calendar,
  MapPin,
  Users
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
}

interface Circular {
  _id: string;
  type: 'text' | 'voice';
  content?: string;
  audioUrl?: string;
  sentAt: string;
  sentBy: string;
}

export default function AttendeeViewUpdatesPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
const params = useParams();
  const eventId = params?.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingCirculars, setLoadingCirculars] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'attendee')) {
      router.push('/');
    } else if (user && userProfile?.role === 'attendee') {
      fetchEvent();
      fetchCirculars();
    }
  }, [user, userProfile, loading, router, eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        console.error('Failed to fetch event');
        router.push('/attendee/dashboard');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/attendee/dashboard');
    } finally {
      setLoadingEvent(false);
    }
  };

  const fetchCirculars = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/circulars`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCirculars(data.sort((a: Circular, b: Circular) => 
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching circulars:', error);
    } finally {
      setLoadingCirculars(false);
    }
  };

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
          <button
            onClick={() => router.push('/attendee/dashboard')}
            className="text-green-600 hover:text-green-700"
          >
            Back to Dashboard
          </button>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Updates</h1>
              <p className="text-sm text-gray-600">{event.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Code: {event.eventCode}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">Organized by {event.organizerId.name}</span>
            </div>
          </div>
        </div>

        {/* Updates/Circulars */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Updates & Announcements</h3>
          </div>
          <div className="px-6 py-4">
            {loadingCirculars ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading updates...</p>
              </div>
            ) : circulars.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No updates yet</h4>
                <p className="text-gray-600">The organizer hasn't sent any updates for this event yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {circulars.map((circular) => (
                  <div key={circular._id} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {circular.type === 'text' ? (
                          <Type className="h-5 w-5 text-green-600" />
                        ) : (
                          <Mic className="h-5 w-5 text-blue-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {circular.type === 'text' ? 'Text Update' : 'Voice Update'}
                        </span>
                        <span className="text-sm text-gray-500">from {circular.sentBy}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(circular.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {circular.type === 'text' ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{circular.content}</p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Mic className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-blue-700 font-medium">Voice Message</span>
                        </div>
                        <audio controls className="w-full mt-3">
                          <source src={circular.audioUrl} type="audio/webm" />
                          <source src={circular.audioUrl} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Stay Updated</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• All updates from the event organizer will appear here</li>
            <li>• Check this page regularly for important announcements</li>
            <li>• Voice messages can be played by clicking the audio controls</li>
            <li>• You can provide feedback to the organizer from your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
