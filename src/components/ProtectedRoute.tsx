import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Check if URL has a share token parameter
  const urlParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : null;
  const shareToken = urlParams?.get('share');

  // SECURITY FIX: Validate share token if present (prevents bypass with ?share=anything)
  useEffect(() => {
    if (!shareToken) return;

    const validateToken = async () => {
      setValidatingToken(true);
      try {
        const { data, error } = await supabase
          .from('share_tokens')
          .select('is_active, expires_at')
          .eq('token', shareToken)
          .single();

        if (!error && data?.is_active) {
          // Check if token is not expired
          const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
          setTokenValid(!isExpired);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [shareToken]);

  // Allow access if share token is validated
  if (shareToken) {
    if (validatingToken) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (tokenValid) {
      return <>{children}</>;
    }
    
    // Invalid token - redirect to auth
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
