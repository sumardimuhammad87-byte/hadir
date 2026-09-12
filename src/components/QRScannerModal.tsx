import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Student, Rombel } from '../types';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  Upload,
  RefreshCw,
  SwitchCamera,
  Search,
  Check,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen?: boolean;
  students: Student[];
  rombels?: Rombel[];
  onScanSuccess: (nipd: string) => { success: boolean; message: string; student?: Student } | void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  students = [],
  rombels = [],
  onScanSuccess,
  onClose,
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualNipd, setManualNipd] = useState('');
  const [selectedDemoStudent, setSelectedDemoStudent] = useState<string>(students[0]?.nipd || '');
  const [isUploading, setIsUploading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Play audio beep safely
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz crisp beep
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch {
      // Audio context might be restricted or blocked by browser policy
    }
  };

  const handleQrCodeScanned = (decodedText: string) => {
    if (!decodedText) return;
    playBeep();

    const cleanNipd = decodedText.trim();
    const result = onScanSuccess(cleanNipd);

    if (result && typeof result === 'object') {
      if (result.success && result.student) {
        setLastScannedStudent(result.student);
        setScanMessage({ type: 'success', text: result.message });
      } else {
        setScanMessage({
          type: 'error',
          text: result.message || `NIPD "${cleanNipd}" tidak terdaftar dalam database siswa!`,
        });
      }
    } else {
      // Fallback if result is void
      const matched = students.find((s) => s.nipd.trim() === cleanNipd);
      if (matched) {
        setLastScannedStudent(matched);
        setScanMessage({
          type: 'success',
          text: `Presensi Berhasil: ${matched.nama} (${matched.nipd}) tercatat HADIR!`,
        });
      } else {
        setScanMessage({
          type: 'error',
          text: `QR Code terbaca ("${cleanNipd}"), tetapi NIPD tidak ditemukan di data siswa.`,
        });
      }
    }

    // Auto clear feedback message after 4s
    setTimeout(() => {
      setScanMessage(null);
    }, 4000);
  };

  // Start Camera with flexible fallbacks
  const startCamera = async (cameraIdToUse?: string) => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing scanner instance if running
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch {
        // Ignore stop error
      }
    }

    try {
      // Get list of available cameras
      let devices: { id: string; label: string }[] = [];
      try {
        const found = await Html5Qrcode.getCameras();
        if (found && found.length > 0) {
          devices = found;
          setAvailableCameras(found);
        }
      } catch {
        // Device enumeration might fail or require user permission first
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const qrScanner = html5QrCodeRef.current;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const scanSuccessCallback = (decodedText: string) => {
        handleQrCodeScanned(decodedText);
      };

      // Determine camera target
      if (cameraIdToUse) {
        await qrScanner.start(
          cameraIdToUse,
          config,
          scanSuccessCallback,
          () => {}
        );
        setSelectedCameraId(cameraIdToUse);
      } else if (devices.length > 0) {
        // Prefer back camera if found in device labels, else first device
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        const targetId = backCamera ? backCamera.id : devices[0].id;
        setSelectedCameraId(targetId);
        await qrScanner.start(
          targetId,
          config,
          scanSuccessCallback,
          () => {}
        );
      } else {
        // Fallback to facingMode constraints
        try {
          await qrScanner.start(
            { facingMode: 'environment' },
            config,
            scanSuccessCallback,
            () => {}
          );
        } catch (envErr) {
          console.warn('Rear camera unavailable, trying front/default camera...', envErr);
          await qrScanner.start(
            { facingMode: 'user' },
            config,
            scanSuccessCallback,
            () => {}
          );
        }
      }

      setScannerActive(true);
      setCameraError(null);
    } catch (err: unknown) {
      console.warn('Camera start warning:', err);
      const errStr = err instanceof Error ? err.message : String(err);
      setScannerActive(false);
      setCameraError(
        `Kamera tidak dapat diakses (${errStr || 'Izin kamera ditolak atau tidak ada sensor kamera'}). Anda dapat mengunggah file foto QR, atau menggunakan input NIPD di bawah.`
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            html5QrCodeRef.current?.clear();
          });
        } else {
          html5QrCodeRef.current.clear();
        }
      }
    };
  }, []);

  // Handle Switch Camera
  const handleSwitchCamera = (newCamId: string) => {
    setSelectedCameraId(newCamId);
    startCamera(newCamId);
  };

  // Handle QR File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const qrScanner = html5QrCodeRef.current;
      const decodedText = await qrScanner.scanFile(file, true);
      handleQrCodeScanned(decodedText);
    } catch (err) {
      console.warn('File scan error:', err);
      setScanMessage({
        type: 'error',
        text: 'Tidak dapat mendeteksi QR Code dari gambar yang diunggah. Pastikan QR terlihat jelas dan terang.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Manual NIPD Submit
  const handleManualNipdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNipd.trim()) return;
    handleQrCodeScanned(manualNipd.trim());
    setManualNipd('');
  };

  const getRombelName = (rombelId: string) => {
    if (!rombels || rombels.length === 0) return rombelId;
    return rombels.find((r) => r.id === rombelId)?.nama || rombelId;
  };

  return (
    <div id="modal-qr-scanner" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200 my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">Live Scanner QR Code Siswa</h3>
              <p className="text-xs text-emerald-100">Arahkan kamera ke QR Code NIPD pada kartu siswa</p>
            </div>
          </div>
          <button
            id="btn-close-scanner"
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-lg hover:bg-emerald-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Feed / Viewport */}
        <div className="p-6 space-y-4">
          {/* Camera Selection & Tool Bar */}
          {availableCameras.length > 1 && (
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <SwitchCamera className="w-4 h-4 text-emerald-600" />
                <span>Pilih Kamera:</span>
              </div>
              <select
                value={selectedCameraId}
                onChange={(e) => handleSwitchCamera(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {availableCameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Kamera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-w-[340px] mx-auto border-2 border-emerald-500 shadow-inner flex flex-col items-center justify-center text-white">
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Initializing State */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-300 p-4 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                <p className="text-sm font-medium">Menghubungkan ke sensor kamera...</p>
                <p className="text-xs text-slate-400 mt-1">Izinkan akses kamera jika browser memintanya</p>
              </div>
            )}

            {/* Camera Error State */}
            {cameraError && !isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-slate-300 p-5 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-amber-300">Sensor Kamera Tidak Aktif</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[280px]">
                  {cameraError}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => startCamera()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Akses Lagi
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    Unggah Foto QR
                  </button>
                </div>
              </div>
            )}

            {/* Target Reticle Overlay & Scanning Laser Line (when active) */}
            {scannerActive && !cameraError && (
              <>
                <div className="pointer-events-none absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl flex items-center justify-center">
                  <span className="text-[11px] font-medium bg-emerald-950/70 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-xs">
                    Posisikan QR di dalam kotak
                  </span>
                </div>
                {/* Laser animation bar */}
                <div className="pointer-events-none absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              </>
            )}
          </div>

          {/* Alternative: Upload Image File for QR Detection */}
          <div className="flex items-center justify-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              {isUploading ? 'Menganalisis Gambar...' : 'Punya Foto Kartu / QR? Scan Dari File'}
            </button>
          </div>

          {/* Feedback Banner */}
          {scanMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs font-medium leading-relaxed">
                {scanMessage.text}
              </div>
              <Volume2 className="w-4 h-4 ml-auto text-slate-400 shrink-0" />
            </div>
          )}

          {/* Last Scanned Student Card Preview */}
          {lastScannedStudent && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {lastScannedStudent.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{lastScannedStudent.nama}</h4>
                  <p className="text-xs text-slate-600">
                    NIPD: <span className="font-mono font-semibold text-emerald-700">{lastScannedStudent.nipd}</span> • {getRombelName(lastScannedStudent.rombelId)}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                HADIR
              </span>
            </div>
          )}

          {/* Manual Input (Barcode scanner device or manual NIPD input) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <form onSubmit={handleManualNipdSubmit} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik NIPD atau scan dengan barcode scanner USB..."
                  value={manualNipd}
                  onChange={(e) => setManualNipd(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={!manualNipd.trim()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0"
              >
                Kirim
              </button>
            </form>
          </div>

          {/* Quick Simulation Dropdown for Instant Testing */}
          {students.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Simulasi Cepat Siswa
                </span>
                <span className="text-[11px] text-slate-500">Pilih dari {students.length} siswa</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  id="select-simulate-student"
                  value={selectedDemoStudent}
                  onChange={(e) => setSelectedDemoStudent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.nipd} value={s.nipd}>
                      [{s.nipd}] {s.nama} ({getRombelName(s.rombelId)})
                    </option>
                  ))}
                </select>
                <button
                  id="btn-simulate-scan"
                  type="button"
                  onClick={() => handleQrCodeScanned(selectedDemoStudent)}
                  className="w-full sm:w-auto shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Simulasi Scan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Otomatis mencatat status Hadir saat QR terdeteksi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

