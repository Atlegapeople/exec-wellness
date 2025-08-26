'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface UserWithMetadata extends User {
  created_by_name?: string;
  updated_by_name?: string;
  profileImage?: string;
}

interface UserContextType {
  currentUser: UserWithMetadata | null;
  setCurrentUser: (user: UserWithMetadata | null) => void;
  updateProfileImage: (imageUrl: string) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user data on component mount
  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Fallback to mock data if localStorage is corrupted
        initializeMockUser();
      }
    } else {
      // Initialize with mock data if no saved data exists
      initializeMockUser();
    }
    setLoading(false);
  }, []);

  const initializeMockUser = () => {
    const mockUser: UserWithMetadata = {
      id: 'current-user-123',
      name: 'Dr. Smith',
      surname: 'Johnson',
      email: 'dr.smith@ohms.com',
      mobile: '+27 82 123 4567',
      type: 'Doctor',
      date_created: new Date('2023-01-15'),
      date_updated: new Date('2024-01-20'),
      signature: 'Yes',
      created_by_name: 'System Admin',
      updated_by_name: 'Dr. Smith',
      profileImage: null,
    };
    setCurrentUser(mockUser);
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
  };

  const updateProfileImage = (imageUrl: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profileImage: imageUrl };
      setCurrentUser(updatedUser);
      // Save updated user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const handleSetCurrentUser = (user: UserWithMetadata | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const value = {
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    updateProfileImage,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
