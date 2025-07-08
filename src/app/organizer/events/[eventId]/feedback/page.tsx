'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  submittedAt: string;
  submittedBy: string;
}

const OrganizerFeedbackPage = () => {
  const { user, loading } = useAuth();
  const params = useParams();
  const eventId = params?.eventId as string;

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        if (!user) return;
        const response = await fetch(`/api/events/${eventId}/feedback`, {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFeedback(data.feedback);
        } else {
          console.error('Failed to fetch feedback');
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, [user, eventId]);

  if (loading || loadingFeedback) {
    return <div>Loading feedback...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Feedback</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <p className="text-gray-600">No feedback available for this event.</p>
            ) : (
              feedback.map((item) => (
                <div key={item._id} className="border-b pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < item.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm text-gray-800 font-semibold">by {item.submittedBy}</span>
                  </div>
                  <p className="text-gray-700 mt-2">{item.comment}</p>
                  <p className="text-sm text-gray-500">Submitted on {new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerFeedbackPage;

