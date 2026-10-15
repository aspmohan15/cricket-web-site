import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/Toast';

// Views
import { DashboardView } from './components/views/DashboardView';
import { EditionsView } from './components/views/EditionsView';
import { TeamsPlayersView } from './components/views/TeamsPlayersView';
import { FixturesResultsView } from './components/views/FixturesResultsView';
import { StandingsView } from './components/views/StandingsView';
import { AuctionView } from './components/views/AuctionView';
import { SponsorshipView } from './components/views/SponsorshipView';
import { ExpensesView } from './components/views/ExpensesView';
import { FoodPreferencesView } from './components/views/FoodPreferencesView';
import { RulesVideosView } from './components/views/RulesVideosView';
import { RegistrationView } from './components/views/RegistrationView';
import { MediaLibraryView } from './components/views/MediaLibraryView';
import { ImportHistoryView } from './components/views/ImportHistoryView';
import { UserAccessView } from './components/views/UserAccessView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Database snapshot states
  const [tournaments, setTournaments] = useState(() => db.getTournaments());
  const [activeTournamentId, setActiveTournamentId] = useState('tour-ed5-2026');
  const [currentUser, setCurrentUser] = useState(() => db.getUsers()[0]);

  // Derived active tournament
  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];

  // Reload data for the active tournament
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [auctionConfig, setAuctionConfig] = useState(() => db.getAuctionConfig(activeTournamentId));
  const [sponsors, setSponsors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [rules, setRules] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [importJobs, setImportJobs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState(() => db.getSettings());

  const refreshTournamentData = (tId) => {
    setTournaments(db.getTournaments());
    setTeams(db.getTeams(tId));
    setPlayers(db.getPlayers(tId));
    setMatches(db.getMatches(tId));
    setStandings(db.getStandings(tId));
    setAuctionConfig(db.getAuctionConfig(tId));
    setSponsors(db.getSponsors(tId));
    setExpenses(db.getExpenses(tId));
    setFoodOrders(db.getFoodOrders(tId));
    setRules(db.getRules(tId));
    setRegistrations(db.getRegistrations(tId));
    setMediaAssets(db.getMediaAssets(tId));
    setImportJobs(db.getImportJobs(tId));
    setAuditLogs(db.getAuditLogs(tId));
    setSettings(db.getSettings());
  };

  useEffect(() => {
    if (activeTournament) {
      refreshTournamentData(activeTournament.id);
    }
  }, [activeTournamentId]);

  const showToast = (message, type = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch Active Edition
  const handleSelectEdition = (id) => {
    setActiveTournamentId(id);
    const target = tournaments.find(t => t.id === id);
    showToast(`Switched active partition to: ${target?.name || id}`, 'info');
  };

  // Role Simulator
  const handleSwitchRole = (role) => {
    const u = db.getUsers().find(user => user.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(u);
    const playerAllowedSections = [
      'fixtures_results',
      'standings',
      'registrations',
      'teams_players',
      'auction',
      'rules_videos',
      'user_access'
    ];
    if (role === 'player' && !playerAllowedSections.includes(currentSection)) {
      setCurrentSection('fixtures_results');
    }
    showToast(`Session authority updated: ${role.toUpperCase()}`, 'info');
  };

  // Quick Action Handler from Topbar
  const handleQuickAction = (action) => {
    if (action === 'add_team') {
      setCurrentSection('teams_players');
    } else if (action === 'schedule_match') {
      setCurrentSection('fixtures_results');
    } else if (action === 'record_expense') {
      setCurrentSection('expenses');
    } else if (action === 'import_cricheroes') {
      setCurrentSection('import_history');
    } else if (action === 'register_tournament') {
      setCurrentSection('registrations');
    } else if (action === 'view_fixtures') {
      setCurrentSection('fixtures_results');
    } else if (action === 'view_standings') {
      setCurrentSection('standings');
    }
  };

  // Player Self-Service Registration
  const handlePlayerRegister = (data) => {
    try {
      const newReg = db.createRegistration(data);
      refreshTournamentData(activeTournamentId);
      showToast('Registration application submitted to Warhawks Operations!', 'success');
      return newReg;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleCancelRegistration = (regId) => {
    try {
      db.cancelRegistration(regId, currentUser?.email);
      refreshTournamentData(activeTournamentId);
      showToast('Registration application cancelled.', 'info');
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  // Tournament CRUD
  const handleCreateTournament = (data) => {
    const newT = db.createTournament(data);
    refreshTournamentData(newT.id);
    setActiveTournamentId(newT.id);
    showToast(`Edition #${newT.editionNumber} initialized!`, 'success');
  };

  const handleUpdateTournament = (id, updates) => {
    db.updateTournament(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Tournament parameters updated', 'success');
  };

  // Team CRUD
  const handleCreateTeam = (data) => {
    db.createTeam(data);
    refreshTournamentData(activeTournamentId);
    showToast(`Team ${data.name} created!`, 'success');
  };

  const handleUpdateTeam = (id, updates) => {
    db.updateTeam(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Franchise updated', 'success');
  };

  const handleDeleteTeam = (id) => {
    db.deleteTeam(id);
    refreshTournamentData(activeTournamentId);
    showToast('Team removed from tournament partition', 'info');
  };

  // Player CRUD
  const handleCreatePlayer = (data) => {
    db.createPlayer(data);
    refreshTournamentData(activeTournamentId);
    showToast(`Player ${data.name} added to roster`, 'success');
  };

  const handleUpdatePlayer = (id, updates) => {
    db.updatePlayer(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Player profile updated', 'success');
  };

  const handleDeletePlayer = (id) => {
    db.deletePlayer(id);
    refreshTournamentData(activeTournamentId);
    showToast('Player deleted', 'info');
  };

  // Match CRUD & CricHeroes
  const handleCreateMatch = (data) => {
    db.createMatch(data);
    refreshTournamentData(activeTournamentId);
    showToast(`Match #${data.matchNumber} scheduled!`, 'success');
  };

  const handleUpdateMatch = (id, updates) => {
    db.updateMatch(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Scorecard sign-off recorded & Standings recalculated!', 'success');
  };

  const handleDeleteMatch = (id) => {
    db.deleteMatch(id);
    refreshTournamentData(activeTournamentId);
    showToast('Match deleted', 'info');
  };

  // Auction System
  const handlePlaceBid = (playerId, teamId, amount) => {
    const res = db.placeAuctionBid(activeTournamentId, playerId, teamId, amount);
    refreshTournamentData(activeTournamentId);
    if (!res.success) {
      showToast(res.message, 'error');
    }
    return res;
  };

  const handleFinalizeSale = (playerId, teamId, amount) => {
    db.finalizePlayerSale(activeTournamentId, playerId, teamId, amount);
    refreshTournamentData(activeTournamentId);
    showToast('Player sale successfully locked into team purse!', 'success');
  };

  const handleMarkUnsold = (playerId) => {
    db.markPlayerUnsold(activeTournamentId, playerId);
    refreshTournamentData(activeTournamentId);
    showToast('Player moved to unsold reserves pool', 'info');
  };

  // Sponsors
  const handleCreateSponsor = (data) => {
    db.createSponsor(data);
    refreshTournamentData(activeTournamentId);
    showToast('Sponsor partnership logged', 'success');
  };

  const handleUpdateSponsor = (id, updates) => {
    db.updateSponsor(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Sponsor details updated', 'success');
  };

  const handleDeleteSponsor = (id) => {
    db.deleteSponsor(id);
    refreshTournamentData(activeTournamentId);
    showToast('Sponsor removed', 'info');
  };

  // Expenses
  const handleCreateExpense = (data) => {
    db.createExpense(data);
    refreshTournamentData(activeTournamentId);
    showToast('Expense voucher recorded in financial ledger', 'success');
  };

  const handleDeleteExpense = (id) => {
    db.deleteExpense(id);
    refreshTournamentData(activeTournamentId);
    showToast('Expense voucher removed', 'info');
  };

  // Food
  const handleCreateFoodOrder = (data) => {
    db.createFoodOrder(data);
    refreshTournamentData(activeTournamentId);
    showToast('Meal distribution logged for catering staff', 'success');
  };

  const handleUpdateFoodStatus = (id, status) => {
    db.updateFoodOrderStatus(id, status);
    refreshTournamentData(activeTournamentId);
    showToast(`Meal marked as ${status}`, 'success');
  };

  // Rules
  const handleCreateRule = (data) => {
    db.createRule(data);
    refreshTournamentData(activeTournamentId);
    showToast('Rule clause published', 'success');
  };

  const handleUpdateRule = (id, updates) => {
    db.updateRule(id, updates);
    refreshTournamentData(activeTournamentId);
    showToast('Rule updated', 'success');
  };

  const handleDeleteRule = (id) => {
    db.deleteRule(id);
    refreshTournamentData(activeTournamentId);
    showToast('Rule deleted', 'info');
  };

  // Registrations
  const handleToggleRegistration = (isOpen) => {
    db.updateTournament(activeTournamentId, { registrationOpen: isOpen });
    refreshTournamentData(activeTournamentId);
    showToast(`Registration window ${isOpen ? 'OPENED' : 'CLOSED'}`, 'info');
  };

  const handleUpdateRegistrationDates = (start, end) => {
    db.updateTournament(activeTournamentId, {
      registrationStartDate: start,
      registrationEndDate: end
    });
    refreshTournamentData(activeTournamentId);
    showToast('Registration schedule updated', 'success');
  };

  const handleUpdateRegistrationStatus = (id, status, notes) => {
    db.updateRegistrationStatus(id, status, notes);
    refreshTournamentData(activeTournamentId);
    showToast(`Application marked as ${status}!`, 'success');
  };

  // Media
  const handleAddMedia = (data) => {
    db.addMediaAsset(data);
    refreshTournamentData(activeTournamentId);
    showToast('Media uploaded to library', 'success');
  };

  const handleDeleteMedia = (id) => {
    db.deleteMediaAsset(id);
    refreshTournamentData(activeTournamentId);
    showToast('Media asset removed', 'info');
  };

  // Imports
  const handleImportMatches = (importedMatches, fileTitle) => {
    importedMatches.forEach(m => db.createMatch(m));
    db.recordImportJob({
      tournamentId: activeTournamentId,
      jobType: 'cricheroes_matches',
      fileName: fileTitle,
      totalRows: importedMatches.length,
      importedRows: importedMatches.length,
      skippedRows: 0,
      status: 'completed',
      importSummary: `Ingested ${importedMatches.length} CricHeroes official match summaries. Points table updated.`,
      importedBy: currentUser.name
    });
    refreshTournamentData(activeTournamentId);
    showToast(`Imported ${importedMatches.length} CricHeroes fixtures into database!`, 'success');
  };

  const handleImportPlayers = (importedPlayers, fileTitle) => {
    importedPlayers.forEach(p => db.createPlayer(p));
    db.recordImportJob({
      tournamentId: activeTournamentId,
      jobType: 'players_roster',
      fileName: fileTitle,
      totalRows: importedPlayers.length,
      importedRows: importedPlayers.length,
      skippedRows: 0,
      status: 'completed',
      importSummary: `Bulk enrolled ${importedPlayers.length} athletes into auction pool.`,
      importedBy: currentUser.name
    });
    refreshTournamentData(activeTournamentId);
    showToast(`Bulk imported ${importedPlayers.length} athletes!`, 'success');
  };

  // Reset Sample
  const handleResetDatabase = () => {
    db.resetToDefault();
    setActiveTournamentId('tour-ed5-2026');
    refreshTournamentData('tour-ed5-2026');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        activeTournament={activeTournament}
        currentUser={currentUser}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        {/* Top Header Bar */}
        <TopBar
          currentSection={currentSection}
          tournaments={tournaments}
          activeTournament={activeTournament}
          onSelectTournament={handleSelectEdition}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
        />

        {/* Viewport Content Canvas */}
        <main className="flex-1 px-3 py-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {currentUser.role === 'player' &&
          !['fixtures_results', 'standings', 'registrations', 'teams_players', 'auction', 'rules_videos', 'user_access'].includes(currentSection) ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs my-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-4 font-bold shadow-xs">
                🔒
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Warhawks Organizer Privilege Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                This administrative console is restricted to the tournament host (<strong>Warhawks</strong>).
                As a registered <strong>Player</strong>, you have access to official match schedules, live scores, points standings, franchise squad rosters, live auction stream, and self-service tournament registration.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentSection('fixtures_results')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  View Fixtures & Live Scores
                </button>
                <button
                  onClick={() => setCurrentSection('registrations')}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Go to Registration Portal
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentSection === 'dashboard' && (
                <DashboardView
                  tournament={activeTournament}
                  teams={teams}
                  players={players}
                  matches={matches}
                  sponsors={sponsors}
                  expenses={expenses}
                  auditLogs={auditLogs}
                  registrations={registrations}
                  onNavigate={setCurrentSection}
                  onQuickAction={handleQuickAction}
                />
              )}

              {currentSection === 'editions' && (
                <EditionsView
                  tournaments={tournaments}
                  activeTournamentId={activeTournamentId}
                  teams={teams}
                  currentUser={currentUser}
                  onSelectEdition={handleSelectEdition}
                  onCreateEdition={handleCreateTournament}
                  onUpdateEdition={handleUpdateTournament}
                />
              )}

              {currentSection === 'teams_players' && (
                <TeamsPlayersView
                  tournament={activeTournament}
                  teams={teams}
                  players={players}
                  currentUser={currentUser}
                  onCreateTeam={handleCreateTeam}
                  onUpdateTeam={handleUpdateTeam}
                  onDeleteTeam={handleDeleteTeam}
                  onCreatePlayer={handleCreatePlayer}
                  onUpdatePlayer={handleUpdatePlayer}
                  onDeletePlayer={handleDeletePlayer}
                  onOpenImport={() => setCurrentSection('import_history')}
                />
              )}

              {currentSection === 'fixtures_results' && (
                <FixturesResultsView
                  tournament={activeTournament}
                  matches={matches}
                  teams={teams}
                  players={players}
                  currentUser={currentUser}
                  onCreateMatch={handleCreateMatch}
                  onUpdateMatch={handleUpdateMatch}
                  onDeleteMatch={handleDeleteMatch}
                  onOpenImport={() => setCurrentSection('import_history')}
                />
              )}

              {currentSection === 'standings' && (
                <StandingsView
                  tournament={activeTournament}
                  standings={standings}
                  teams={teams}
                  currentUser={currentUser}
                />
              )}

              {currentSection === 'auction' && (
                <AuctionView
                  tournament={activeTournament}
                  teams={teams}
                  players={players}
                  currentUser={currentUser}
                  auctionConfig={auctionConfig}
                  auctionBids={db.getAuctionBids(activeTournamentId)}
                  onPlaceBid={handlePlaceBid}
                  onFinalizeSale={handleFinalizeSale}
                  onMarkUnsold={handleMarkUnsold}
                  onUpdateConfig={updates => {
                    db.updateAuctionConfig(activeTournamentId, updates);
                    refreshTournamentData(activeTournamentId);
                  }}
                />
              )}

              {currentSection === 'sponsorships' && (
                <SponsorshipView
                  tournament={activeTournament}
                  sponsors={sponsors}
                  onCreateSponsor={handleCreateSponsor}
                  onUpdateSponsor={handleUpdateSponsor}
                  onDeleteSponsor={handleDeleteSponsor}
                />
              )}

              {currentSection === 'expenses' && (
                <ExpensesView
                  tournament={activeTournament}
                  expenses={expenses}
                  onCreateExpense={handleCreateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {currentSection === 'food_preferences' && (
                <FoodPreferencesView
                  tournament={activeTournament}
                  foodOrders={foodOrders}
                  teams={teams}
                  players={players}
                  onCreateFoodOrder={handleCreateFoodOrder}
                  onUpdateOrderStatus={handleUpdateFoodStatus}
                />
              )}

              {currentSection === 'rules_videos' && (
                <RulesVideosView
                  tournament={activeTournament}
                  rules={rules}
                  currentUser={currentUser}
                  onCreateRule={handleCreateRule}
                  onUpdateRule={handleUpdateRule}
                  onDeleteRule={handleDeleteRule}
                />
              )}

              {currentSection === 'registrations' && (
                <RegistrationView
                  tournament={activeTournament}
                  registrations={registrations}
                  currentUser={currentUser}
                  onToggleRegistration={handleToggleRegistration}
                  onUpdateRegistrationDates={handleUpdateRegistrationDates}
                  onUpdateStatus={handleUpdateRegistrationStatus}
                  onPlayerRegister={handlePlayerRegister}
                  onCancelRegistration={handleCancelRegistration}
                />
              )}

              {currentSection === 'media_library' && (
                <MediaLibraryView
                  tournament={activeTournament}
                  mediaAssets={mediaAssets}
                  onAddMediaAsset={handleAddMedia}
                  onDeleteMediaAsset={handleDeleteMedia}
                />
              )}

              {currentSection === 'import_history' && (
                <ImportHistoryView
                  tournament={activeTournament}
                  importJobs={importJobs}
                  onImportMatches={handleImportMatches}
                  onImportPlayers={handleImportPlayers}
                />
              )}

              {currentSection === 'user_access' && (
                <UserAccessView
                  tournament={activeTournament}
                  users={db.getUsers()}
                  currentUser={currentUser}
                  onSwitchRole={handleSwitchRole}
                />
              )}

              {currentSection === 'settings' && (
                <SettingsView
                  settings={settings}
                  tournament={activeTournament}
                  onUpdateSettings={updates => {
                    db.updateSettings(updates);
                    setSettings(db.getSettings());
                  }}
                  onResetDatabase={handleResetDatabase}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
        </main>

        {/* Official Warhawks Tournament Organizer Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 sm:py-5 px-3 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm flex items-center gap-1.5">
                <span>🦅 Warhawks</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-600 font-medium">Official Tournament Host & Organizing Branch</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
              <span>Tournament Creation & Roster Governance</span>
              <span className="hidden sm:inline">•</span>
              <span>All Editions Partitioned</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
