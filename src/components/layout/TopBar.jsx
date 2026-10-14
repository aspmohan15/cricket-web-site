import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  Trophy,
  Plus,
  ShieldCheck,
  Check,
  Calendar,
  Receipt,
  Users,
  FileSpreadsheet
} from 'lucide-react';

export const TopBar = ({
  currentSection,
  tournaments,
  activeTournament,
  onSelectTournament,
  currentUser,
  onSwitchRole,
  onOpenMobileSidebar,
  onQuickAction
}) => {
  const [editionDropdownOpen, setEditionDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const sectionTitles = {
    dashboard: 'Tournament Overview',
    editions: 'Tournament Editions',
    teams_players: 'Teams & Player Squads',
    fixtures_results: 'Fixtures & Live Results',
    standings: 'Points Table & Net Run Rate',
    auction: 'Live Player Auction Management',
    sponsorships: 'Sponsorship Partnerships',
    expenses: 'Financial Ledger & Expenses',
    food_preferences: 'Player Food & Dietary Management',
    rules_videos: 'Rules, Policies & Demo Videos',
    registrations: 'Player Registration Queue',
    media_library: 'Tournament Media Library',
    import_history: 'Spreadsheet & CricHeroes Imports',
    user_access: 'Role-Based Access Control',
    settings: 'System & API Settings'
  };

  const roles = [
    { id: 'super_admin', label: 'Super Admin', desc: 'Full write access across all modules' },
    { id: 'tournament_admin', label: 'Tournament Admin', desc: 'Manage teams, fixtures, and rules' },
    { id: 'scorer_admin', label: 'Scorer Operator', desc: 'Scorecard entry & result sign-off' },
    { id: 'read_only', label: 'Read-Only Viewer', desc: 'Audit observer access' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Zone: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">PavilionHQ</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{sectionTitles[currentSection] || 'Admin Console'}</span>
        </div>
      </div>

      {/* Center Zone: Active Tournament Edition Switcher */}
      <div className="relative">
        <button
          onClick={() => {
            setEditionDropdownOpen(!editionDropdownOpen);
            setRoleDropdownOpen(false);
            setQuickActionOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800 cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-600" />
          <span className="max-w-[140px] sm:max-w-[200px] truncate">
            {activeTournament ? `Ed. ${activeTournament.editionNumber}: ${activeTournament.name}` : 'Select Edition'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {editionDropdownOpen && (
          <div className="absolute right-0 sm:left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Tournament Edition
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {tournaments.map(t => {
                const isSelected = t.id === activeTournament?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTournament(t.id);
                      setEditionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-400">Ed. {t.editionNumber}</span>
                        <span className="truncate">{t.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.year} · {t.city} · {t.status}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Zone: Quick Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickActionOpen(!quickActionOpen);
              setEditionDropdownOpen(false);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Administrative Actions
              </div>
              <button
                onClick={() => {
                  onQuickAction('add_team');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Add New Franchise Team
              </button>
              <button
                onClick={() => {
                  onQuickAction('schedule_match');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Schedule Fixture
              </button>
              <button
                onClick={() => {
                  onQuickAction('record_expense');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                Record Tournament Expense
              </button>
              <button
                onClick={() => {
                  onQuickAction('import_cricheroes');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                Import CricHeroes Match CSV
              </button>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setEditionDropdownOpen(false);
              setQuickActionOpen(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate Role (RBAC)
              </div>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSwitchRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-start justify-between hover:bg-slate-50 cursor-pointer ${
                    currentUser.role === r.id ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{r.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                  </div>
                  {currentUser.role === r.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
