import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ResourceChecklistItem from '../../components/clay/ResourceChecklistItem';
import { getEvent, patchResourceStatus } from '../../api/events';
import { useAuth } from '../../context/AuthContext';

function ResourceInventory() {
  const { id } = useParams();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function loadEventData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getEvent(id);
        setEvent(data);
        setResources(data.resources || []);
      } catch (err) {
        setError(err.message || 'Failed to load event resource inventory');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEventData();
    }
  }, [id]);

  const handleToggleStatus = async (resourceId, newStatus) => {
    // Optimistic update
    const previousResources = [...resources];
    setResources((prev) =>
      prev.map((r) => (r._id === resourceId ? { ...r, status: newStatus } : r)),
    );
    setUpdatingId(resourceId);
    setError(null);

    try {
      const updatedEvent = await patchResourceStatus(token, id, resourceId, newStatus);
      setEvent(updatedEvent);
      setResources(updatedEvent.resources || []);
    } catch (err) {
      // Revert on error
      setResources(previousResources);
      setError(err.message || 'Failed to update resource status');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = resources.filter((r) => r.status !== 'delivered').length;
  const deliveredCount = resources.filter((r) => r.status === 'delivered').length;

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/organizer"
              className="text-xs text-teal-live hover:underline font-medium flex items-center gap-1"
            >
              ← Back to Events
            </Link>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-glass-white">
            Resource Inventory
          </h1>
          {event && (
            <p className="mt-0.5 font-body text-sm text-glass-white/60">
              {event.title} {event.venue ? `· ${event.venue}` : ''}
            </p>
          )}
        </div>

        {event && (
          <Link to={`/organizer/events/${event._id}/edit`}>
            <ClayButton className="whitespace-nowrap text-xs">Manage Resources in Event</ClayButton>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-coral-alert/30 bg-coral-alert/10 p-3 text-sm text-coral-alert">
          {error}
        </div>
      )}

      {loading ? (
        <GlassPanel className="text-center text-sm text-glass-white/60 py-12">
          Loading resource inventory...
        </GlassPanel>
      ) : resources.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <p className="font-body text-base text-glass-white/80 font-medium">
            No resources listed for this event.
          </p>
          <p className="mt-1 text-xs text-glass-white/60">
            You can add required resources (projectors, mics, chairs, etc.) by editing the event.
          </p>
          {event && (
            <Link to={`/organizer/events/${event._id}/edit`} className="mt-4 inline-block">
              <ClayButton>Edit Event Resources</ClayButton>
            </Link>
          )}
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          {/* Status summary banner */}
          <GlassPanel className="flex flex-wrap items-center justify-between gap-4 py-4 px-6">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-glass-white/60 block text-xs">Total Items</span>
                <span className="font-mono text-lg font-bold text-glass-white">
                  {resources.length}
                </span>
              </div>
              <div className="h-8 w-px bg-glass-white/10" />
              <div>
                <span className="text-glass-white/60 block text-xs">Pending</span>
                <span className="font-mono text-lg font-bold text-amber-ai">
                  {pendingCount}
                </span>
              </div>
              <div className="h-8 w-px bg-glass-white/10" />
              <div>
                <span className="text-glass-white/60 block text-xs">Delivered</span>
                <span className="font-mono text-lg font-bold text-teal-live">
                  {deliveredCount}
                </span>
              </div>
            </div>

            {/* Empty pending banner */}
            {pendingCount === 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-live/15 px-4 py-1.5 border border-teal-live/30 text-teal-live text-sm font-semibold">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Everything's arrived.
              </div>
            )}
          </GlassPanel>

          {/* Reassuring message when all items are delivered */}
          {pendingCount === 0 && (
            <GlassPanel className="text-center py-8 border border-teal-live/20 bg-teal-live/5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-live/20 text-teal-live mb-3">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-teal-live">
                Everything's arrived.
              </h3>
              <p className="mt-1 text-sm text-glass-white/70 max-w-md mx-auto">
                All event resources have been marked as delivered.
              </p>
            </GlassPanel>
          )}

          {/* Checklist list */}
          <div className="space-y-3">
            {resources.map((resource) => (
              <ResourceChecklistItem
                key={resource._id}
                resource={resource}
                onToggle={handleToggleStatus}
                disabled={updatingId === resource._id}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default ResourceInventory;
