import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import { getMyTasks, getMyVolunteerProfile } from '../../api/volunteers';
import { updateTaskStatus } from '../../api/tasks';
import NotificationFeed from './NotificationFeed';

function MyTasks() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        // Check profile
        try {
          await getMyVolunteerProfile(token);
          setHasProfile(true);
        } catch (pErr) {
          setHasProfile(false);
        }

        // Fetch assigned tasks
        const taskData = await getMyTasks(token);
        setAssignments(taskData);
      } catch (err) {
        setError(err.message || 'Failed to load assigned tasks.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleStatusToggle = async (assignmentId, currentStatus, newStatus) => {
    setUpdatingId(assignmentId);
    try {
      await updateTaskStatus(token, assignmentId, newStatus);
      setAssignments((prev) =>
        prev.map((a) => (a._id === assignmentId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      setError(err.message || 'Failed to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-glass-white/70">Loading assigned tasks...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header & Quick Navigation */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            My Volunteer Tasks
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            View your assigned responsibilities, update task statuses, and access event tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/volunteer/report-issue">
            <ClayButton className="bg-coral-alert text-white text-xs font-semibold shadow-clay">
              🚨 Report Issue
            </ClayButton>
          </Link>

          <Link to="/volunteer/trust-card">
            <ClayButton className="bg-amber-ai text-base-ink text-xs font-semibold">
              AI Trust Card
            </ClayButton>
          </Link>

          <Link to="/volunteer/onboarding">
            <ClayButton className="bg-glass-white/20 text-glass-white text-xs">
              ⚙️ My Profile
            </ClayButton>
          </Link>

          <Link to="/volunteer/scanner">
            <ClayButton className="bg-teal-live text-base-ink text-xs font-semibold">
              📷 Scanner
            </ClayButton>
          </Link>
        </div>
      </div>

      {!hasProfile && (
        <div className="mb-6 rounded-clay bg-amber-ai/20 p-4 text-glass-white border border-amber-ai/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-semibold text-amber-ai text-sm">Onboarding Profile Missing</div>
            <div className="text-xs text-glass-white/80">
              Complete your skills and availability profile so organizers can assign relevant tasks.
            </div>
          </div>
          <Link to="/volunteer/onboarding">
            <ClayButton className="bg-amber-ai text-base-ink text-xs font-bold whitespace-nowrap">
              Complete Onboarding
            </ClayButton>
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-clay bg-coral-alert/20 p-3 text-sm text-coral-alert border border-coral-alert/30">
          {error}
        </div>
      )}

      {/* Notification Feed Glass Panel (Section 5.9) */}
      <NotificationFeed />

      {/* Task List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <GlassPanel className="p-8 text-center">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-display text-lg font-bold text-glass-white">No Assigned Tasks Yet</h3>
            <p className="mt-1 text-sm text-glass-white/70">
              When an event organizer assigns a task to you, it will appear here.
            </p>
          </GlassPanel>
        ) : (
          assignments.map((assignment) => {
            const task = assignment.taskId;
            const event = task?.eventId;

            if (!task) return null;

            return (
              <div
                key={assignment._id}
                className="rounded-clay bg-clay-base p-5 text-base-ink shadow-clay transition-all duration-150"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    {event && (
                      <span className="inline-block rounded-full bg-base-ink/10 px-2.5 py-0.5 text-[11px] font-semibold text-base-ink mb-1">
                        {event.title}
                      </span>
                    )}
                    <h2 className="font-display text-lg font-bold">{task.title}</h2>
                    {task.description && (
                      <p className="mt-1 text-xs text-base-ink/80">{task.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-clay px-3 py-1 text-xs font-bold shadow-clay ${
                        assignment.status === 'completed'
                          ? 'bg-teal-live text-base-ink'
                          : assignment.status === 'in_progress'
                          ? 'bg-amber-ai text-base-ink'
                          : 'bg-base-ink/10 text-base-ink'
                      }`}
                    >
                      {assignment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-base-ink/80 border-t border-base-ink/10 pt-3">
                  {task.location && (
                    <div className="flex items-center gap-1 font-medium">
                      <span>📍 Location:</span>
                      <span>{task.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 font-medium">
                    <span>🕒 Shift:</span>
                    <span>
                      {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-base-ink/10 pt-3">
                  <div className="text-xs font-semibold text-base-ink/70">Update Status:</div>
                  <div className="flex gap-2">
                    {assignment.status !== 'completed' && (
                      <ClayButton
                        disabled={updatingId === assignment._id}
                        onClick={() =>
                          handleStatusToggle(
                            assignment._id,
                            assignment.status,
                            assignment.status === 'assigned' ? 'in_progress' : 'completed'
                          )
                        }
                        className="bg-teal-live py-1 px-3 text-xs font-semibold text-base-ink"
                      >
                        {assignment.status === 'assigned' ? 'Start Shift' : 'Mark Completed ✓'}
                      </ClayButton>
                    )}

                    {assignment.status === 'completed' && (
                      <ClayButton
                        disabled={updatingId === assignment._id}
                        onClick={() => handleStatusToggle(assignment._id, assignment.status, 'assigned')}
                        className="bg-base-ink/10 py-1 px-3 text-xs text-base-ink"
                      >
                        Re-open Task
                      </ClayButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyTasks;
