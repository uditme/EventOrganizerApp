'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  ArrowLeft,
  Send,
  Trash2,
  MapPin,
  Copy,
  CheckCircle
} from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  eventCode: string;
  attendees: any[];
  circulars: any[];
  createdAt: string;
}

interface Attendee {
  _id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export default function ManageEventPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    } else if (user && userProfile?.role === 'organizer') {
      fetchEvent();
      fetchAttendees();
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
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/organizer/dashboard');
    } finally {
      setLoadingEvent(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const copyEventCode = async () => {
    if (event) {
      await navigator.clipboard.writeText(event.eventCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deleteEvent = async () => {
    if (!event) return;
    
    if (confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
        });
        
        if (response.ok) {
          alert('Event deleted successfully');
          router.push('/organizer/dashboard');
        } else {
          alert('Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading Event...</p>
          <p className="text-sm text-gray-500">Please wait...</p>
          <p className="text-xs text-gray-400">Event Organizer App by Udit</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h1>
          <button
            onClick={() => router.push('/organizer/dashboard')}
            className="text-blue-600 hover:text-blue-700"
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
            <h1 className="text-2xl font-bold text-gray-900">Manage Event</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Code: {event.eventCode}
                </span>
                <button
                  onClick={copyEventCode}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/organizer/events/${eventId}/circulars`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Update</span>
              </button>
              <button
                onClick={deleteEvent}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString()} at{' '}
                  {new Date(event.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Attendees</p>
                <p className="text-sm text-gray-600">{attendees.length} registered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push(`/organizer/events/${eventId}/circulars`)}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Send className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Send Updates</h3>
            </div>
            <p className="text-gray-600">Send text or voice circulars to all attendees</p>
          </button>

          <button
            onClick={() => router.push(`/organizer/events/${eventId}/feedback`)}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">View Feedback</h3>
            </div>
            <p className="text-gray-600">Check feedback from event attendees</p>
          </button>

          <button
            onClick={() => router.push(`/organizer/events/${eventId}/attendees`)}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Users className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">Manage Attendees</h3>
            </div>
            <p className="text-gray-600">View and manage event attendees</p>
          </button>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Attendees</h3>
          </div>
          <div className="px-6 py-4">
            {attendees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h4>
                <p className="text-gray-600">Share your event code to get attendees to join</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendees.slice(0, 5).map((attendee) => (
                  <div key={attendee._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{attendee.name}</p>
                      <p className="text-sm text-gray-600">{attendee.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(attendee.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {attendees.length > 5 && (
                  <button
                    onClick={() => router.push(`/organizer/events/${eventId}/attendees`)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View all {attendees.length} attendees →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
