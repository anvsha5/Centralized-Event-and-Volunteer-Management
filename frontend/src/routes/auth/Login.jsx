import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { requestOtp, verifyOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [step, setStep] = useState(1); // 1: Email + Intent, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [intent, setIntent] = useState('attendee');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token, role, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect away from /login to their role dashboard
  useEffect(() => {
    if (token && role) {
      if (role === 'organizer') navigate('/organizer', { replace: true });
      else if (role === 'volunteer') navigate('/volunteer', { replace: true });
      else navigate('/attendee', { replace: true });
    }
  }, [token, role, navigate]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await requestOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!otp) {
      setError('Please enter the OTP code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otp, intent);
      login(res);

      // Redirect based on user role
      const userRole = res.user.role;
      if (userRole === 'organizer') navigate('/organizer', { replace: true });
      else if (userRole === 'volunteer') navigate('/volunteer', { replace: true });
      else navigate('/attendee', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <GlassPanel className="w-full max-w-md p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-glass-white">
            Portal Login
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Sign in with email verification OTP
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-coral-alert/30 bg-coral-alert/10 p-3 text-xs text-coral-alert">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-glass-white/80">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-md border border-glass-white/10 bg-base-ink/40 px-3.5 py-2.5 font-body text-sm text-glass-white placeholder-glass-white/30 backdrop-blur-md focus:border-teal-live focus:outline-none focus:ring-1 focus:ring-teal-live"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-glass-white/80">
                I am signing up as (New Users):
              </label>
              <div className="mt-2 flex gap-2">
                <ClayChip
                  selected={intent === 'attendee'}
                  onClick={() => setIntent('attendee')}
                >
                  Attendee
                </ClayChip>
                <ClayChip
                  selected={intent === 'volunteer'}
                  onClick={() => setIntent('volunteer')}
                >
                  Volunteer
                </ClayChip>
                <ClayChip
                  selected={intent === 'organizer'}
                  onClick={() => setIntent('organizer')}
                >
                  Organizer
                </ClayChip>
              </div>
            </div>

            <ClayButton
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-center font-medium"
            >
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </ClayButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-glass-white/80">
                  Verification Code (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-teal-live hover:underline"
                >
                  Edit email
                </button>
              </div>
              <p className="mt-0.5 text-xs text-glass-white/50">
                Sent to <span className="font-medium text-glass-white">{email}</span>
              </p>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP (e.g. 123456)"
                className="mt-2 w-full rounded-md border border-glass-white/10 bg-base-ink/40 px-3.5 py-2.5 font-mono text-base tracking-widest text-glass-white placeholder-glass-white/30 backdrop-blur-md focus:border-teal-live focus:outline-none focus:ring-1 focus:ring-teal-live"
              />
            </div>

            <ClayButton
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-center font-medium"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Portal'}
            </ClayButton>
          </form>
        )}
      </GlassPanel>
    </div>
  );
}

export default Login;
