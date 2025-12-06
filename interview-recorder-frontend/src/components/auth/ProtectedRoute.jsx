import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists first
        if (!authService.getToken()) {
          navigate('/login');
          return;
        }
        
        // Try to get current user to verify token is still valid
        await authService.getCurrentUser();
        setLoading(false);
      } catch (error) {
        // If token is invalid or expired, redirect to login
        authService.logout(); // Clear the invalid token
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;