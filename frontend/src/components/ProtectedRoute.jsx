import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { token, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="font-body text-sm text-glass-white/70">Authenticating session...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to default home for their actual role
    if (role === 'organizer') return <Navigate to="/organizer" replace />;
    if (role === 'volunteer') return <Navigate to="/volunteer" replace />;
    return <Navigate to="/attendee" replace />;
  }

  return children;
}

export default ProtectedRoute;
