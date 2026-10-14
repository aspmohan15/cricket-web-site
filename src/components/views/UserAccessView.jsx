import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  Check,
  X,
  AlertCircle,
  Users
} from 'lucide-react';
import { USER_ROLES } from '../../constants';

export const UserAccessView = ({
  tournament,
  users,
  currentUser,
  onSwitchRole
}) => {
  const permissionsMatrix = [
    { module: 'Tournament Editions (Create/Archive)', super_admin: true, tournament_admin: false, scorer_admin: false, read_only: false },
    { module: 'Teams & Captain Assignment', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Player Roster & Registrations Approval', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Fixtures Scheduling', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Live Scorecard Entry & Sign-off', super_admin: true, tournament_admin: true, scorer_admin: true, read_only: false },
    { module: 'Auction Podium Bidding Hammer', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Sponsorship Agreements', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Expense Ledger Disbursements', super_admin: true, tournament_admin: false, scorer_admin: false, read_only: false },
    { module: 'Player Dietary Logs & Catering', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'CricHeroes Batch Imports', super_admin: true, tournament_admin: true, scorer_admin: false, read_only: false },
    { module: 'Audit Logs & API Keys Configuration', super_admin: true, tournament_admin: false, scorer_admin: false, read_only: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Access & Role-Based Permissions (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure administrative security policies and test authorization levels across all operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Your Active Session:</span>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded capitalize">
            {currentUser.name} ({currentUser.role.replace('_', ' ')})
          </span>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Server-Side Authorization Enforced
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Mutations are strictly validated against user session tokens. UI buttons and endpoints refuse execution if the active role lacks explicit entitlement in the database policy layer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {USER_ROLES.map(r => (
            <button
              key={r}
              onClick={() => onSwitchRole(r)}
              className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                currentUser.role === r
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Test {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Personnel Directory */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 truncate">Authorized Admin Personnel</h3>
          <span className="text-xs font-mono text-slate-500 shrink-0">{users.length} accounts</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {users.map(u => {
            const isCurrentUser = u.id === currentUser.id;
            return (
              <div key={u.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
                      <span className="truncate">{u.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="font-semibold text-slate-800 block capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {u.assignedTournaments.includes('*') ? 'All Editions' : 'Scoped Partition'}
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
            <h3 className="text-sm font-bold text-slate-900">Operational Privileges Matrix</h3>
            <p className="text-xs text-slate-500">
              Fine-grained capabilities by authority tier
              <span className="sm:hidden text-emerald-600 font-medium"> · Scroll table horizontally →</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Administrative Capability</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Tournament Admin</th>
                <th className="py-3 px-4 text-center">Scorer Operator</th>
                <th className="py-3 px-4 text-center">Read-Only Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map(row => (
                <tr key={row.module} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.module}</td>
                  <td className="py-3 px-4 text-center">
                    {row.super_admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.tournament_admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.scorer_admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.read_only ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
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
