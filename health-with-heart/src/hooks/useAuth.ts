import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from 'health-with-heart/src/lib/supabase/client';
import { User as DatabaseUser } from 'health-with-heart/src/types/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: DatabaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          await fetchUserProfile(session.user.id);
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }));
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Authentication error',
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({
          ...prev,
          userProfile: null,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        userProfile,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch user profile',
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<DatabaseUser>
  ) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        userProfile: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (updates: Partial<DatabaseUser>) => {
    try {
      if (!authState.userProfile?.id) {
        throw new Error('No user profile to update');
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authState.userProfile.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        userProfile: data,
      }));

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
    isAuthenticated: !!authState.user,
    isAdmin: authState.userProfile?.role === 'admin',
    isDoctor: authState.userProfile?.role === 'doctor',
    isNurse: authState.userProfile?.role === 'nurse',
    isPatient: authState.userProfile?.role === 'patient',
  };
};
