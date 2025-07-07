'use client';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingProps) {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-white'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        {/* Simple spinning circle */}
        <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        
        {/* Loading text */}
        <p className="text-lg font-medium text-gray-700">
          {text}
        </p>

        {/* Please wait text */}
        <p className="text-sm text-gray-500">
          Please wait...
        </p>

        {/* App branding */}
        <p className="text-xs text-gray-400">
          Event Organizer App by Udit
        </p>
      </div>
    </div>
  );
}
