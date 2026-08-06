import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './routes/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './routes/organizer/Events';
import EventForm from './routes/organizer/EventForm';
import Volunteers from './routes/organizer/Volunteers';
import Onboarding from './routes/volunteer/Onboarding';
import MyTasks from './routes/volunteer/MyTasks';
import Scanner from './routes/volunteer/Scanner';
import MyTrustCard from './routes/volunteer/MyTrustCard';
import Live from './routes/organizer/Live';
import Issues from './routes/organizer/Issues';
import ReportIssue from './routes/volunteer/ReportIssue';
import AttendeeDashboard from './routes/attendee/AttendeeDashboard';
import EventPage from './routes/attendee/EventPage';
import RegisterForm from './routes/attendee/RegisterForm';
import MyTicket from './routes/attendee/MyTicket';
import EventTimeline from './routes/organizer/EventTimeline';
import VolunteerTimeline from './routes/volunteer/VolunteerTimeline';
import AttendeeTimeline from './routes/attendee/AttendeeTimeline';

function AppNavbar() {
  const { token, role, user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-glass-white/10 px-6 py-4 text-sm backdrop-blur-md">
      <div className="flex gap-4">
        {!token ? (
          <>
            <Link to="/events" className="text-teal-live hover:underline">
              Events Directory
            </Link>
            <Link to="/login" className="text-glass-white/70 hover:text-glass-white">
              Login
            </Link>
          </>
        ) : (
          <>
            {role === 'organizer' && (
              <>
                <Link to="/organizer" className="text-teal-live hover:underline">
                  Events
                </Link>
                <Link to="/organizer/volunteers" className="text-teal-live hover:underline">
                  Volunteers & Tasks
                </Link>
                <Link to="/organizer/live" className="text-teal-live hover:underline">
                  Live Dashboard
                </Link>
                <Link to="/organizer/issues" className="text-teal-live hover:underline">
                  Issue Triage
                </Link>
                <Link to="/organizer/timeline" className="text-teal-live hover:underline">
                  Timeline
                </Link>
              </>
            )}
            {role === 'volunteer' && (
              <>
                <Link to="/volunteer/tasks" className="text-teal-live hover:underline">
                  My Tasks
                </Link>
                <Link to="/volunteer/report-issue" className="text-teal-live hover:underline">
                  Report Issue
                </Link>
                <Link to="/volunteer/scanner" className="text-teal-live hover:underline">
                  Scanner
                </Link>
                <Link to="/volunteer/timeline" className="text-teal-live hover:underline">
                  Timeline
                </Link>
                <Link to="/volunteer/onboarding" className="text-teal-live hover:underline">
                  Onboarding & Profile
                </Link>
                <Link to="/volunteer/trust-card" className="text-teal-live hover:underline">
                  My Trust Card
                </Link>
              </>
            )}
            {role === 'attendee' && (
              <>
                <Link to="/attendee" className="text-teal-live hover:underline">
                  Attendee Home
                </Link>
                <Link to="/attendee/timeline" className="text-teal-live hover:underline">
                  Schedule
                </Link>
              </>
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
  if (!token) return <Navigate to="/events" replace />;
  if (role === 'organizer') return <Navigate to="/organizer" replace />;
  if (role === 'volunteer') return <Navigate to="/volunteer/tasks" replace />;
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
            <Route path="/events" element={<AttendeeDashboard />} />
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
              path="/organizer/volunteers"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Volunteers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/live"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Live />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/live/:eventId"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Live />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/issues"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Issues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/timeline"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EventTimeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Navigate to="/volunteer/tasks" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/tasks"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <MyTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/report-issue"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/scanner"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Scanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/timeline"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerTimeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/onboarding"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/trust-card"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <MyTrustCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee"
              element={
                <ProtectedRoute allowedRoles={['attendee']}>
                  <AttendeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee/timeline"
              element={
                <ProtectedRoute allowedRoles={['attendee']}>
                  <AttendeeTimeline />
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
