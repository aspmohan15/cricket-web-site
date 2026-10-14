import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Trophy,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const FixturesResultsView = ({
  tournament,
  matches,
  teams,
  players,
  onCreateMatch,
  onUpdateMatch,
  onDeleteMatch,
  onOpenImport
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState(null);

  // New Match Form State
  const [matchForm, setMatchForm] = useState({
    matchNumber: matches.length + 1,
    round: 'Group Stage',
    teamAId: teams[0]?.id || '',
    teamBId: teams[1]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    venue: tournament?.venue || 'Stadium Ground',
    status: 'scheduled'
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (matchForm.teamAId === matchForm.teamBId) {
      alert('Team A and Team B cannot be the same!');
      return;
    }
    onCreateMatch({
      tournamentId: tournament.id,
      matchNumber: matchForm.matchNumber,
      round: matchForm.round,
      teamAId: matchForm.teamAId,
      teamBId: matchForm.teamBId,
      date: matchForm.date,
      time: matchForm.time,
      venue: matchForm.venue,
      status: matchForm.status,
      isImported: false,
      importSource: 'manual'
    });
    setCreateModalOpen(false);
  };

  const handleScorecardSubmit = (e) => {
    e.preventDefault();
    if (!scoringMatch) return;
    onUpdateMatch(scoringMatch.id, scoringMatch);
    setScoringMatch(null);
  };

  const filteredMatches = matches.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fixtures, Live Scores & Results</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule tournament fixtures, enter real-time CricHeroes match results, and publish official outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
            Import CricHeroes CSV
          </button>
          <button
            onClick={() => {
              setMatchForm({
                matchNumber: matches.length + 1,
                round: 'Group Stage',
                teamAId: teams[0]?.id || '',
                teamBId: teams[1]?.id || '',
                date: new Date().toISOString().split('T')[0],
                time: '19:30',
                venue: tournament?.venue || 'Stadium Ground',
                status: 'scheduled'
              });
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Match
          </button>
        </div>
      </div>

      {/* Status Segment Filter */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium mr-1">Filter Fixtures:</span>
        {[
          { id: 'all', label: `All (${matches.length})` },
          { id: 'live', label: `Live (${matches.filter(m => m.status === 'live').length})` },
          { id: 'scheduled', label: `Scheduled (${matches.filter(m => m.status === 'scheduled').length})` },
          { id: 'completed', label: `Completed (${matches.filter(m => m.status === 'completed').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No matches found for the selected filter.
          </div>
        ) : (
          filteredMatches.map(match => {
            const teamA = teams.find(t => t.id === match.teamAId);
            const teamB = teams.find(t => t.id === match.teamBId);
            const motm = players.find(p => p.id === match.manOfTheMatchPlayerId);

            return (
              <div
                key={match.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Match #{match.matchNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-medium">{match.round}</span>
                    {match.isImported && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.2 rounded font-mono">
                        CricHeroes
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                        match.status === 'live'
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : match.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {match.status}
                    </span>

                    <button
                      onClick={() => setScoringMatch({ ...match })}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Update scorecard"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete Match #${match.matchNumber}?`)) {
                          onDeleteMatch(match.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete fixture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Score Area */}
                <div className="p-4 space-y-3">
                  {/* Team A */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: teamA?.primaryColor || '#0284c7' }}
                      />
                      <span className="font-bold text-slate-900 text-sm">{teamA?.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({teamA?.shortCode})</span>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-base font-bold text-slate-900">{match.teamAScore || '—'}</span>
                      {match.teamAOvers !== undefined && (
                        <span className="text-xs text-slate-400 ml-1.5">({match.teamAOvers} ov)</span>
                      )}
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: teamB?.primaryColor || '#dc2626' }}
                      />
                      <span className="font-bold text-slate-900 text-sm">{teamB?.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({teamB?.shortCode})</span>
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-base font-bold text-slate-900">{match.teamBScore || '—'}</span>
                      {match.teamBOvers !== undefined && (
                        <span className="text-xs text-slate-400 ml-1.5">({match.teamBOvers} ov)</span>
                      )}
                    </div>
                  </div>

                  {/* Result banner */}
                  {match.resultSummary && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                      <span>{match.resultSummary}</span>
                      {motm && (
                        <span className="text-[11px] text-emerald-700 font-normal">
                          PoM: {motm.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer details */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {match.date} · {match.time}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {match.venue?.split(',')[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => setScoringMatch({ ...match })}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Edit Scorecard →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Match Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Fixture"
        subtitle={`Schedule match in ${tournament?.name}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Match Number</label>
              <input
                type="number"
                required
                min={1}
                value={matchForm.matchNumber}
                onChange={e => setMatchForm({ ...matchForm, matchNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tournament Stage / Round</label>
              <select
                value={matchForm.round}
                onChange={e => setMatchForm({ ...matchForm, round: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Group Stage">Group Stage</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final 1">Semi Final 1</option>
                <option value="Semi Final 2">Semi Final 2</option>
                <option value="Grand Final">Grand Final</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Team A (Home)</label>
              <select
                value={matchForm.teamAId}
                onChange={e => setMatchForm({ ...matchForm, teamAId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Team B (Away)</label>
              <select
                value={matchForm.teamBId}
                onChange={e => setMatchForm({ ...matchForm, teamBId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={matchForm.date}
                onChange={e => setMatchForm({ ...matchForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={matchForm.time}
                onChange={e => setMatchForm({ ...matchForm, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Ground & Pitch Venue</label>
              <input
                type="text"
                required
                value={matchForm.venue}
                onChange={e => setMatchForm({ ...matchForm, venue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              Schedule Fixture
            </button>
          </div>
        </form>
      </Modal>

      {/* Live Scorecard & Result Sign-Off Modal */}
      {scoringMatch && (
        <Modal
          isOpen={true}
          onClose={() => setScoringMatch(null)}
          title={`Scorecard: Match #${scoringMatch.matchNumber}`}
          subtitle={`${teams.find(t => t.id === scoringMatch.teamAId)?.name} vs ${teams.find(t => t.id === scoringMatch.teamBId)?.name}`}
          maxWidth="xl"
        >
          <form onSubmit={handleScorecardSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Match Status</label>
                <select
                  value={scoringMatch.status}
                  onChange={e => setScoringMatch({ ...scoringMatch, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live In Progress</option>
                  <option value="completed">Completed (Final Result)</option>
                  <option value="abandoned">Abandoned / Washout</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Winning Team</label>
                <select
                  value={scoringMatch.winnerId || ''}
                  onChange={e => setScoringMatch({ ...scoringMatch, winnerId: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">No Winner / Ongoing</option>
                  <option value={scoringMatch.teamAId}>{teams.find(t => t.id === scoringMatch.teamAId)?.name}</option>
                  <option value={scoringMatch.teamBId}>{teams.find(t => t.id === scoringMatch.teamBId)?.name}</option>
                </select>
              </div>

              {/* Team A Scores */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">
                  {teams.find(t => t.id === scoringMatch.teamAId)?.name} Score
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Runs / Wickets (e.g. 188/5)</label>
                    <input
                      type="text"
                      placeholder="188/5"
                      value={scoringMatch.teamAScore || ''}
                      onChange={e => setScoringMatch({ ...scoringMatch, teamAScore: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Overs Faced</label>
                    <input
                      type="number"
                      step={0.1}
                      placeholder="20.0"
                      value={scoringMatch.teamAOvers || ''}
                      onChange={e => setScoringMatch({ ...scoringMatch, teamAOvers: parseFloat(e.target.value) || undefined })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Team B Scores */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">
                  {teams.find(t => t.id === scoringMatch.teamBId)?.name} Score
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Runs / Wickets (e.g. 182/7)</label>
                    <input
                      type="text"
                      placeholder="182/7"
                      value={scoringMatch.teamBScore || ''}
                      onChange={e => setScoringMatch({ ...scoringMatch, teamBScore: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Overs Faced</label>
                    <input
                      type="number"
                      step={0.1}
                      placeholder="20.0"
                      value={scoringMatch.teamBOvers || ''}
                      onChange={e => setScoringMatch({ ...scoringMatch, teamBOvers: parseFloat(e.target.value) || undefined })}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Official Result Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Titans won by 6 runs"
                  value={scoringMatch.resultSummary || ''}
                  onChange={e => setScoringMatch({ ...scoringMatch, resultSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block font-semibold text-slate-700 mb-1">Player of the Match</label>
                <select
                  value={scoringMatch.manOfTheMatchPlayerId || ''}
                  onChange={e => setScoringMatch({ ...scoringMatch, manOfTheMatchPlayerId: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="">Select Player...</option>
                  {players
                    .filter(p => p.teamId === scoringMatch.teamAId || p.teamId === scoringMatch.teamBId)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({teams.find(t => t.id === p.teamId)?.shortCode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">CricHeroes Scorecard ID (Optional)</label>
                <input
                  type="text"
                  placeholder="CH-2026-M04"
                  value={scoringMatch.cricheroesMatchId || ''}
                  onChange={e => setScoringMatch({ ...scoringMatch, cricheroesMatchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setScoringMatch(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                Sign-off & Update Standings
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
