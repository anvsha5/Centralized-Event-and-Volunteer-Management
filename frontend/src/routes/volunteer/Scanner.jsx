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
    <div className="relative min-h-screen bg-slate-900 px-4 py-6 text-white">
      {/* Top Header */}
      <div className="mx-auto max-w-md flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-xl font-bold">QR Scanner</h1>
          <p className="text-xs text-white/60">Scan attendee QR code for check-in / check-out</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/volunteer/report-issue">
            <ClayButton className="!px-3 !py-1.5 text-xs bg-coral-alert text-white font-bold shadow-clay hover:brightness-110">
              🚨 Report Issue
            </ClayButton>
          </Link>

          <ClayButton
            onClick={() => setManualModalOpen(true)}
            className="!px-3 !py-1.5 text-xs bg-white/10 text-white hover:bg-white/20 border border-white/20"
          >
            🔍 Search
          </ClayButton>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mx-auto max-w-md mb-4 flex gap-2">
        <ClayChip
          selected={scanType === 'checkin'}
          onClick={() => {
            setScanType('checkin');
            setScanResult(null);
          }}
          className="flex-1 text-center justify-center cursor-pointer"
        >
          Check-in Mode
        </ClayChip>
        <ClayChip
          selected={scanType === 'checkout'}
          onClick={() => {
            setScanType('checkout');
            setScanResult(null);
          }}
          className="flex-1 text-center justify-center cursor-pointer"
        >
          Check-out Mode
        </ClayChip>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="mx-auto max-w-md relative overflow-hidden rounded-glass border border-white/20 bg-black/40 p-4 backdrop-blur-glass">
        <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />
      </div>

      {/* Scan Result Overlay Tint */}
      {scanResult && (
        <div className="mx-auto max-w-md mt-4">
          <GlassPanel
            className={`border-2 ${
              scanResult.success
                ? 'border-teal-live bg-teal-live/20 text-teal-100'
                : 'border-rose-500 bg-rose-500/20 text-rose-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {scanResult.success ? '✓ Scan Successful' : '✕ Scan Error'}
                </span>
                {scanResult.name && (
                  <h3 className="font-heading text-lg font-bold mt-1">{scanResult.name}</h3>
                )}
                <p className="text-sm mt-0.5 opacity-90">{scanResult.message}</p>
              </div>
              <button
                onClick={() => setScanResult(null)}
                className="text-xs opacity-60 hover:opacity-100 p-1"
              >
                Dismiss
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

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
