import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPlaceholder from './routes/auth/LoginPlaceholder';
import OrganizerPlaceholder from './routes/organizer/OrganizerPlaceholder';
import VolunteerPlaceholder from './routes/volunteer/VolunteerPlaceholder';
import AttendeePlaceholder from './routes/attendee/AttendeePlaceholder';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <nav className="flex gap-4 border-b border-glass-white/10 px-6 py-4 text-sm">
            <Link to="/login" className="text-teal-live hover:underline">
              Login
            </Link>
            <Link to="/organizer" className="text-teal-live hover:underline">
              Organizer
            </Link>
            <Link to="/volunteer" className="text-teal-live hover:underline">
              Volunteer
            </Link>
            <Link to="/attendee" className="text-teal-live hover:underline">
              Attendee
            </Link>
          </nav>

          <Routes>
            <Route path="/login" element={<LoginPlaceholder />} />
            <Route path="/organizer" element={<OrganizerPlaceholder />} />
            <Route path="/volunteer" element={<VolunteerPlaceholder />} />
            <Route path="/attendee" element={<AttendeePlaceholder />} />
            <Route
              path="/"
              element={
                <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
                  <p className="font-display text-3xl text-glass-white">App running</p>
                </main>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
