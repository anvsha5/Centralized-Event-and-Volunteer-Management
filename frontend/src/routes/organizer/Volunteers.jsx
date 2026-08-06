import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { listEvents } from '../../api/events';
import {
  createTask,
  getTasksByEvent,
  getSuggestedVolunteers,
  assignTask,
  updateTaskStatus,
} from '../../api/tasks';
import TrustCard from './TrustCard';

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

function Volunteers() {
  const { token } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [creatingTask, setCreatingTask] = useState(false);

  // Suggested Volunteers state
  const [activeTaskIdForSuggestions, setActiveTaskIdForSuggestions] = useState(null);
  const [suggestedVolunteers, setSuggestedVolunteers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [assigningVolunteerId, setAssigningVolunteerId] = useState(null);
  const [activeTrustCardVolunteer, setActiveTrustCardVolunteer] = useState(null);

  // 1. Fetch events on load
  useEffect(() => {
    async function loadEvents() {
      if (!token) return;
      try {
        const data = await listEvents(token);
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [token]);

  // 2. Fetch tasks when selected event changes
  useEffect(() => {
    async function loadTasks() {
      if (!token || !selectedEventId) return;
      try {
        const data = await getTasksByEvent(token, selectedEventId);
        setTasks(data);
      } catch (err) {
        setError(err.message || 'Failed to load tasks.');
      }
    }
    loadTasks();
  }, [token, selectedEventId]);

  const refreshTasks = async () => {
    if (!token || !selectedEventId) return;
    try {
      const data = await getTasksByEvent(token, selectedEventId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSkill = (skill) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      setError('Task title, start time, and end time are required.');
      return;
    }

    setCreatingTask(true);
    setError('');

    try {
      await createTask(token, {
        eventId: selectedEventId,
        title,
        description,
        location,
        startTime,
        endTime,
        requiredSkills,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setStartTime('');
      setEndTime('');
      setRequiredSkills([]);
      setShowCreateModal(false);
      refreshTasks();
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleOpenSuggestions = async (taskId) => {
    setActiveTaskIdForSuggestions(taskId);
    setLoadingSuggestions(true);
    try {
      const list = await getSuggestedVolunteers(token, taskId);
      setSuggestedVolunteers(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch suggested volunteers.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAssign = async (taskId, volunteerId) => {
    setAssigningVolunteerId(volunteerId);
    try {
      await assignTask(token, taskId, volunteerId);
      setActiveTaskIdForSuggestions(null);
      refreshTasks();
    } catch (err) {
      setError(err.message || 'Failed to assign task.');
    } finally {
      setAssigningVolunteerId(null);
    }
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await updateTaskStatus(token, assignmentId, newStatus);
      refreshTasks();
    } catch (err) {
      setError(err.message || 'Failed to update task status.');
    }
  };

  // Group tasks into Kanban columns
  const unassignedTasks = tasks.filter((t) => !t.assignments || t.assignments.length === 0);
  const assignedTasks = tasks.filter(
    (t) =>
      t.assignments &&
      t.assignments.some((a) => a.status === 'assigned' || a.status === 'in_progress')
  );
  const completedTasks = tasks.filter(
    (t) =>
      t.assignments &&
      t.assignments.some(
        (a) => a.status === 'completed' || a.status === 'no_show' || a.status === 'cancelled'
      )
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-glass-white/70">Loading task board...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header & Event Selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            Volunteer Task Board
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Create tasks, view AI-ranked suggested volunteers, and assign responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white focus:outline-none focus:ring-2 focus:ring-teal-live"
            >
              {events.map((evt) => (
                <option key={evt._id} value={evt._id} className="bg-base-ink text-glass-white">
                  {evt.title}
                </option>
              ))}
            </select>
          )}

          <ClayButton
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-live text-base-ink"
            disabled={!selectedEventId}
          >
            + Create Task
          </ClayButton>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-clay bg-coral-alert/20 p-3 text-sm text-coral-alert border border-coral-alert/30">
          {error}
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Column 1: Unassigned Tasks */}
        <GlassPanel className="p-4">
          <div className="mb-4 flex items-center justify-between border-b border-glass-white/10 pb-2">
            <h2 className="font-display font-semibold text-glass-white">
              Unassigned <span className="text-xs text-glass-white/50">({unassignedTasks.length})</span>
            </h2>
            <span className="rounded-full bg-amber-ai/20 px-2 py-0.5 text-xs text-amber-ai">
              Needs Assignment
            </span>
          </div>

          <div className="space-y-4">
            {unassignedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-glass-white/50">No unassigned tasks</div>
            ) : (
              unassignedTasks.map((task) => (
                <div key={task._id} className="rounded-clay bg-clay-base p-4 text-base-ink shadow-clay">
                  <h3 className="font-display font-bold text-sm">{task.title}</h3>
                  {task.description && <p className="mt-1 text-xs text-base-ink/80">{task.description}</p>}
                  
                  <div className="mt-2 text-[11px] text-base-ink/70 space-y-0.5">
                    {task.location && <div>📍 {task.location}</div>}
                    <div>
                      🕒 {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {task.requiredSkills && task.requiredSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.requiredSkills.map((sk) => (
                        <span key={sk} className="rounded-full bg-base-ink/10 px-2 py-0.5 text-[10px] font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 border-t border-base-ink/10 pt-2">
                    <ClayButton
                      onClick={() => handleOpenSuggestions(task._id)}
                      className="w-full bg-teal-live py-1 text-xs font-semibold text-base-ink"
                    >
                      ⚡ Suggest Volunteers
                    </ClayButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassPanel>

        {/* Column 2: Assigned Tasks */}
        <GlassPanel className="p-4">
          <div className="mb-4 flex items-center justify-between border-b border-glass-white/10 pb-2">
            <h2 className="font-display font-semibold text-glass-white">
              Assigned <span className="text-xs text-glass-white/50">({assignedTasks.length})</span>
            </h2>
            <span className="rounded-full bg-teal-live/20 px-2 py-0.5 text-xs text-teal-live">
              In Progress
            </span>
          </div>

          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-glass-white/50">No assigned tasks</div>
            ) : (
              assignedTasks.map((task) => {
                const activeAssignment = task.assignments.find(
                  (a) => a.status === 'assigned' || a.status === 'in_progress'
                );

                return (
                  <div key={task._id} className="rounded-clay bg-clay-base p-4 text-base-ink shadow-clay">
                    <h3 className="font-display font-bold text-sm">{task.title}</h3>
                    <div className="mt-1 text-xs font-medium text-teal-700">
                      👤
                      <button
                        type="button"
                        className="ml-1 underline decoration-dotted underline-offset-2"
                        onClick={() => {
                          if (activeAssignment?.volunteerId?._id) {
                            setActiveTrustCardVolunteer(activeAssignment.volunteerId);
                          }
                        }}
                      >
                        {activeAssignment?.volunteerId?.name || 'Assigned Volunteer'}
                      </button>
                    </div>

                    <div className="mt-2 text-[11px] text-base-ink/70">
                      <div>
                        🕒 {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {activeAssignment && (
                      <div className="mt-3 flex items-center justify-between border-t border-base-ink/10 pt-2 text-xs">
                        <select
                          value={activeAssignment.status}
                          onChange={(e) => handleStatusChange(activeAssignment._id, e.target.value)}
                          className="rounded bg-base-ink/10 px-2 py-1 text-xs font-medium text-base-ink focus:outline-none"
                        >
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="no_show">No Show</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassPanel>

        {/* Column 3: Completed / Closed Tasks */}
        <GlassPanel className="p-4">
          <div className="mb-4 flex items-center justify-between border-b border-glass-white/10 pb-2">
            <h2 className="font-display font-semibold text-glass-white">
              Completed <span className="text-xs text-glass-white/50">({completedTasks.length})</span>
            </h2>
            <span className="rounded-full bg-glass-white/20 px-2 py-0.5 text-xs text-glass-white/70">
              Done
            </span>
          </div>

          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-glass-white/50">No completed tasks</div>
            ) : (
              completedTasks.map((task) => {
                const finalAssignment = task.assignments[0];

                return (
                  <div key={task._id} className="rounded-clay bg-clay-base/80 p-4 text-base-ink opacity-90 shadow-clay">
                    <h3 className="font-display font-bold text-sm line-through">{task.title}</h3>
                    <div className="mt-1 text-xs text-base-ink/70">
                      👤
                      <button
                        type="button"
                        className="ml-1 underline decoration-dotted underline-offset-2"
                        onClick={() => {
                          if (finalAssignment?.volunteerId?._id) {
                            setActiveTrustCardVolunteer(finalAssignment.volunteerId);
                          }
                        }}
                      >
                        {finalAssignment?.volunteerId?.name || 'Volunteer'}
                      </button>
                    </div>
                    <div className="mt-2 inline-block rounded bg-teal-live/30 px-2 py-0.5 text-[10px] font-semibold text-base-ink">
                      Status: {finalAssignment?.status || 'Completed'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-ink/80 backdrop-blur-sm p-4">
          <GlassPanel className="w-full max-w-lg">
            <h2 className="font-display text-xl font-bold text-glass-white mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-glass-white mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stage AV Check & Mic Setup"
                  className="w-full rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white placeholder-glass-white/40 focus:outline-none focus:ring-2 focus:ring-teal-live"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-glass-white mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief task description and requirements..."
                  className="w-full rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white placeholder-glass-white/40 focus:outline-none focus:ring-2 focus:ring-teal-live"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-glass-white mb-1">Location / Room</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Auditorium Hall B"
                  className="w-full rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white placeholder-glass-white/40 focus:outline-none focus:ring-2 focus:ring-teal-live"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-glass-white mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white focus:outline-none focus:ring-2 focus:ring-teal-live"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-glass-white mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-clay border border-glass-white/20 bg-glass-white/10 px-3 py-2 text-sm text-glass-white focus:outline-none focus:ring-2 focus:ring-teal-live"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-glass-white mb-1">Required Skills</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {PRESET_SKILLS.map((sk) => (
                    <ClayChip
                      key={sk}
                      selected={requiredSkills.includes(sk)}
                      onClick={() => handleToggleSkill(sk)}
                      className="text-[11px]"
                    >
                      {requiredSkills.includes(sk) ? `✓ ${sk}` : `+ ${sk}`}
                    </ClayChip>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-glass-white/10">
                <ClayButton
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-glass-white/20 text-glass-white"
                >
                  Cancel
                </ClayButton>
                <ClayButton type="submit" disabled={creatingTask} className="bg-teal-live text-base-ink">
                  {creatingTask ? 'Creating...' : 'Create Task'}
                </ClayButton>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}

      {/* Suggested Volunteers Dropdown / Modal */}
      {activeTaskIdForSuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-ink/80 backdrop-blur-sm p-4">
          <GlassPanel className="w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-glass-white/10 pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-glass-white flex items-center gap-2">
                  <span>⚡ AI-Ranked Suggested Volunteers</span>
                </h2>
                <p className="text-xs text-glass-white/60">
                  Scored by skill match (50%), availability (30%), and reliability history (20%).
                </p>
              </div>
              <button
                onClick={() => setActiveTaskIdForSuggestions(null)}
                className="text-glass-white/60 hover:text-glass-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingSuggestions ? (
                <div className="py-8 text-center text-sm text-glass-white/70">
                  Calculating volunteer rankings...
                </div>
              ) : suggestedVolunteers.length === 0 ? (
                <div className="py-8 text-center text-sm text-glass-white/70">
                  No volunteers available or onboarded yet.
                </div>
              ) : (
                suggestedVolunteers.map((vol) => {
                  const scorePercent = Math.min(100, Math.round(vol.score * 100));

                  return (
                    <div
                      key={vol.volunteerId}
                      className="rounded-clay bg-glass-white/10 border border-glass-white/10 p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-display font-semibold text-sm text-glass-white">
                            {vol.name}
                          </div>
                          <div className="text-xs text-glass-white/60">{vol.email}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-teal-live">
                              {scorePercent}%
                            </span>
                            <div className="text-[10px] text-glass-white/50">Match Score</div>
                          </div>

                          <ClayButton
                            disabled={assigningVolunteerId === vol.volunteerId}
                            onClick={() => handleAssign(activeTaskIdForSuggestions, vol.volunteerId)}
                            className="bg-teal-live text-base-ink text-xs px-3 py-1.5"
                          >
                            {assigningVolunteerId === vol.volunteerId ? 'Assigning...' : 'Assign'}
                          </ClayButton>
                        </div>
                      </div>

                      {/* Teal Score Bar */}
                      <div className="w-full bg-base-ink/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-live h-full transition-all duration-300"
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>

                      {/* Volunteer Skills */}
                      {vol.skills && vol.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {vol.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-glass-white/10 px-2 py-0.5 text-[10px] text-glass-white/80"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-glass-white/10 flex justify-end">
              <ClayButton
                type="button"
                onClick={() => setActiveTaskIdForSuggestions(null)}
                className="bg-glass-white/20 text-glass-white text-xs"
              >
                Close
              </ClayButton>
            </div>
          </GlassPanel>
        </div>
      )}

      {activeTrustCardVolunteer && (
        <TrustCard
          token={token}
          volunteerId={activeTrustCardVolunteer._id}
          volunteerName={activeTrustCardVolunteer.name || activeTrustCardVolunteer.email}
          onClose={() => setActiveTrustCardVolunteer(null)}
        />
      )}
    </div>
  );
}

export default Volunteers;
