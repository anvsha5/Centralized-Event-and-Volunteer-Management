import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { saveVolunteerProfile, getMyVolunteerProfile } from '../../api/volunteers';

const PRESET_SKILLS = [
  'Technical Support',
  'Hospitality',
  'Stage Management',
  'Registration & Checkin',
  'Logistics & Audio',
  'Security & Crowd Control',
  'Design & Media',
  'First Aid',
];

const PRESET_AVAILABILITY = [
  'Full Day',
  'Morning Shift',
  'Afternoon Shift',
  'Evening Shift',
];

function Onboarding() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadExistingProfile() {
      if (!token) return;
      try {
        const profile = await getMyVolunteerProfile(token);
        if (profile) {
          if (Array.isArray(profile.skills)) setSkills(profile.skills);
          if (Array.isArray(profile.availability)) setAvailability(profile.availability);
        }
      } catch (err) {
        // Profile might not exist yet, which is normal for onboarding
      } finally {
        setFetching(false);
      }
    }
    loadExistingProfile();
  }, [token]);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const toggleAvailability = (slot) => {
    setAvailability((prev) =>
      prev.includes(slot) ? prev.filter((a) => a !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Please select at least one skill tag.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await saveVolunteerProfile(token, { skills, availability });
      setSuccess('Volunteer profile saved successfully!');
      setTimeout(() => {
        navigate('/volunteer/tasks');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save volunteer profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-glass-white/70">Loading onboarding form...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <GlassPanel>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-glass-white">
            Volunteer Onboarding
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Select your skills and availability so event organizers can assign you the best-fit tasks.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-clay bg-coral-alert/20 p-3 text-sm text-coral-alert border border-coral-alert/30">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-clay bg-teal-live/20 p-3 text-sm text-teal-live border border-teal-live/30">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills Section */}
          <div>
            <label className="block text-sm font-semibold text-glass-white mb-2">
              Select Your Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_SKILLS.map((skill) => (
                <ClayChip
                  key={skill}
                  selected={skills.includes(skill)}
                  onClick={() => toggleSkill(skill)}
                >
                  {skills.includes(skill) ? `✓ ${skill}` : `+ ${skill}`}
                </ClayChip>
              ))}
              {skills
                .filter((s) => !PRESET_SKILLS.includes(s))
                .map((skill) => (
                  <ClayChip
                    key={skill}
                    selected={true}
                    onClick={() => toggleSkill(skill)}
                  >
                    ✓ {skill} ×
                  </ClayChip>
                ))}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill..."
                className="flex-1 rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-1.5 text-xs text-glass-white placeholder-glass-white/40 focus:outline-none focus:ring-2 focus:ring-teal-live"
              />
              <ClayButton type="button" onClick={addCustomSkill} className="py-1 text-xs">
                Add Skill
              </ClayButton>
            </div>
          </div>

          {/* Availability Section */}
          <div>
            <label className="block text-sm font-semibold text-glass-white mb-2">
              Select Availability
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_AVAILABILITY.map((slot) => (
                <ClayChip
                  key={slot}
                  selected={availability.includes(slot)}
                  onClick={() => toggleAvailability(slot)}
                >
                  {availability.includes(slot) ? `✓ ${slot}` : `+ ${slot}`}
                </ClayChip>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-glass-white/10">
            <ClayButton
              type="button"
              onClick={() => navigate('/volunteer/tasks')}
              className="bg-glass-white/20 text-glass-white"
            >
              Cancel
            </ClayButton>
            <ClayButton type="submit" disabled={loading} className="bg-teal-live text-base-ink">
              {loading ? 'Saving Profile...' : 'Save Profile & Continue'}
            </ClayButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}

export default Onboarding;
