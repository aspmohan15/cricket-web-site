import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  Check,
  X,
  AlertCircle,
  Users,
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  UserPlus,
  Trash2,
  Power,
  RefreshCw,
  Loader2,
  Shield,
  ShieldAlert,
  Phone,
  Mail
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  getAdministrators,
  createAdministrator,
  toggleAdministratorStatus,
  deleteAdministrator,
  normalizeMobile
} from '../../services/auth';

export const UserAccessView = ({
  tournament,
  users = [],
  currentUser,
  onSwitchRole,
  onShowToast
}) => {
  const isOrganizer = currentUser?.role === 'organizer';
  const isPrimaryAdmin = Boolean(
    currentUser?.isPrimaryAdmin ||
    currentUser?.adminRole === 'primary_admin' ||
    currentUser?.mobile?.endsWith('7339041622') ||
    currentUser?.phone?.endsWith('7339041622')
  );

  // Administrator Management State (Exclusively for Primary Admin)
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Load administrator directory when organizer is active
  const loadAdmins = async () => {
    if (!isOrganizer) return;
    setLoadingAdmins(true);
    try {
      const data = await getAdministrators();
      if (Array.isArray(data) && data.length > 0) {
        setAdmins(data);
      } else {
        // Fallback seed display if API is offline
        setAdmins([
          {
            id: 'adm-primary-01',
            name: 'Warhawks Primary Operations Chief',
            mobile: '+917339041622',
            email: 'operations@warhawks.org',
            role: 'primary_admin',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (isOrganizer) {
      loadAdmins();
    }
  }, [isOrganizer]);

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');

    const cleanMobile = normalizeMobile(adminForm.mobile);
    if (!/^\+91[6-9]\d{9}$/.test(cleanMobile)) {
      setAdminError('Please enter a valid 10-digit Indian mobile number (e.g. 9820012345).');
      return;
    }

    if (!adminForm.password || adminForm.password.trim().length < 6) {
      setAdminError('Initial password must be at least 6 characters long.');
      return;
    }

    setSubmittingAdmin(true);

    try {
      const created = await createAdministrator({
        name: adminForm.name.trim(),
        mobile: cleanMobile,
        email: adminForm.email.trim(),
        password: adminForm.password.trim()
      });

      onShowToast?.(`Administrator ${created.name} provisioned successfully!`, 'success');
      setAddAdminModalOpen(false);
      setAdminForm({ name: '', mobile: '', email: '', password: '' });
      await loadAdmins();
    } catch (err) {
      setAdminError(err.message || 'Failed to create administrator account.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleToggleAdminStatus = async (admin) => {
    if (admin.role === 'primary_admin') {
      alert('The Primary Administrator account cannot be deactivated.');
      return;
    }

    const nextState = !admin.isActive;
    try {
      await toggleAdministratorStatus(admin.id, nextState);
      onShowToast?.(
        `Administrator ${admin.name} is now ${nextState ? 'Active' : 'Suspended'}.`,
        nextState ? 'success' : 'info'
      );
      setAdmins(prev =>
        prev.map(a => (a.id === admin.id ? { ...a, isActive: nextState } : a))
      );
    } catch (err) {
      alert(err.message || 'Failed to update administrator status.');
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.role === 'primary_admin') {
      alert('The Primary Administrator account cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke and delete administrator access for ${admin.name} (${admin.mobile})?`)) {
      return;
    }

    try {
      await deleteAdministrator(admin.id);
      onShowToast?.(`Administrator account for ${admin.name} revoked.`, 'info');
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
    } catch (err) {
      alert(err.message || 'Failed to delete administrator account.');
    }
  };

  const permissionsMatrix = [
    { capability: 'Tournament Editions (Create, Edit, Archive & Delete)', organizer: true, player: false, description: 'Full tournament lifecycle control' },
    { capability: 'Primary Admin: Manage Additional Administrator Credentials', organizer: true, player: false, description: 'Provisioning admin accounts, password hashes, access control' },
    { capability: 'Franchise Teams & Squad Composition', organizer: true, player: false, description: 'Team creation, short codes, purse cap allocation' },
    { capability: 'Athlete Roster & Admission Queue Approval', organizer: true, player: false, description: 'Reviewing and approving player registration applications' },
    { capability: 'Fixtures Scheduling & Venue Pitch Allocations', organizer: true, player: false, description: 'Setting match timing, rounds, and ground conditions' },
    { capability: 'Live Scorecard Entry & Result Sign-Off', organizer: true, player: false, description: 'Real-time ball-by-ball score entry and outcome publication' },
    { capability: 'Live Auctioneer Podium Hammer & Bidding', organizer: true, player: false, description: 'Managing auction ring, bidding increments, and hammer drops' },
    { capability: 'Sponsorship Partnerships & Corporate Agreements', organizer: true, player: false, description: 'Tiered sponsorship contracts and banner placements' },
    { capability: 'Expense Ledger Disbursements & Budget Auditing', organizer: true, player: false, description: 'Recording tournament payouts, ground fees, and vendor receipts' },
    { capability: 'Catering Logistics & Dietary Orders Distribution', organizer: true, player: false, description: 'Managing nutritional rosters and buffet vouchers' },
    { capability: 'Rules Articles & Playing Conditions Publishing', organizer: true, player: false, description: 'Codifying tournament policies and video walkthroughs' },
    { capability: 'Browse Published Tournaments, Schedules & Venues', organizer: true, player: true, description: 'View current and upcoming championship details' },
    { capability: 'View Live Scores, Match Outcomes & Points Table (NRR)', organizer: true, player: true, description: 'Spectate matches and review ICC-formula standings' },
    { capability: 'View Live Player Auction Stage (Spectator Mode)', organizer: true, player: true, description: 'Real-time observation of player bidding proceedings' },
    { capability: 'Self-Service Player Registration for Open Tournaments', organizer: true, player: true, description: 'Apply for tournament slots when the registration portal is open' },
    { capability: 'Independent Guest Dietary & Meal Requisition', organizer: true, player: true, description: 'Select independent Breakfast and Lunch for each accompanying guest' },
    { capability: 'View Personal Registration Status & Ticket', organizer: true, player: true, description: 'Track approval state and review admission notes' },
    { capability: 'Cancel Own Pending Registration Application', organizer: true, player: true, description: 'Self-service withdrawal while application is pending' },
    { capability: 'View Athlete Profile, Role & Dietary Preferences', organizer: true, player: true, description: 'Personal player specifications and kit sizing' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1.5 border border-emerald-200">
            <span>🦅 Warhawks Security Architecture</span>
            <span>·</span>
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">User Access & Role-Based Permissions (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly enforces administrative authorization boundaries: <strong>Primary Administrator</strong> (credentials & system authority), <strong>Organizer</strong> (tournament operations), and <strong>Player</strong> (browse & register).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Active Session:</span>
          <span
            className={`font-bold px-2.5 py-1 rounded capitalize border flex items-center gap-1.5 ${
              currentUser.role === 'organizer'
                ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                : 'text-blue-800 bg-blue-100 border-blue-300'
            }`}
          >
            <span>{currentUser.name}</span>
            <span className="text-[10px] opacity-75">
              ({isPrimaryAdmin ? 'Primary Admin' : currentUser.role})
            </span>
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRIMARY ADMINISTRATOR CREDENTIAL MANAGEMENT SECTION            */}
      {/* ============================================================== */}
      {isOrganizer && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <h2 className="text-base font-bold text-white">
                  Administrator Accounts & Credential Management
                </h2>
                {isPrimaryAdmin ? (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded">
                    Primary Administrator Authority
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-700">
                    Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {isPrimaryAdmin
                  ? 'As the Primary Administrator (7339041622), you have exclusive authority to provision new administrator accounts, configure mobile credentials, and manage organizer authorization.'
                  : 'Only the Primary Administrator (7339041622) has permission to provision additional administrator accounts or modify credentials.'}
              </p>
            </div>

            {isPrimaryAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={loadAdmins}
                  disabled={loadingAdmins}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh administrator directory"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAdmins ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setAddAdminModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Administrator</span>
                </button>
              </div>
            )}
          </div>

          {/* If ordinary organizer (not primary) */}
          {!isPrimaryAdmin && (
            <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Restricted Administrative Authority:</strong> You are signed in as an operational administrator. Credential provisioning and adding new administrators requires Primary Administrator authorization (<code className="font-mono font-bold text-amber-950">7339041622</code>).
              </div>
            </div>
          )}

          {/* Administrators Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Mobile & Login</th>
                  <th className="py-3 px-4">Role & Scope</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {isPrimaryAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={isPrimaryAdmin ? 5 : 4} className="py-8 text-center text-slate-400">
                      {loadingAdmins ? 'Loading administrator records...' : 'No administrators found.'}
                    </td>
                  </tr>
                ) : (
                  admins.map(admin => {
                    const isSelf = admin.id === currentUser?.id || admin.mobile?.endsWith(currentUser?.mobile?.replace(/^\+91/, '') || 'xxx');
                    const isPrimary = admin.role === 'primary_admin' || admin.mobile?.endsWith('7339041622');

                    return (
                      <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                                isPrimary ? 'bg-amber-600' : 'bg-emerald-600'
                              }`}
                            >
                              {isPrimary ? '👑' : '🦅'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{admin.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{admin.email || 'No email registered'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {admin.mobile}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                              isPrimary
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isPrimary ? 'Primary Administrator' : 'Administrator'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded ${
                              admin.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {admin.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        {isPrimaryAdmin && (
                          <td className="py-3 px-4 text-right">
                            {isPrimary ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Permanent Primary Admin
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminStatus(admin)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                    admin.isActive
                                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                  }`}
                                  title={admin.isActive ? 'Suspend access' : 'Activate access'}
                                >
                                  {admin.isActive ? 'Suspend' : 'Activate'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Revoke and delete administrator account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Switching Control Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Active Role Switcher (Simulate RBAC Enforcement)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Switch between the two roles to inspect interface adaptation. When <strong>Player</strong> is active, administrative modules are restricted and write buttons are protected.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSwitchRole('organizer')}
            className={`px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentUser.role === 'organizer'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🦅</span>
            <span>Organizer</span>
            {currentUser.role === 'organizer' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onSwitchRole('player')}
            className={`px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentUser.role === 'player'
                ? 'bg-blue-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🏏</span>
            <span>Player</span>
            {currentUser.role === 'player' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Capabilities & RBAC Authorization Matrix</h3>
            <p className="text-xs text-slate-500">
              Clear authorization boundaries between Organizer and Player
              <span className="sm:hidden text-emerald-600 font-medium"> · Scroll table horizontally →</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Capability & Scope</th>
                <th className="py-3 px-4 text-center w-36">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span>🦅 Organizer</span>
                  </span>
                </th>
                <th className="py-3 px-4 text-center w-36">
                  <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                    <span>🏏 Player</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map(row => (
                <tr key={row.capability} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{row.capability}</div>
                    <div className="text-[11px] text-slate-400">{row.description}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-emerald-50/20">
                    {row.organizer ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                        <X className="w-4 h-4 text-slate-300" />
                        <span>Denied</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center bg-blue-50/20">
                    {row.player ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-xs">
                        <Check className="w-4 h-4 text-blue-600" />
                        <span>Allowed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-xs">
                        <X className="w-4 h-4 text-rose-400" />
                        <span>Denied</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Provision New Administrator (Primary Admin Exclusive) */}
      {addAdminModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAddAdminModalOpen(false)}
          title="Provision New Administrator"
          subtitle="Add an authorized administrator account to Warhawks Tournament Operations"
          maxWidth="md"
        >
          <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs">
            {adminError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-medium">{adminError}</div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Administrator Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Sharma (Operations Desk)"
                value={adminForm.name}
                onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number (Sign-in identifier) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98200 12345 or +91 98200 12345"
                  value={adminForm.mobile}
                  onChange={e => setAdminForm({ ...adminForm, mobile: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Indian 10-digit mobile number used for sign-in verification.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="e.g. operations@warhawks.org"
                  value={adminForm.email}
                  onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Account Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={adminForm.password}
                  onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Passwords are cryptographically salted and hashed on the server. Never stored in plaintext.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Security Enforcement:</span>
              </div>
              <div>
                Newly provisioned administrators receive standard operational rights and can authenticate through the Organizer Sign-In portal using their registered mobile number.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAddAdminModalOpen(false)}
                className="px-3.5 py-2 min-h-[38px] rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAdmin}
                className="flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submittingAdmin ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Administrator</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
