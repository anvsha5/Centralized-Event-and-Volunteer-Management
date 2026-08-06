import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrustCard from '../organizer/TrustCard';

function MyTrustCard() {
  const { token, userId, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userId) {
    return <div className="px-4 py-8 text-glass-white/70">Loading profile...</div>;
  }

  return (
    <TrustCard
      token={token}
      volunteerId={userId}
      volunteerName={user?.name || user?.email || 'My Trust Card'}
      asPage
    />
  );
}

export default MyTrustCard;
