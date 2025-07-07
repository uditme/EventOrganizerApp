'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { GoogleIcon } from '@/components/icons/GoogleIcon';

export default function RoleSelectionPage() {
  const { user, userProfile, signInWithGoogle, setUserRole, loading, clearUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'attendee' | null>(null);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'organizer' || roleParam === 'attendee') {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && userProfile && userProfile.role && !isRoleSwitching) {
      // User is already authenticated and has a role, but not switching roles
      const urlRole = searchParams.get('role');
      if (!urlRole || urlRole === userProfile.role) {
        // No role specified in URL or same role, redirect to dashboard
        if (userProfile.role === 'organizer') {
          router.push('/organizer/dashboard');
        } else {
          router.push('/attendee/dashboard');
        }
      } else {
        // User wants to switch to a different role
        setIsRoleSwitching(true);
        clearUserProfile();
      }
    }
  }, [user, userProfile, router, searchParams, isRoleSwitching, clearUserProfile]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleRoleSet = async () => {
    if (!selectedRole) return;
    
    try {
      await setUserRole(selectedRole);
      setIsRoleSwitching(false);
      if (selectedRole === 'organizer') {
        router.push('/organizer/dashboard');
      } else {
        router.push('/attendee/dashboard');
      }
    } catch (error) {
      console.error('Role setting failed:', error);
      setIsRoleSwitching(false);
    }
  };

  if (loading) {
    return <Loading text="Setting up your account..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedRole === 'organizer' ? 'Join as Organizer' : 'Join as Attendee'}
            </h1>
            <p className="text-gray-600">
              Sign in with Google to continue
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Back to home
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-medium text-gray-900">{user.displayName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <button
                onClick={handleRoleSet}
                disabled={!selectedRole}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  selectedRole
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue as {selectedRole}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
