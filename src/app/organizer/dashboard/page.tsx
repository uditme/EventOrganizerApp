'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  Plus,
  LogOut,
  Star,
  Send
} from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  eventCode: string;
  attendees: any[];
  createdAt: string;
}

export default function OrganizerDashboard() {
  const { user, userProfile, logout, loading, setUserRole } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const handleBecomeOrganizer = async () => {
    if (user && userProfile) {
      try {
        await setUserRole('organizer');
        // Force a page refresh to update the UI
        window.location.reload();
      } catch (error) {
        console.error('Error setting organizer role:', error);
        alert('Failed to set organizer role. Please try again.');
      }
    }
  };

  useEffect(() => {
    console.log('Dashboard - User:', user?.email);
    console.log('Dashboard - User Profile:', userProfile);
    console.log('Dashboard - Role:', userProfile?.role);
    
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && userProfile?.role === 'organizer') {
      fetchEvents();
    }
  }, [user, userProfile, loading, router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events/organizer', {
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  if (loading || loadingEvents) {
    return <Loading text="Loading Organizer Dashboard..." fullScreen />;
  }

  // Show role conversion interface if user is not an organizer
  if (user && userProfile && userProfile.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Become an Organizer</h1>
            <p className="text-gray-600 mb-2">Current role: <span className="font-medium">{userProfile.role}</span></p>
            <p className="text-gray-600 mb-6">You need organizer permissions to access this dashboard.</p>
            <button
              onClick={handleBecomeOrganizer}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              Switch to Organizer Role
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user?.displayName || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user?.displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/organizer/create-event')}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Event</span>
            </button>
            <button
              onClick={() => router.push('/organizer/feedback')}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Star className="h-5 w-5" />
              <span>View Feedback</span>
            </button>
            <button
              onClick={() => router.push('/organizer/complaints')}
              className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5" />
              <span>View Complaints</span>
            </button>
            <button
              onClick={() => router.push('/organizer/chat')}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat Room</span>
            </button>
          </div>
        </div>

        {/* Events Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Events</h2>
            <button
              onClick={() => router.push('/organizer/create-event')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Event</span>
            </button>
          </div>
          
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started</p>
              <button
                onClick={() => router.push('/organizer/create-event')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {event.eventCode}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{event.attendees.length} attendees</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => router.push(`/organizer/events/${event._id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => router.push(`/organizer/events/${event._id}/circulars`)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send Update</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
