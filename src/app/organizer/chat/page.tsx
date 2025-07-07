'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  Search,
  Settings,
  Shield
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

export default function OrganizerChatPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    } else if (user && userProfile?.role === 'organizer') {
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

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading Chat Management...</p>
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
              onClick={() => router.push('/organizer/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Chat Room Management</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-medium text-purple-900">Event Chat Room Administration</h2>
          </div>
          <p className="text-purple-700">
            Moderate and manage chat rooms for your events. Monitor discussions, engage with attendees, and ensure a positive experience for all participants.
          </p>
        </div>

        {/* Search */}
        {events.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Event Chat Rooms</h3>
            <p className="text-sm text-gray-600">Manage chat rooms for events you're organizing</p>
          </div>
          <div className="px-6 py-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No chat rooms to manage</h4>
                <p className="text-gray-600 mb-4">Create events to set up chat rooms for attendee discussions.</p>
                <button
                  onClick={() => router.push('/organizer/create-event')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Event
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No events match your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
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
                            <span className="text-gray-600">{event.attendees.length} attendees</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex space-x-2">
                        <button
                          onClick={() => router.push(`/organizer/events/${event._id}/chat/settings`)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={() => router.push(`/organizer/events/${event._id}/chat`)}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Moderate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Moderation Features */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Moderation Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <ul className="space-y-2">
              <li>• Monitor all chat conversations</li>
              <li>• Remove inappropriate messages</li>
              <li>• Engage directly with attendees</li>
            </ul>
            <ul className="space-y-2">
              <li>• Set chat room guidelines</li>
              <li>• Mute disruptive participants</li>
              <li>• Pin important announcements</li>
            </ul>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Coming Soon</h4>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Event-specific chat room management is currently under development. This feature will provide comprehensive tools for moderating attendee discussions and fostering community engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
