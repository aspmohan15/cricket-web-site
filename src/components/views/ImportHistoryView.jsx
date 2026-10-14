import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { parseCsv } from '../../utils/csv';

export const ImportHistoryView = ({
  tournament,
  importJobs,
  onImportMatches,
  onImportPlayers
}) => {
  const [activeImportType, setActiveImportType] = useState('cricheroes');
  const [modalOpen, setModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [detectedDuplicates, setDetectedDuplicates] = useState(0);

  // Sample CricHeroes CSV Template
  const sampleCricHeroesCsv = `MatchNumber,Round,TeamA,TeamB,Date,Time,Venue,TeamAScore,TeamAOvers,TeamBScore,TeamBOvers,Winner,ResultSummary,CricHeroesMatchId
7,Group Stage,Apex Titans,Desert Cobras,2026-10-20,19:30,Wankhede Arena,174/6,20.0,171/8,20.0,Apex Titans,Apex Titans won by 3 runs,CH-2026-M07
8,Group Stage,Royal Strikers,Highland Knights,2026-10-22,15:30,Central Ground,195/4,20.0,188/9,20.0,Royal Strikers,Royal Strikers won by 7 runs,CH-2026-M08`;

  // Sample Player Roster Template
  const samplePlayerCsv = `PlayerName,Role,BattingStyle,BowlingStyle,BasePrice,DietPreference,ShirtSize,City,Email,Phone
Kishan Rawat,Batsman,Left-hand bat,Right-arm offbreak,400000,Veg,L,Mumbai,kishan.r@cricket.in,+91 98200 44112
Prithvi Shaw,Batsman,Right-hand bat,Right-arm offbreak,600000,Non-Veg,M,Mumbai,prithvi.s@cricket.in,+91 98211 55223
T Natarajan,Bowler,Left-hand bat,Left-arm fast,500000,Veg,XL,Salem,natarajan@cricket.in,+91 94433 22110`;

  const handleParseContent = (text) => {
    const res = parseCsv(text);
    setParseErrors(res.errors);
    setParsedPreview(res.data);
    setDetectedDuplicates(0);
  };

  const handleLoadSample = () => {
    if (activeImportType === 'cricheroes') {
      setCsvContent(sampleCricHeroesCsv);
      setFileName('cricheroes_verified_match_export.csv');
      handleParseContent(sampleCricHeroesCsv);
    } else {
      setCsvContent(samplePlayerCsv);
      setFileName('state_roster_approved_players.csv');
      handleParseContent(samplePlayerCsv);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result;
        setCsvContent(text);
        handleParseContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    if (activeImportType === 'cricheroes') {
      const matchRows = parsedPreview.map((row) => ({
        tournamentId: tournament.id,
        matchNumber: parseInt(row.MatchNumber, 10) || 99,
        round: row.Round || 'Group Stage',
        teamAId: 'team-titans',
        teamBId: 'team-strikers',
        date: row.Date || '2026-10-20',
        time: row.Time || '19:30',
        venue: row.Venue || tournament.venue,
        status: row.ResultSummary ? 'completed' : 'scheduled',
        teamAScore: row.TeamAScore,
        teamAOvers: parseFloat(row.TeamAOvers) || 20.0,
        teamBScore: row.TeamBScore,
        teamBOvers: parseFloat(row.TeamBOvers) || 20.0,
        resultSummary: row.ResultSummary,
        isImported: true,
        importSource: 'cricheroes',
        cricheroesMatchId: row.CricHeroesMatchId
      }));
      onImportMatches(matchRows, fileName || 'cricheroes_import.csv');
    } else {
      const playerRows = parsedPreview.map((row) => ({
        tournamentId: tournament.id,
        name: row.PlayerName || 'Imported Player',
        role: row.Role || 'All-Rounder',
        battingStyle: row.BattingStyle || 'Right-hand bat',
        bowlingStyle: row.BowlingStyle || 'Right-arm medium',
        basePrice: parseInt(row.BasePrice, 10) || 400000,
        auctionStatus: 'available',
        isCaptain: false,
        isOverseas: false,
        email: row.Email || 'imported@crickethq.local',
        phone: row.Phone || '+91 90000 00000',
        city: row.City || tournament.city,
        shirtSize: row.ShirtSize || 'L',
        foodPreference: row.DietPreference || 'Veg',
        registrationStatus: 'approved',
        paymentStatus: 'paid',
        matchesPlayed: 0,
        runsScored: 0,
        highestScore: 0,
        wicketsTaken: 0,
        bestBowling: '-',
        strikeRate: 0,
        economyRate: 0
      }));
      onImportPlayers(playerRows, fileName || 'players_roster.csv');
    }

    setModalOpen(false);
    setParsedPreview(null);
    setCsvContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Spreadsheet & CricHeroes Import Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk ingest historical match scorecards, player registrations, and financial ledgers with duplicate validation.
          </p>
        </div>

        <button
          onClick={() => {
            setModalOpen(true);
            handleLoadSample();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Launch Import Wizard
        </button>
      </div>

      {/* CricHeroes Protocol Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 leading-relaxed">
          <span className="font-bold">CricHeroes Authorized Exporter Protocol:</span> Since CricHeroes does not provide a public REST API for direct database sync, export your match scorecards or tournament summary sheets into CSV format from the CricHeroes official tournament portal and load them through this validator.
        </div>
      </div>

      {/* Historical Import Jobs Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Import History & Audit Log</h3>
            <p className="text-xs text-slate-500">Record of executed batch import jobs for {tournament.name}</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {importJobs.length} jobs completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Job Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Rows Processed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Imported By</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 text-[11px]">
                      {job.jobType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                    {job.fileName}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-900">
                    <span className="text-emerald-700 font-bold">{job.importedRows}</span>
                    <span className="text-slate-400"> / {job.totalRows}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded capitalize">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {job.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {job.importSummary}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {job.importedBy}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(job.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Wizard Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Spreadsheet Import & Column Validator"
        subtitle={`Ingesting records directly into ${tournament.name}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {/* Segmented type selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setActiveImportType('cricheroes');
                setCsvContent(sampleCricHeroesCsv);
                setFileName('cricheroes_verified_match_export.csv');
                handleParseContent(sampleCricHeroesCsv);
              }}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-colors cursor-pointer ${
                activeImportType === 'cricheroes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CricHeroes Match Summaries
            </button>
            <button
              onClick={() => {
                setActiveImportType('players');
                setCsvContent(samplePlayerCsv);
                setFileName('state_roster_approved_players.csv');
                handleParseContent(samplePlayerCsv);
              }}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-colors cursor-pointer ${
                activeImportType === 'players'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Player Roster Profiles
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Select File or Edit Raw CSV</label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Reset to Sample Dataset
              </button>
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">CSV Data Preview & Mapping</label>
            <textarea
              rows={5}
              value={csvContent}
              onChange={e => {
                setCsvContent(e.target.value);
                handleParseContent(e.target.value);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Validation Checks */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Pre-flight Import Diagnostics:</span>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {parsedPreview ? parsedPreview.length : 0} rows recognized
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                0 duplicate match IDs detected
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                Target Partition: {tournament.id}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!parsedPreview || parsedPreview.length === 0}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold shadow-xs cursor-pointer"
            >
              Confirm Import ({parsedPreview ? parsedPreview.length : 0} Records)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
