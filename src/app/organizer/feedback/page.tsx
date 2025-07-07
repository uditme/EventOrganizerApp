'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  submittedAt: string;
  submittedBy: string;
  eventName: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchFeedback();
  }, [user, router]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback/organizer', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">All Feedback</h2>
        {feedback.length === 0 ? (
          <div>No feedback available.</div>
        ) : (
          <ul>
            {feedback.map((item) => (
              <li key={item._id} className="mb-4">
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">{item.submittedBy}</p>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {item.eventName}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-2">{item.comment}</p>
                  <p className="text-gray-500 text-sm">Submitted on: {new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
