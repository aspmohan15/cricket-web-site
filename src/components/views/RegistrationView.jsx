import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  UserCheck,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  Send,
  Ticket,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  FOOD_PREFERENCES,
  PLAYER_ROLES,
  BATTING_STYLES,
  BOWLING_STYLES
} from '../../constants';

export const RegistrationView = ({
  tournament,
  registrations,
  currentUser,
  onToggleRegistration,
  onUpdateRegistrationDates,
  onUpdateStatus,
  onPlayerRegister,
  onCancelRegistration
}) => {
  const isOrganizer = currentUser?.role === 'organizer';

  // Organizer Queue Filters & Modals
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(tournament?.registrationStartDate || '');
  const [endDate, setEndDate] = useState(tournament?.registrationEndDate || '');

  // Player Form State
  const [playerForm, setPlayerForm] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '+91 98200 12345',
    age: 24,
    city: tournament?.city || 'Mumbai',
    primaryRole: 'All-Rounder',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    preferredJerseyNo: 18,
    shirtSize: 'L',
    foodPreference: 'Veg'
  });

  // Find player's existing registration for this tournament
  const myRegistration = registrations.find(
    r => r.tournamentId === tournament?.id && r.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const filteredRegistrations = registrations.filter(r => {
    if (filterStatus !== 'all' && r.approvalStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.primaryRole.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveDates = (e) => {
    e.preventDefault();
    onUpdateRegistrationDates(startDate, endDate);
    setDateModalOpen(false);
  };

  const handleReviewAction = (status) => {
    if (!reviewModalApp) return;
    onUpdateStatus(reviewModalApp.id, status, reviewNotes);
    setReviewModalApp(null);
    setReviewNotes('');
  };

  const handlePlayerFormSubmit = (e) => {
    e.preventDefault();
    if (!tournament?.registrationOpen) {
      alert('Registration window is currently closed for this tournament.');
      return;
    }
    onPlayerRegister({
      tournamentId: tournament.id,
      ...playerForm
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold mb-1 border border-emerald-200">
            <span>🦅 Warhawks Tournament Admissions</span>
            <span>·</span>
            <span className="capitalize">{isOrganizer ? 'Organizer Queue' : 'Player Portal'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {isOrganizer ? 'Player Registration Management' : 'Tournament Registration Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOrganizer
              ? 'Official athlete admission review queue, applicant approval pipeline, and roster verification.'
              : `Apply to participate in ${tournament?.name || 'the championship'} organized and hosted by Warhawks.`}
          </p>
        </div>

        {/* Organizer-only window control buttons */}
        {isOrganizer && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setStartDate(tournament?.registrationStartDate || '');
                setEndDate(tournament?.registrationEndDate || '');
                setDateModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Window Dates</span>
            </button>

            <button
              onClick={() => onToggleRegistration(!tournament.registrationOpen)}
              className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                tournament.registrationOpen
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
              <span>{tournament.registrationOpen ? 'Close Portal' : 'Open Portal'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Registration Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              tournament?.registrationOpen
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tournament?.registrationOpen ? '🟢' : '🔒'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {tournament?.registrationOpen
                ? 'Public Registration Portal is Currently OPEN'
                : 'Registration Portal Closed to New Applicants'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Application Window: {tournament?.registrationStartDate} to {tournament?.registrationEndDate}
            </p>
          </div>
        </div>

        {isOrganizer && (
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg text-center">
              <span className="block text-slate-400 text-[10px] uppercase font-semibold">Total</span>
              <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">{registrations.length}</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-lg text-center">
              <span className="block text-emerald-700 text-[10px] uppercase font-semibold">Approved</span>
              <span className="font-mono font-bold text-emerald-900 text-sm sm:text-base">
                {registrations.filter(r => r.approvalStatus === 'approved').length}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-50 rounded-lg text-center">
              <span className="block text-amber-700 text-[10px] uppercase font-semibold">Pending</span>
              <span className="font-mono font-bold text-amber-900 text-sm sm:text-base">
                {registrations.filter(r => r.approvalStatus === 'pending').length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* PLAYER ROLE VIEW: Personal Ticket or Registration Form  */}
      {/* ======================================================== */}
      {!isOrganizer && (
        <div className="space-y-6">
          {myRegistration ? (
            /* Existing Registration Card for Current Player */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    🎟️
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Official Athlete Pass
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {myRegistration.fullName}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      Ref #{myRegistration.id} · {tournament?.name}
                    </span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                      myRegistration.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : myRegistration.approvalStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        : myRegistration.approvalStatus === 'waitlisted'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {myRegistration.approvalStatus === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                    {myRegistration.approvalStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    <span>Status: {myRegistration.approvalStatus}</span>
                  </span>
                </div>
              </div>

              {/* Status explanation */}
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed ${
                  myRegistration.approvalStatus === 'approved'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : myRegistration.approvalStatus === 'pending'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <div className="font-bold mb-0.5">
                  {myRegistration.approvalStatus === 'approved'
                    ? '🎉 Application Approved & Certified!'
                    : myRegistration.approvalStatus === 'pending'
                    ? '⏳ Application Under Active Review'
                    : 'Status: ' + myRegistration.approvalStatus}
                </div>
                <div>
                  {myRegistration.reviewNotes || (myRegistration.approvalStatus === 'approved'
                    ? 'Your athlete registration has been accepted by Warhawks Tournament Operations. You have been placed into the franchise auction pool.'
                    : 'Warhawks Tournament Operations is verifying your playing credentials and fitness records.')}
                </div>
              </div>

              {/* Registered details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Playing Discipline</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{myRegistration.primaryRole}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Batting / Bowling</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {myRegistration.battingStyle?.split(' ')[0]} / {myRegistration.bowlingStyle?.split(' ')[1] || 'Med'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Preferred Jersey #</span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5">#{myRegistration.preferredJerseyNo}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Dietary & Kit</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {myRegistration.foodPreference} (Size {myRegistration.shirtSize})
                  </span>
                </div>
              </div>

              {/* Cancel Button (if pending) */}
              {myRegistration.approvalStatus === 'pending' && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Need to withdraw? You may cancel while the application is pending review.
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel your tournament registration application?')) {
                        onCancelRegistration(myRegistration.id);
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel Application
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Registration Form for Unregistered Player */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Player Tournament Entry Application
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Submit your athlete profile to enter the player auction pool for <strong>{tournament?.name}</strong>.
                </p>
              </div>

              {tournament?.registrationOpen ? (
                <form onSubmit={handlePlayerFormSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={playerForm.fullName}
                        onChange={e => setPlayerForm({ ...playerForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={playerForm.email}
                        onChange={e => setPlayerForm({ ...playerForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={playerForm.phone}
                        onChange={e => setPlayerForm({ ...playerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City / Origin</label>
                      <input
                        type="text"
                        required
                        value={playerForm.city}
                        onChange={e => setPlayerForm({ ...playerForm, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        required
                        min={16}
                        max={50}
                        value={playerForm.age}
                        onChange={e => setPlayerForm({ ...playerForm, age: parseInt(e.target.value, 10) || 24 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Primary Playing Role</label>
                      <select
                        value={playerForm.primaryRole}
                        onChange={e => setPlayerForm({ ...playerForm, primaryRole: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        {PLAYER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Batting Style</label>
                      <select
                        value={playerForm.battingStyle}
                        onChange={e => setPlayerForm({ ...playerForm, battingStyle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {BATTING_STYLES.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Bowling Style</label>
                      <select
                        value={playerForm.bowlingStyle}
                        onChange={e => setPlayerForm({ ...playerForm, bowlingStyle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {BOWLING_STYLES.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Jersey Number</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={playerForm.preferredJerseyNo}
                        onChange={e => setPlayerForm({ ...playerForm, preferredJerseyNo: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Team Jersey Shirt Size</label>
                      <select
                        value={playerForm.shirtSize}
                        onChange={e => setPlayerForm({ ...playerForm, shirtSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double XL (XXL)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Dietary Preference</label>
                      <select
                        value={playerForm.foodPreference}
                        onChange={e => setPlayerForm({ ...playerForm, foodPreference: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        {FOOD_PREFERENCES.map(diet => (
                          <option key={diet} value={diet}>{diet}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 min-h-[42px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Tournament Registration</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                  <Lock className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-700">The registration window is currently closed for this edition.</p>
                  <p>Warhawks Tournament Operations will announce upcoming tournament registration schedules.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ORGANIZER ROLE VIEW: Applicant Review Queue & Management */}
      {/* ======================================================== */}
      {isOrganizer && (
        <div className="space-y-4 sm:space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search applicants by name, role, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'pending', 'approved', 'waitlisted', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-lg font-semibold capitalize transition-colors cursor-pointer text-xs ${
                    filterStatus === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Applicants Cards (Mobile < 768px) */}
          <div className="md:hidden space-y-3">
            {filteredRegistrations.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No applicants matching current filter.
              </div>
            ) : (
              filteredRegistrations.map(app => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-1">
                      <div className="font-bold text-slate-900 text-sm truncate">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{app.email} · {app.phone}</div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize shrink-0 ${
                        app.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.approvalStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : app.approvalStatus === 'waitlisted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {app.approvalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Discipline</span>
                      <span className="font-semibold text-slate-800 truncate block">{app.primaryRole}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Location & Age</span>
                      <span className="text-slate-700 block">{app.city} · {app.age} yrs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Diet & Kit</span>
                      <span className="text-slate-600 block">{app.foodPreference} · Size {app.shirtSize}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Fee Status</span>
                      <span className={`font-semibold capitalize ${app.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {app.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setReviewModalApp(app);
                        setReviewNotes(app.reviewNotes || '');
                      }}
                      className="w-full sm:w-auto px-4 py-2 min-h-[38px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      Review Application
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Applicants Queue Table (md+) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Role & Specs</th>
                    <th className="py-3 px-4">City & Age</th>
                    <th className="py-3 px-4">Diet & Kit</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Decision</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No registrations matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{app.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{app.email}</div>
                          <div className="text-[10px] text-slate-400">{app.phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{app.primaryRole}</span>
                          <div className="text-[11px] text-slate-400">
                            {app.battingStyle} · {app.bowlingStyle}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <div>{app.city}</div>
                          <div className="text-[11px] text-slate-400">{app.age} years</div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <div>{app.foodPreference}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Kit Size {app.shirtSize} · #{app.preferredJerseyNo}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              app.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              app.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.approvalStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : app.approvalStatus === 'waitlisted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {app.approvalStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setReviewModalApp(app);
                              setReviewNotes(app.reviewNotes || '');
                            }}
                            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Review Modal */}
      {reviewModalApp && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModalApp(null)}
          title={`Review Application: ${reviewModalApp.fullName}`}
          subtitle={`Applicant for ${tournament?.name || 'Tournament'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900">{reviewModalApp.fullName} · {reviewModalApp.primaryRole}</div>
              <div className="text-slate-500">{reviewModalApp.email} · {reviewModalApp.phone} · {reviewModalApp.city}</div>
              <div className="text-[11px] text-slate-400">
                Specs: {reviewModalApp.battingStyle} · {reviewModalApp.bowlingStyle} · #{reviewModalApp.preferredJerseyNo} · Diet: {reviewModalApp.foodPreference}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Notes</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="State reason for admission, squad allocation, or waitlist condition..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReviewModalApp(null)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('rejected')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold cursor-pointer"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('waitlisted')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer"
              >
                Waitlist
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('approved')}
                className="min-h-[38px] px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                Approve & Add to Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Date Configuration Modal */}
      <Modal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title="Configure Registration Portal Dates"
        subtitle={`Schedule active application window for ${tournament?.name || 'Tournament'}`}
      >
        <form onSubmit={handleSaveDates} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registration Opening Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registration Deadline / Cut-off</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setDateModalOpen(false)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[38px] px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              Update Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
