import React from 'react';
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
  UserPlus
} from 'lucide-react';
import { USER_ROLES } from '../../constants';

export const UserAccessView = ({
  tournament,
  users,
  currentUser,
  onSwitchRole
}) => {
  const permissionsMatrix = [
    { capability: 'Tournament Editions (Create, Edit, Archive & Delete)', organizer: true, player: false, description: 'Full tournament lifecycle control' },
    { capability: 'Franchise Teams & Squad Composition', organizer: true, player: false, description: 'Team creation, owner assigning, purse cap allocation' },
    { capability: 'Athlete Roster & Admission Queue Approval', organizer: true, player: false, description: 'Reviewing and approving player registration applications' },
    { capability: 'Fixtures Scheduling & Venue Pitch Allocations', organizer: true, player: false, description: 'Setting match timing, rounds, and ground conditions' },
    { capability: 'Live Scorecard Entry & Result Sign-Off', organizer: true, player: false, description: 'Real-time ball-by-ball score entry and outcome publication' },
    { capability: 'Live Auctioneer Podium Hammer & Bidding', organizer: true, player: false, description: 'Managing auction ring, bidding increments, and hammer drops' },
    { capability: 'Sponsorship Partnerships & Corporate Agreements', organizer: true, player: false, description: 'Tiered sponsorship contracts and banner placements' },
    { capability: 'Expense Ledger Disbursements & Budget Auditing', organizer: true, player: false, description: 'Recording tournament payouts, ground fees, and vendor receipts' },
    { capability: 'Catering Logistics & Dietary Orders Distribution', organizer: true, player: false, description: 'Managing nutritional rosters and buffet vouchers' },
    { capability: 'Rules Articles & Playing Conditions Publishing', organizer: true, player: false, description: 'Codifying tournament policies and video walkthroughs' },
    { capability: 'Database Connection Details & Supabase Cloud Keys', organizer: true, player: false, description: 'PostgreSQL connection strings, cluster diagnostics, and cloud API keys restricted strictly to Admin' },
    { capability: 'System Settings & Cloudinary / Storage Parameters', organizer: true, player: false, description: 'Infrastructure credentials and database snapshots' },
    { capability: 'Browse Published Tournaments, Schedules & Venues', organizer: true, player: true, description: 'View current and upcoming championship details' },
    { capability: 'View Live Scores, Match Outcomes & Points Table (NRR)', organizer: true, player: true, description: 'Spectate matches and review ICC-formula standings' },
    { capability: 'View Live Player Auction Stage (Spectator Mode)', organizer: true, player: true, description: 'Real-time observation of player bidding proceedings' },
    { capability: 'Self-Service Player Registration for Open Tournaments', organizer: true, player: true, description: 'Apply for tournament slots when the registration portal is open' },
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
            <span>Two-Role RBAC Model</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">User Access & Role-Based Permissions (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly enforces exactly two user roles: <strong>Organizer</strong> (full operational control) and <strong>Player</strong> (browse & register).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Active Session:</span>
          <span
            className={`font-bold px-2.5 py-1 rounded capitalize border ${
              currentUser.role === 'organizer'
                ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                : 'text-blue-800 bg-blue-100 border-blue-300'
            }`}
          >
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Two Roles Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Role 1: Organizer Card */}
        <div
          className={`bg-white rounded-xl border p-5 shadow-xs space-y-3.5 transition-all ${
            currentUser.role === 'organizer'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/20">
                🦅
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Role 1: Organizer</h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Full Read & Write Operational Control
                </span>
              </div>
            </div>

            {currentUser.role === 'organizer' ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Active Role
              </span>
            ) : (
              <button
                onClick={() => onSwitchRole('organizer')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
              >
                Simulate
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Warhawks</strong> is the default official organizer. The Organizer has universal authority to manage every module: create editions, approve/reject player registrations, schedule fixtures, conduct auctions, enter live CricHeroes scorecards, record expenses, and configure integrations.
          </p>

          <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full control across all 15 operational modules</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registration approvals, squad rosters & auction gavel</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Score updates, match result sign-offs & financial disbursements</span>
            </div>
          </div>
        </div>

        {/* Role 2: Player Card */}
        <div
          className={`bg-white rounded-xl border p-5 shadow-xs space-y-3.5 transition-all ${
            currentUser.role === 'player'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
                🏏
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Role 2: Player</h3>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Browse, View & Tournament Registration
                </span>
              </div>
            </div>

            {currentUser.role === 'player' ? (
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Active Role
              </span>
            ) : (
              <button
                onClick={() => onSwitchRole('player')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
              >
                Simulate
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Players can browse available tournaments, inspect match schedules, follow live scores and standings, review rules, submit tournament registration applications, and track their admission status.
          </p>

          <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Browse tournaments, live fixtures & points table</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Self-service tournament registration & ticket tracking</span>
            </div>
            <div className="flex items-center gap-2 text-rose-600 font-medium">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Denied: Cannot edit tournaments, approve players, or change scores</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* User Directory */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate">Platform User Accounts</h3>
            <p className="text-xs text-slate-500">Classified strictly into Organizer and Player roles</p>
          </div>
          <span className="text-xs font-mono text-slate-500 shrink-0">{users.length} accounts</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {users.map(u => {
            const isCurrentUser = u.id === currentUser.id;
            const isOrg = u.role === 'organizer';

            return (
              <div key={u.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                      isOrg ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                  >
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
                      <span className="truncate">{u.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-block font-bold text-xs px-2 py-0.5 rounded capitalize ${
                        isOrg
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {isOrg ? 'Warhawks Operations' : 'Registered Athlete'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSwitchRole(u.role)}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 transition-colors text-xs cursor-pointer shrink-0"
                  >
                    Assume Role
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Two-Role Capabilities Matrix</h3>
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
    </div>
  );
};
