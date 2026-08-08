import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { useAuth } from '../../context/AuthContext';
import { postCheckin, searchRegistrations } from '../../api/checkins';

function Scanner() {
  const { token } = useAuth();
  const [scanType, setScanType] = useState('checkin'); // 'checkin' | 'checkout'
  const [scanResult, setScanResult] = useState(null); // { success: boolean, name?: string, message: string }
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    async function onScanSuccess(decodedText) {
      try {
        const res = await postCheckin(token, {
          qrToken: decodedText,
          type: scanType,
        });

        setScanResult({
          success: true,
          name: res.registration?.name || 'Attendee',
          message: `${scanType === 'checkin' ? 'Checked in' : 'Checked out'} successfully`,
        });
      } catch (err) {
        setScanResult({
          success: false,
          message: err.message || 'Check-in failed',
        });
      }
    }

    function onScanFailure(error) {
      // Ignore background scanning frame errors
    }

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [token, scanType]);

  const handleManualSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const results = await searchRegistrations(token, null, searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleManualCheckin = async (reg) => {
    try {
      const res = await postCheckin(token, {
        registrationId: reg._id,
        eventId: reg.eventId,
        type: scanType,
      });

      setScanResult({
        success: true,
        name: reg.name,
        message: `Manual ${scanType === 'checkin' ? 'Check-in' : 'Check-out'} successful`,
      });
      setManualModalOpen(false);
    } catch (err) {
      alert(err.message || 'Manual check-in failed');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 text-glass-white pb-24">
      {/* Top Header */}
      <div className="mx-auto max-w-md flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-glass-white">QR Scanner</h1>
          <p className="text-xs text-glass-white/60 font-body">Scan attendee QR code for check-in / check-out</p>
        </div>

        {/* Manual search icon tap */}
        <button
          type="button"
          onClick={() => setManualModalOpen(true)}
          className="rounded-glass border border-glass-white/20 bg-glass-white/10 p-2 text-sm text-glass-white hover:bg-glass-white/20 backdrop-blur-md shadow-sm transition-all"
          title="Manual Search Override"
        >
          🔍 Search
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="mx-auto max-w-md mb-4 flex gap-2.5">
        <ClayChip
          selected={scanType === 'checkin'}
          onClick={() => {
            setScanType('checkin');
            setScanResult(null);
          }}
          className="flex-1 text-center justify-center cursor-pointer py-2 text-xs font-bold"
        >
          Check-in Mode
        </ClayChip>
        <ClayChip
          selected={scanType === 'checkout'}
          onClick={() => {
            setScanType('checkout');
            setScanResult(null);
          }}
          className="flex-1 text-center justify-center cursor-pointer py-2 text-xs font-bold"
        >
          Check-out Mode
        </ClayChip>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="mx-auto max-w-md relative overflow-hidden rounded-glass border border-glass-white/25 bg-base-ink/60 p-4 backdrop-blur-glass shadow-glass">
        {/* Animated Scan Line Overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-live to-transparent shadow-[0_0_15px_#2FD0C4] animate-[bounce_2s_infinite]" />
        
        <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />
      </div>

      {/* Scan Result Overlay Tint */}
      {scanResult && (
        <div className="mx-auto max-w-md mt-4">
          <GlassPanel
            className={`border-2 p-5 ${
              scanResult.success
                ? 'border-teal-live bg-teal-live/25 text-teal-100 shadow-[0_0_30px_rgba(47,208,196,0.3)]'
                : 'border-coral-alert bg-coral-alert/25 text-coral-100 shadow-[0_0_30px_rgba(255,107,107,0.3)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 font-mono">
                  {scanResult.success ? '✓ Scan Successful' : '✕ Check-in Failure'}
                </span>
                {scanResult.name && (
                  <h3 className="font-display text-2xl font-bold mt-1 text-white">{scanResult.name}</h3>
                )}
                <p className="text-sm mt-1 opacity-95 font-body leading-relaxed">{scanResult.message}</p>
              </div>
              <button
                onClick={() => setScanResult(null)}
                className="text-xs font-bold opacity-80 hover:opacity-100 p-1"
              >
                ✕ Dismiss
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Pinned "Report an Issue" Clay Button at Bottom (Section 6 spec) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <Link to="/volunteer/report-issue">
          <ClayButton className="bg-coral-alert text-white font-bold py-3 px-6 shadow-clay shadow-clay-dual hover:brightness-110 flex items-center gap-2">
            <span>🚨</span> Report an Issue
          </ClayButton>
        </Link>
      </div>

      {/* Manual Search Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassPanel className="w-full max-w-md bg-slate-900/90 text-white border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Manual Search Override</h2>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-sm text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-clay border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-live"
              />
              <ClayButton type="submit" disabled={searching}>
                {searching ? '...' : 'Search'}
              </ClayButton>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-xs text-white/50 text-center py-4">
                  {searching ? 'Searching...' : 'No registrations found.'}
                </p>
              ) : (
                searchResults.map((reg) => (
                  <div
                    key={reg._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <div>
                      <div className="font-semibold text-sm">{reg.name}</div>
                      <div className="text-xs text-white/60">{reg.email} {reg.phone && `• ${reg.phone}`}</div>
                    </div>
                    <ClayButton
                      onClick={() => handleManualCheckin(reg)}
                      className="!px-3 !py-1 text-xs"
                    >
                      {scanType === 'checkin' ? 'Check In' : 'Check Out'}
                    </ClayButton>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}

export default Scanner;
