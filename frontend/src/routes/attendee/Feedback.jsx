import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { submitFeedback } from '../../api/registrations';

function Feedback() {
  const { id } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await submitFeedback(id, { rating, comment });
      setSuccessMessage('Feedback submitted. Your certificate is now unlocked once attendance is confirmed.');
      setComment('');
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage('Feedback already submitted for this registration.');
      } else {
        setErrorMessage(err.message || 'Failed to submit feedback.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <GlassPanel className="space-y-6 p-6 md:p-8">
        <div className="space-y-2 text-center">
          <ClayChip variant="teal" className="uppercase tracking-[0.2em]">
            Feedback
          </ClayChip>
          <h1 className="font-display text-3xl font-bold text-glass-white">Share your event experience</h1>
          <p className="text-sm text-glass-white/70">
            Submit your rating once. Certificates unlock after attendance and feedback are both recorded.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-glass-white font-body">How would you rate the event?</div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <ClayButton
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`!h-14 !w-14 !rounded-full !px-0 !py-0 font-mono text-lg font-bold shadow-clay shadow-clay-dual border transition-all ${
                    rating === value
                      ? 'bg-teal-live text-base-ink ring-4 ring-teal-live/40 border-teal-live scale-110 shadow-[0_0_15px_rgba(47,208,196,0.5)]'
                      : 'bg-clay-base text-base-ink border-white/20 hover:scale-105'
                  }`}
                >
                  {value}★
                </ClayButton>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-glass-white">
              Optional comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="What worked well? What could be better next time?"
              className="w-full rounded-glass border border-glass-white/15 bg-glass-white/5 px-4 py-3 text-sm text-glass-white placeholder:text-glass-white/40 focus:outline-none focus:border-teal-live"
            />
          </div>

          {errorMessage && (
            <div className="rounded-glass border border-coral-alert/30 bg-coral-alert/10 px-4 py-3 text-sm text-coral-alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-glass border border-teal-live/30 bg-teal-live/10 px-4 py-3 text-sm text-teal-live">
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <ClayButton type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </ClayButton>
            <Link to={`/attendee/certificate/${id}`}>
              <ClayButton variant="secondary">Open certificate</ClayButton>
            </Link>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}

export default Feedback;