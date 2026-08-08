import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { getCertificate } from '../../api/registrations';

function Certificate() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState(null);
  const [blockedReason, setBlockedReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    getCertificate(id)
      .then((data) => {
        if (!active) return;
        setCertificateData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 403) {
          setBlockedReason(err.message);
        } else {
          setErrorMessage(err.message || 'Failed to load certificate.');
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDownload = () => {
    if (!certificateData?.certificate?.content) {
      return;
    }

    const blob = new Blob([certificateData.certificate.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `certificate-${id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const lockedMessage =
    blockedReason === 'attendance_required'
      ? 'Certificate available for attendees who checked in'
      : blockedReason === 'feedback_required'
      ? 'Download certificate — share your feedback first'
      : '';

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-glass-white/60">Loading certificate...</div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <GlassPanel className="space-y-4 p-6 text-center">
          <h1 className="text-2xl font-bold text-coral-alert">Certificate unavailable</h1>
          <p className="text-sm text-glass-white/70">{errorMessage}</p>
          <Link to={`/attendee/feedback/${id}`}>
            <ClayButton variant="secondary">Go to feedback</ClayButton>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  if (blockedReason) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <GlassPanel className="space-y-5 p-8 text-center border border-amber-ai/40 bg-amber-ai/10 shadow-[0_0_20px_rgba(245,169,63,0.15)]">
          <div className="flex justify-center">
            <ClayChip className="bg-amber-ai text-base-ink font-bold uppercase tracking-[0.2em] px-3 py-1">
              Certificate Locked
            </ClayChip>
          </div>
          <h1 className="font-display text-2xl font-bold text-glass-white">Certificate Access Restricted</h1>
          <p className="text-base font-body text-glass-white/90 leading-relaxed font-medium">{lockedMessage}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {blockedReason === 'feedback_required' && (
              <Link to={`/attendee/feedback/${id}`}>
                <ClayButton className="bg-teal-live text-base-ink font-bold px-6 py-2.5">Leave feedback →</ClayButton>
              </Link>
            )}
            <Link to={`/attendee/ticket/${id}`}>
              <ClayButton className={blockedReason === 'feedback_required' ? 'bg-glass-white/20 text-glass-white' : 'bg-teal-live text-base-ink font-bold px-6 py-2.5'}>
                Back to ticket
              </ClayButton>
            </Link>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <GlassPanel className="space-y-6 p-6 md:p-8">
        <div className="space-y-2 text-center">
          <ClayChip variant="teal" className="uppercase tracking-[0.2em]">
            Certificate
          </ClayChip>
          <h1 className="font-display text-3xl font-bold text-glass-white">Attendance certificate</h1>
          <p className="text-sm text-glass-white/70">
            Your registration, check-in, and feedback have been recorded.
          </p>
        </div>

        <div className="rounded-glass border border-glass-white/15 bg-base-ink/40 p-5 font-mono text-sm text-glass-white/90 whitespace-pre-wrap">
          {certificateData?.certificate?.content || 'Certificate content unavailable.'}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <ClayButton onClick={handleDownload}>Download certificate</ClayButton>
          <Link to={`/attendee/feedback/${id}`}>
            <ClayButton variant="secondary">Review feedback</ClayButton>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}

export default Certificate;