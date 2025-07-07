'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  Send,
  Settings,
  Shield,
  Trash2,
  AlertTriangle,
  Paperclip,
  Image,
  Download
} from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  eventCode: string;
  attendees: { userId: string; name: string; email: string }[];
  organizerId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Message {
  _id: string;
  userId: string;
  senderName: string;
  content: string;
  sentAt: string;
  type: 'text' | 'announcement' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export default function OrganizerEventChatPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    } else if (user && userProfile?.role === 'organizer' && eventId) {
      fetchEvent();
      fetchMessages();
    }
  }, [user, userProfile, loading, eventId, router]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        
        // Get the current user's database ID
        const userResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Check if user is the organizer of this event
          const isEventOwner = eventData.organizerId._id === userData._id;
          setIsOwner(isEventOwner);
          
          if (!isEventOwner) {
            router.push('/organizer/dashboard');
          }
        } else {
          router.push('/organizer/dashboard');
        }
      } else {
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/organizer/dashboard');
    } finally {
      setLoadingEvent(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/chat`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      let fileData = {};
      if (selectedFile) {
        // In a real implementation, you would upload the file to cloud storage first
        // For now, we'll just use placeholder data
        fileData = {
          fileUrl: URL.createObjectURL(selectedFile),
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type
        };
      }

      const response = await fetch(`/api/events/${eventId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage || selectedFile?.name || '',
          type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : (isAnnouncement ? 'announcement' : 'text'),
          ...fileData
        }),
      });

      if (response.ok) {
        await fetchMessages(); // Refresh messages
        setNewMessage('');
        setIsAnnouncement(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/chat/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (response.ok) {
        await fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!eventId) {
    return <div>Loading...</div>;
  }

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-sm text-gray-600">Event Chat - Organizer View</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/organizer/events/${eventId}/chat/settings`)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                <span>Chat Settings</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{event.attendees.length} attendees</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Event Info Bar */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-3">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {event.eventCode}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-xs font-medium">Moderator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation with your attendees!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.type === 'announcement' ? 'justify-center' : 'justify-start'} group`}
              >
                {message.type === 'announcement' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">{message.senderName}</span>
                        <span className="text-xs text-yellow-600">Announcement</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-yellow-800 font-medium">{message.content}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(message.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-4 max-w-2xl relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {message.senderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{message.senderName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.sentAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {message.type === 'image' && message.fileUrl ? (
                      <div className="mb-2">
                        <img 
                          src={message.fileUrl} 
                          alt={message.fileName || 'Shared image'} 
                          className="max-w-full h-auto rounded-lg border"
                          style={{ maxHeight: '300px' }}
                        />
                        {message.content && <p className="text-gray-800 mt-2 font-medium">{message.content}</p>}
                      </div>
                    ) : message.type === 'file' && message.fileUrl ? (
                      <div className="mb-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                          <Paperclip className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{message.fileName}</p>
                            {message.fileSize && (
                              <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>
                            )}
                          </div>
                          <a
                            href={message.fileUrl}
                            download={message.fileName}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                            <span className="text-sm">Download</span>
                          </a>
                        </div>
                        {message.content && <p className="text-gray-800 mt-2 font-medium">{message.content}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-800 font-medium">{message.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Send as announcement</span>
              </label>
              {isAnnouncement && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">This message will be highlighted to all attendees</span>
                </div>
              )}
            </div>
            
            {/* File Preview */}
            {selectedFile && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                {selectedFile.type.startsWith('image/') ? (
                  <Image className="h-5 w-5 text-blue-500" />
                ) : (
                  <Paperclip className="h-5 w-5 text-gray-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedFile ? "Add a caption (optional)" : (isAnnouncement ? "Type your announcement..." : "Type your message...")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  maxLength={500}
                />
              </div>
              
              {/* File Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedFile}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  isAnnouncement
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
              >
                <Send className="h-4 w-4" />
                <span>{isAnnouncement ? 'Announce' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Real-time Chat & Moderation Coming Soon</h4>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This is a preview of the event chat interface with organizer moderation tools. Real-time messaging, user management, and advanced moderation features are currently under development.
          </p>
        </div>
      </div>
    </div>
  );
}
