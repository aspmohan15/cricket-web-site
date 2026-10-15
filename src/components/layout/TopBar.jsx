import React, { useState, useEffect, useRef } from 'react';
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

  const topBarRef = useRef(null);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (topBarRef.current && !topBarRef.current.contains(e.target)) {
        setEditionDropdownOpen(false);
        setRoleDropdownOpen(false);
        setQuickActionOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditionDropdownOpen(false);
        setRoleDropdownOpen(false);
        setQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sectionTitles = {
    dashboard: 'Dashboard',
    editions: 'Editions',
    teams_players: 'Teams & Squads',
    fixtures_results: 'Fixtures & Scores',
    standings: 'Points Table & NRR',
    auction: 'Live Auction',
    sponsorships: 'Sponsorships',
    expenses: 'Expense Ledger',
    food_preferences: 'Food & Dietary',
    rules_videos: 'Rules & Videos',
    registrations: 'Registrations',
    media_library: 'Media Library',
    import_history: 'Imports & CricHeroes',
    user_access: 'User Access RBAC',
    settings: 'Settings & APIs'
  };

  const sectionFullTitles = {
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
    { id: 'organizer', label: 'Organizer', desc: 'Warhawks full operational control across all modules' },
    { id: 'player', label: 'Player', desc: 'Browse tournaments, view scorecards, standings & register' }
  ];

  return (
    <header
      ref={topBarRef}
      className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full"
    >
      {/* Left Zone: Mobile Hamburger & Section Label */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden min-w-[42px] min-h-[42px] p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Responsive Breadcrumb / Current View title */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 font-medium min-w-0">
          <span className="hidden sm:inline text-slate-800 font-bold tracking-tight shrink-0 flex items-center gap-1">
            <span>Warhawks</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-sans">
              Host
            </span>
          </span>
          <span className="hidden sm:inline text-slate-300 shrink-0">/</span>
          <span className="text-slate-900 font-bold sm:font-semibold truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[220px] md:max-w-[320px]">
            <span className="sm:hidden">{sectionTitles[currentSection] || 'Admin'}</span>
            <span className="hidden sm:inline">{sectionFullTitles[currentSection] || 'Admin Console'}</span>
          </span>
        </div>
      </div>

      {/* Center Zone: Active Tournament Edition Switcher */}
      <div className="relative mx-1 sm:mx-2 shrink-0">
        <button
          onClick={() => {
            setEditionDropdownOpen(!editionDropdownOpen);
            setRoleDropdownOpen(false);
            setQuickActionOpen(false);
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800 cursor-pointer"
          aria-label="Switch Tournament Edition"
          title="Switch active tournament edition"
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] truncate">
            {activeTournament ? (
              <>
                <span className="sm:hidden font-mono">Ed. {activeTournament.editionNumber}</span>
                <span className="hidden sm:inline">Ed. {activeTournament.editionNumber}: {activeTournament.name}</span>
              </>
            ) : 'Select'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        {editionDropdownOpen && (
          <div className="fixed inset-x-3 top-16 mt-1 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:w-72 sm:max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
              <span>Warhawks Tournaments</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Host</span>
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
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-400 shrink-0">Ed. {t.editionNumber}</span>
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
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickActionOpen(!quickActionOpen);
              setEditionDropdownOpen(false);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            aria-label="Quick Administrative Actions"
            title="Quick Action"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickActionOpen && (
            <div className="fixed inset-x-3 top-16 mt-1 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 max-w-sm sm:max-w-none bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>{currentUser.role === 'organizer' ? 'Organizer Actions' : 'Player Quick Links'}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currentUser.role === 'organizer' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {currentUser.role === 'organizer' ? 'Host' : 'Athlete'}
                </span>
              </div>
              {currentUser.role === 'organizer' ? (
                <>
                  <button
                    onClick={() => {
                      onQuickAction('add_team');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Add Franchise Team</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('schedule_match');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Schedule Fixture</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('record_expense');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Record Expense</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('import_cricheroes');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Import CricHeroes CSV</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onQuickAction('register_tournament');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Register for Tournament</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('view_fixtures');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>View Fixtures & Scores</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAction('view_standings');
                      setQuickActionOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>View Points Table</span>
                  </button>
                </>
              )}
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
            className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 min-h-[38px] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="User Profile and Role Switcher"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shrink-0">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left max-w-[120px]">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium capitalize truncate">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {roleDropdownOpen && (
            <div className="fixed inset-x-3 top-16 mt-1 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 max-w-sm sm:max-w-none bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
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
                  className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between hover:bg-slate-50 cursor-pointer ${
                    currentUser.role === r.id ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'text-slate-700'
                  }`}
                >
                  <div className="pr-2 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{r.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{r.desc}</div>
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
