'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { IUser } from '@/models/User';

interface AuthContextType {
  user: User | null;
  userProfile: IUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: 'organizer' | 'attendee') => Promise<void>;
  clearUserProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Try to fetch from API first to get the most up-to-date profile
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`,
            },
          });
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
            localStorage.setItem('userProfile', JSON.stringify(profile));
          } else {
            // If API fails, check localStorage as fallback
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              const profile = JSON.parse(storedProfile);
              if (profile.firebaseUid === user.uid) {
                setUserProfile(profile);
              } else {
                // Clear invalid stored profile
                localStorage.removeItem('userProfile');
                setUserProfile(null);
              }
            } else {
              // Create a new temporary profile
              const tempProfile = {
                _id: user.uid,
                firebaseUid: user.uid,
                email: user.email || '',
                name: user.displayName || '',
                photoURL: user.photoURL,
                role: null,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              localStorage.setItem('userProfile', JSON.stringify(tempProfile));
              setUserProfile(tempProfile as unknown as IUser);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If API fails, check localStorage as fallback
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            if (profile.firebaseUid === user.uid) {
              setUserProfile(profile);
            } else {
              // Clear invalid stored profile
              localStorage.removeItem('userProfile');
              setUserProfile(null);
            }
          } else {
            // Create a new temporary profile
            const tempProfile = {
              _id: user.uid,
              firebaseUid: user.uid,
              email: user.email || '',
              name: user.displayName || '',
              photoURL: user.photoURL,
              role: null,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            localStorage.setItem('userProfile', JSON.stringify(tempProfile));
            setUserProfile(tempProfile as unknown as IUser);
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('userProfile');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Try to create/update user profile via backend API
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          }),
        });

        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } else {
          // Fallback to local profile if API fails
          const tempProfile = {
            _id: user.uid,
            firebaseUid: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            photoURL: user.photoURL,
            role: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          localStorage.setItem('userProfile', JSON.stringify(tempProfile));
          setUserProfile(tempProfile as unknown as IUser);
        }
      } catch (error) {
        console.error('Error with backend auth:', error);
        // Fallback to local profile
        const tempProfile = {
          _id: user.uid,
          firebaseUid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          photoURL: user.photoURL,
          role: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localStorage.setItem('userProfile', JSON.stringify(tempProfile));
        setUserProfile(tempProfile as unknown as IUser);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear local state first
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      
      // Then sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
    }
  }, []);

  const clearUserProfile = useCallback(() => {
    setUserProfile(null);
    localStorage.removeItem('userProfile');
  }, []);

  const setUserRole = useCallback(async (role: 'organizer' | 'attendee') => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Try to update via backend API first
      const response = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } else {
        // Fallback to local update if API fails
        const existingProfile = localStorage.getItem('userProfile');
        if (existingProfile) {
          const profile = JSON.parse(existingProfile);
          profile.role = role;
          profile.updatedAt = new Date();
          localStorage.setItem('userProfile', JSON.stringify(profile));
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      // Fallback to local update
      const existingProfile = localStorage.getItem('userProfile');
      if (existingProfile) {
        const profile = JSON.parse(existingProfile);
        profile.role = role;
        profile.updatedAt = new Date();
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUserProfile(profile);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    signInWithGoogle,
    logout,
    setUserRole,
    clearUserProfile,
  }), [user, userProfile, loading, signInWithGoogle, logout, setUserRole, clearUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
