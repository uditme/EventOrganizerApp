'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, ArrowLeft, UserX, Mail, Download, Search } from 'lucide-react';

interface Attendee {
  _id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export default function ManageAttendeesPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    } else if (user && userProfile?.role === 'organizer') {
      fetchAttendees();
    }
  }, [user, userProfile, loading, router, eventId]);

  const fetchAttendees = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendees(data);
        setFilteredAttendees(data);
      } else {
        console.error('Failed to fetch attendees');
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const removeAttendee = async (attendeeId: string, attendeeName: string) => {
    if (!confirm(`Are you sure you want to remove ${attendeeName} from this event?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/attendees/${attendeeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (response.ok) {
        alert(`${attendeeName} has been removed from the event.`);
        fetchAttendees(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to remove attendee: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing attendee:', error);
      alert('Failed to remove attendee. Please try again.');
    }
  };

  const exportAttendees = () => {
    const csvContent = [
      ['Name', 'Email', 'Joined Date'],
      ...filteredAttendees.map(attendee => [
        attendee.name,
        attendee.email,
        new Date(attendee.joinedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-attendees-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter attendees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttendees(attendees);
    } else {
      const filtered = attendees.filter(attendee =>
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAttendees(filtered);
    }
  }, [searchTerm, attendees]);

  if (loading || loadingAttendees) {
    return <div>Loading attendees...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Manage Attendees</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Actions Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">
                  {filteredAttendees.length} {filteredAttendees.length === 1 ? 'Attendee' : 'Attendees'}
                </span>
              </div>
              {searchTerm && (
                <span className="text-sm text-gray-500">
                  (filtered from {attendees.length} total)
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {attendees.length > 0 && (
                <button
                  onClick={exportAttendees}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          {attendees.length > 0 && (
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search attendees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Attendees List */}
        {attendees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-medium text-gray-900 mb-2">No attendees yet</h4>
            <p className="text-gray-600">Share your event code to get people to join your event</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-medium text-gray-900 mb-2">No matches found</h4>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Attendee List</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAttendees.map((attendee) => (
                <div key={attendee._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {attendee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span>{attendee.email}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Joined on {new Date(attendee.joinedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeAttendee(attendee._id, attendee.name)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md transition-colors flex items-center space-x-1 text-sm"
                        title="Remove attendee from event"
                      >
                        <UserX className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

