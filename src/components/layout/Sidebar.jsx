import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  ListOrdered,
  Gavel,
  BadgePercent,
  Receipt,
  Utensils,
  BookOpenCheck,
  UserPlus,
  Image,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

export const Sidebar = ({
  currentSection,
  onSelectSection,
  activeTournament,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editions', label: 'Tournament Editions', icon: Trophy, badge: 'Multi' },
    { id: 'teams_players', label: 'Teams & Players', icon: Users },
    { id: 'fixtures_results', label: 'Fixtures & Results', icon: Calendar },
    { id: 'standings', label: 'Standings & NRR', icon: ListOrdered },
    { id: 'auction', label: 'Auction Management', icon: Gavel, badge: 'Live' },
    { id: 'sponsorships', label: 'Sponsorships', icon: BadgePercent },
    { id: 'expenses', label: 'Tournament Expenses', icon: Receipt },
    { id: 'food_preferences', label: 'Food Preferences', icon: Utensils },
    { id: 'rules_videos', label: 'Rules & Demo Videos', icon: BookOpenCheck },
    { id: 'registrations', label: 'Registration Queue', icon: UserPlus },
    { id: 'media_library', label: 'Media Library', icon: Image },
    { id: 'import_history', label: 'Import History', icon: FileSpreadsheet, badge: 'CSV' },
    { id: 'user_access', label: 'User & Access RBAC', icon: ShieldCheck },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings }
  ];

  const handleNavClick = (id) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Explicit Mobile Close Button */}
        <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-900/40">
              🏏
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-tight">
                PavilionHQ
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                Tournament Command
              </span>
            </div>
          </div>

          {/* Close button for mobile drawers */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden min-w-[42px] min-h-[42px] p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Edition Context Card */}
        <div className="p-3 mx-3 my-2 bg-slate-800/70 rounded-lg border border-slate-700/60 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-medium uppercase tracking-wider">Active Edition</span>
            <span className="font-mono text-emerald-400 font-bold">Ed. {activeTournament?.editionNumber || '—'}</span>
          </div>
          <p className="text-xs font-semibold text-white truncate">
            {activeTournament?.name || 'No Tournament Selected'}
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{activeTournament?.year || '—'} · {activeTournament?.format || 'T20'}</span>
            <button
              onClick={() => handleNavClick('editions')}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
            >
              Switch <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs font-medium">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left group min-h-[42px] cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-950'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-emerald-800/60 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info with safe-area bottom */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <span>Relational Schema (JS)</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
            <Sparkles className="w-3 h-3" /> Supabase
          </span>
        </div>
      </aside>
    </>
  );
};
