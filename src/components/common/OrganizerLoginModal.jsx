import React, { useState } from 'react';
import {
  Phone,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { requestAdminOtp, verifyAdminOtp, normalizeMobile } from '../../services/auth';

export const OrganizerLoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  // Mobile field only - default to primary administrator mobile
  const [mobile, setMobile] = useState('7339041622');
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    setSubmitting(true);

    try {
      const res = await requestAdminOtp(mobile);
      setStatusMessage(res?.message || 'Verification code sent to your registered mobile.');
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtpCode(res.devOtp);
      }
      setStep('otp');
    } catch (err) {
      setErrorMessage(err.message || 'Authorization failed. Please check your mobile number.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const session = await verifyAdminOtp(mobile, otpCode);
      onShowToast?.(`Organizer authorized: ${session.user.name}`, 'success');
      onSuccess(session.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      const res = await requestAdminOtp(mobile);
      setStatusMessage('A fresh verification code has been dispatched.');
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtpCode(res.devOtp);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetToMobileStep = () => {
    setStep('mobile');
    setOtpCode('');
    setErrorMessage('');
    setStatusMessage('');
    setDevOtpHint('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-950/50">
              🦅
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">
                Warhawks Official Host
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Organizer Administrative Sign-In
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Secure passwordless mobile verification restricted exclusively to authorized tournament administrators.
          </p>
        </div>

        {/* Step 1: Mobile Number Only (Password field removed as requested) */}
        {step === 'mobile' ? (
          <form onSubmit={handleRequestOtp} className="p-5 sm:p-6 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                Organizer Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  autoFocus
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 7339041622"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs bg-white text-slate-900 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your registered administrator mobile number (e.g. Primary Admin: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">7339041622</code>)
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Administrator...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: 6-Digit Verification Code Verification */
          <form onSubmit={handleVerifyOtp} className="p-5 sm:p-6 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-medium">{statusMessage}</div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verifying Mobile</span>
                <span className="font-mono font-bold text-slate-800">{normalizeMobile(mobile)}</span>
              </div>
              <button
                type="button"
                onClick={resetToMobileStep}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline underline-offset-2"
              >
                Change Number
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                6-Digit Security Verification Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center tracking-[0.35em] text-base font-bold bg-white text-slate-900 transition-colors"
                />
              </div>

              {devOtpHint && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                  <span>Development Verification Code: <strong>{devOtpHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtpHint)}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={submitting}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
              <span className="text-[10px] text-slate-400">Valid for 5 minutes</span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetToMobileStep}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting || otpCode.length < 6}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Public players never need an account</span>
          </span>
          <span className="font-mono text-slate-400 text-[10px]">Warhawks Security</span>
        </div>
      </div>
    </div>
  );
};
