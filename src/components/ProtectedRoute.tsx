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

  // Check if share token exists in URL
  const shareToken = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('share')
    : null;

  // Validate share token with backend
  useEffect(() => {
    const validateToken = async () => {
      if (!shareToken) return;
      
      setValidatingToken(true);
      try {
        const { data, error } = await supabase.functions.invoke('public-calendar', {
          body: { token: shareToken, validate_only: true }
        });
        
        if (!error && data?.valid) {
          setTokenValid(true);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [shareToken]);

  // Allow access if share token is validated
  if (shareToken && tokenValid) {
    return <>{children}</>;
  }

  // Show loading while validating token or authenticating
  if (loading || (shareToken && validatingToken)) {
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