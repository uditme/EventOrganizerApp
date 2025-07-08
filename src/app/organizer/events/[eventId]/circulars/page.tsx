'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Send,
  MessageSquare,
  Mic,
  MicOff,
  Type,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  eventCode: string;
  attendees: any[];
}

interface Circular {
  _id: string;
  type: 'text' | 'voice';
  content: string;
  audioUrl?: string;
  sentAt: string;
  sentBy: string;
}

export default function SendCircularsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [messageType, setMessageType] = useState<'text' | 'voice'>('text');
  const [textMessage, setTextMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'organizer')) {
      router.push('/');
    } else if (user && userProfile?.role === 'organizer') {
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
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/organizer/dashboard');
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
        setCirculars(data);
      }
    } catch (error) {
      console.error('Error fetching circulars:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        console.log('Audio blob created with size:', blob.size);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/events/${eventId}/circulars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          type: 'text',
          content: textMessage,
        }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setTextMessage('');
        fetchCirculars();
      } else {
        const error = await response.json();
        alert(`Failed to send message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) {
      alert('No audio recorded. Please record a voice message first.');
      return;
    }

    if (audioBlob.size === 0) {
      alert('Audio recording is empty. Please try recording again.');
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('type', 'voice');
      formData.append('audio', audioBlob, 'voice-message.webm');

      console.log('Sending audio blob with size:', audioBlob.size);

      const response = await fetch(`/api/events/${eventId}/circulars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Voice message sent successfully!');
        setAudioBlob(null);
        fetchCirculars();
      } else {
        const error = await response.json();
        alert(`Failed to send voice message: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Updates</h1>
              <p className="text-sm text-gray-600">{event.name} • {event.attendees.length} attendees</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Type Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Choose Message Type</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setMessageType('text')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                messageType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Type className="h-5 w-5" />
              <span>Text Message</span>
            </button>
            <button
              onClick={() => setMessageType('voice')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                messageType === 'voice'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="h-5 w-5" />
              <span>Voice Message</span>
            </button>
          </div>
        </div>

        {/* Message Composer */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {messageType === 'text' ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Text Message</h3>
              <textarea
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Type your message to all attendees..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  Will be sent to {event.attendees.length} attendees
                </p>
                <button
                  onClick={sendTextMessage}
                  disabled={!textMessage.trim() || isSending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Voice Message</h3>
              <div className="text-center py-8">
                {!isRecording && !audioBlob && (
                  <div>
                    <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click to start recording your voice message</p>
                    <button
                      onClick={startRecording}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Mic className="h-5 w-5" />
                      <span>Start Recording</span>
                    </button>
                  </div>
                )}

                {isRecording && (
                  <div>
                    <div className="animate-pulse">
                      <Mic className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    </div>
                    <p className="text-red-600 mb-4 font-medium">Recording in progress...</p>
                    <button
                      onClick={stopRecording}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <MicOff className="h-5 w-5" />
                      <span>Stop Recording</span>
                    </button>
                  </div>
                )}

                {audioBlob && !isRecording && (
                  <div>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Voice message recorded successfully!</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setAudioBlob(null)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Record Again
                      </button>
                      <button
                        onClick={sendVoiceMessage}
                        disabled={isSending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>{isSending ? 'Sending...' : 'Send Voice Message'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center">
                Will be sent to {event.attendees.length} attendees
              </p>
            </div>
          )}
        </div>

        {/* Previous Circulars */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Previous Updates</h3>
          </div>
          <div className="px-6 py-4">
            {circulars.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No updates sent yet</h4>
                <p className="text-gray-600">Your sent messages will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {circulars.map((circular) => (
                  <div key={circular._id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {circular.type === 'text' ? (
                          <Type className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Mic className="h-5 w-5 text-green-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {circular.type === 'text' ? 'Text Message' : 'Voice Message'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(circular.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {circular.type === 'text' ? (
                      <p className="text-gray-700">{circular.content}</p>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <audio controls className="w-full max-w-md" src={circular.audioUrl}>
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
      </div>
    </div>
  );
}
