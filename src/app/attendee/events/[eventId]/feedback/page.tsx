'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Star,
  Send,
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
}

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  submittedAt: string;
  submittedBy: string;
}

export default function AttendeeFeedbackPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'attendee')) {
      router.push('/');
    } else if (user && userProfile?.role === 'attendee') {
      fetchEvent();
      fetchFeedback();
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

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/feedback`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        setHasSubmittedFeedback(data.hasSubmittedFeedback || false);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const submitFeedback = async () => {
    if (!rating || !comment.trim()) {
      alert('Please provide both a rating and comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        }),
      });

      if (response.ok) {
        alert('Feedback submitted successfully!');
        setRating(0);
        setComment('');
        fetchFeedback(); // Refresh feedback list
      } else {
        const errorData = await response.json();
        alert(`Failed to submit feedback: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 ${
              star <= (interactive ? (hoverRating || rating) : currentRating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
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

        {/* Feedback Form */}
        {!hasSubmittedFeedback && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Share Your Feedback</h3>
            
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate this event?
                </label>
                {renderStars(rating, true)}
                <p className="text-xs text-gray-500 mt-1">Click to rate from 1 to 5 stars</p>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Share your thoughts about the event
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="What did you think about the event? Any suggestions for improvement?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitFeedback}
                disabled={!rating || !comment.trim() || isSubmitting}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Already Submitted Message */}
        {hasSubmittedFeedback && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Thank You!</h3>
                <p className="text-green-700">You have already submitted feedback for this event.</p>
              </div>
            </div>
          </div>
        )}

        {/* All Feedback (if available) */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Event Feedback</h3>
          </div>
          <div className="px-6 py-4">
            {loadingFeedback ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading feedback...</p>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h4>
                <p className="text-gray-600">Be the first to share your thoughts about this event!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedback.map((item) => (
                  <div key={item._id} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {renderStars(item.rating)}
                        <span className="text-sm font-medium text-gray-900">{item.submittedBy}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">About Feedback</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Your feedback helps organizers improve future events</li>
            <li>• Ratings and comments are visible to other attendees</li>
            <li>• You can only submit feedback once per event</li>
            <li>• Be constructive and respectful in your comments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
