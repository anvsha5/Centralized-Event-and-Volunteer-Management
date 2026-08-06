import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './routes/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './routes/organizer/Events';
import EventForm from './routes/organizer/EventForm';
import ResourceInventory from './routes/organizer/ResourceInventory';
import Announcements from './routes/organizer/Announcements';
import VolunteerPlaceholder from './routes/volunteer/VolunteerPlaceholder';
import AttendeePlaceholder from './routes/attendee/AttendeePlaceholder';
import EventPage from './routes/attendee/EventPage';
import RegisterForm from './routes/attendee/RegisterForm';
import MyTicket from './routes/attendee/MyTicket';

function AppNavbar() {
  const { token, role, user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-glass-white/10 px-6 py-4 text-sm backdrop-blur-md">
      <div className="flex gap-4">
        {!token ? (
          <Link to="/login" className="text-teal-live hover:underline">
            Login
          </Link>
        ) : (
          <>
            {role === 'organizer' && (
              <Link to="/organizer" className="text-teal-live hover:underline">
                Events
              </Link>
            )}
            {role === 'volunteer' && (
              <Link to="/volunteer" className="text-teal-live hover:underline">
                Volunteer Portal
              </Link>
            )}
            {role === 'attendee' && (
              <Link to="/attendee" className="text-teal-live hover:underline">
                Attendee Home
              </Link>
            )}
          </>
        )}
      </div>

      {token && user && (
        <div className="flex items-center gap-4 text-xs text-glass-white/80">
          <span>
            {user.email} <span className="rounded bg-teal-live/20 px-2 py-0.5 font-mono text-teal-live">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded bg-coral-alert/20 px-2.5 py-1 text-coral-alert hover:bg-coral-alert/30"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function RootRedirect() {
  const { token, role, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'organizer') return <Navigate to="/organizer" replace />;
  if (role === 'volunteer') return <Navigate to="/volunteer" replace />;
  return <Navigate to="/attendee" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-base-ink text-glass-white">
          <AppNavbar />

          <Routes>
            {/* Public Event & Registration Routes */}
            <Route path="/events/:id/public" element={<EventPage />} />
            <Route path="/events/:id/register" element={<RegisterForm />} />
            <Route path="/attendee/ticket/:id" element={<MyTicket />} />

            <Route path="/login" element={<Login />} />
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/new"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/resources"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <ResourceInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/announcements"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerPlaceholder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee"
              element={
                <ProtectedRoute allowedRoles={['attendee']}>
                  <AttendeePlaceholder />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
