import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/services/authService';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check auth status
    if (!isLoggedIn()) {
      toast.error('You must be logged in to access this page');
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  // If logged in, render children
  return isLoggedIn() ? <>{children}</> : null;
};

export default ProtectedRoute;