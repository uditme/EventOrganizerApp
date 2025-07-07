'use client';

import React from 'react';
import { useParams } from 'next/navigation';

interface PageProps {
    params: {
        eventId: string;
    };
}

const OrganizerFeedbackPage = ({ params }: PageProps) => {
    const { eventId } = params;
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Feedback</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 mb-4">Viewing feedback for event ID: {eventId}</p>
                    <p className="text-gray-500">This is where organizers can view feedback for their events. Feature coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default OrganizerFeedbackPage;

