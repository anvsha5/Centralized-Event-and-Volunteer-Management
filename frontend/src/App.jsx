import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import Feedback from './routes/attendee/Feedback';
import Certificate from './routes/attendee/Certificate';
import EventTimeline from './routes/organizer/EventTimeline';
import VolunteerTimeline from './routes/volunteer/VolunteerTimeline';
import AttendeeTimeline from './routes/attendee/AttendeeTimeline';
import Announcements from './routes/organizer/Announcements';
import Analytics from './routes/organizer/Analytics';
import ResourceInventory from './routes/organizer/ResourceInventory';

function AppNavbar() {
  const { token, role, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-glass-white/10 bg-glass-white/[0.08] px-6 py-3.5 text-sm backdrop-blur-glass shadow-glass">
      <div className="flex flex-wrap items-center gap-6">
        <Link to="/" className="font-display text-base font-extrabold tracking-tight text-glass-white flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-live shadow-[0_0_8px_#2FD0C4]" />
          EventPortal
        </Link>

        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link
                to="/events"
                className={`text-xs font-semibold transition-colors ${
                  isActive('/events') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                }`}
              >
                Events Directory
              </Link>
              <Link
                to="/login"
                className={`text-xs font-semibold transition-colors ${
                  isActive('/login') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                }`}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              {role === 'organizer' && (
                <>
                  <Link
                    to="/organizer"
                    className={`text-xs font-semibold transition-colors ${
                      location.pathname === '/organizer' ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Events
                  </Link>
                  <Link
                    to="/organizer/volunteers"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/organizer/volunteers') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Volunteers & Tasks
                  </Link>
                  <Link
                    to="/organizer/live"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/organizer/live') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Live Dashboard
                  </Link>
                  <Link
                    to="/organizer/issues"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/organizer/issues') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Issue Triage
                  </Link>
                  <Link
                    to="/organizer/timeline"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/organizer/timeline') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Timeline
                  </Link>
                  <Link
                    to="/organizer/analytics"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/organizer/analytics') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Analytics
                  </Link>
                </>
              )}
              {role === 'volunteer' && (
                <>
                  <Link
                    to="/volunteer/tasks"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/tasks') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    My Tasks
                  </Link>
                  <Link
                    to="/volunteer/report-issue"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/report-issue') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/volunteer/scanner"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/scanner') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Scanner
                  </Link>
                  <Link
                    to="/volunteer/timeline"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/timeline') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Timeline
                  </Link>
                  <Link
                    to="/volunteer/onboarding"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/onboarding') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/volunteer/trust-card"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/volunteer/trust-card') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    My Trust Card
                  </Link>
                </>
              )}
              {role === 'attendee' && (
                <>
                  <Link
                    to="/attendee"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/attendee') && !isActive('/attendee/timeline') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Attendee Home
                  </Link>
                  <Link
                    to="/attendee/timeline"
                    className={`text-xs font-semibold transition-colors ${
                      isActive('/attendee/timeline') ? 'text-teal-live border-b-2 border-teal-live pb-0.5' : 'text-glass-white/70 hover:text-glass-white'
                    }`}
                  >
                    Schedule
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {token && user && (
        <div className="flex items-center gap-3 text-xs text-glass-white/80">
          <span>
            {user.email} <span className="rounded bg-teal-live/20 px-2 py-0.5 font-mono text-teal-live border border-teal-live/30">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-clay bg-coral-alert/20 px-2.5 py-1 text-coral-alert border border-coral-alert/30 hover:bg-coral-alert/30 font-medium transition-colors"
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
              path="/organizer/events/:id/resources"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <ResourceInventory />
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
              path="/organizer/analytics"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/analytics/:eventId"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <Analytics />
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
              path="/attendee/feedback/:id"
              element={
                <ProtectedRoute allowedRoles={['attendee']}>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendee/certificate/:id"
              element={
                <ProtectedRoute allowedRoles={['attendee']}>
                  <Certificate />
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
