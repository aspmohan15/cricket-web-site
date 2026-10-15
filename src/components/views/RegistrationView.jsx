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
  CreditCard
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const RegistrationView = ({
  tournament,
  registrations,
  onToggleRegistration,
  onUpdateRegistrationDates,
  onUpdateStatus
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(tournament.registrationStartDate);
  const [endDate, setEndDate] = useState(tournament.registrationEndDate);

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

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Player Registration Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official athlete admission portal, applicant approval pipeline, and roster eligibility verification conducted by Warhawks.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={() => setDateModalOpen(true)}
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
      </div>

      {/* Registration Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              tournament.registrationOpen
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tournament.registrationOpen ? '🟢' : '🔒'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {tournament.registrationOpen
                ? 'Public Applicant Registration Window is Active'
                : 'Registration Portal Closed to New Applicants'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Window: {tournament.registrationStartDate} to {tournament.registrationEndDate}
            </p>
          </div>
        </div>

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
      </div>

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
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No applicants matching current filter.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">{app.email} · {app.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.primaryRole}</div>
                      <div className="text-[11px] text-slate-400">{app.battingStyle} · {app.bowlingStyle}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{app.city}</div>
                      <div className="text-[11px] text-slate-400">{app.age} years old</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {app.foodPreference} · Size {app.shirtSize}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                          app.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
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

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setReviewModalApp(app);
                          setReviewNotes(app.reviewNotes || '');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors cursor-pointer"
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

      {/* Review Modal */}
      {reviewModalApp && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModalApp(null)}
          title={`Review Application: ${reviewModalApp.fullName}`}
          subtitle="Warhawks Organizing Committee admission review against tournament regulations"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{reviewModalApp.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role & Discipline:</span>
                <span className="font-semibold text-slate-800">{reviewModalApp.primaryRole} ({reviewModalApp.battingStyle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dietary & Jersey:</span>
                <span className="text-slate-800">{reviewModalApp.foodPreference} · #{reviewModalApp.preferredJerseyNo || '—'} (Size {reviewModalApp.shirtSize})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Payment:</span>
                <span className="font-bold text-emerald-700 capitalize">{reviewModalApp.paymentStatus}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Review Notes</label>
              <textarea
                rows={3}
                placeholder="Add verification notes, club background, or fitness clearance..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
              <span className="font-bold">Automated Roster Provisioning:</span> Clicking <strong>Approve</strong> will automatically provision this player into the tournament's active player pool and auction registry!
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
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
        subtitle={`Schedule active application window for ${tournament.name}`}
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
