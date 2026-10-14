import React from 'react';
import {
  ListOrdered,
  Download,
  Info,
  Trophy,
  ArrowUpRight
} from 'lucide-react';
import { exportToCsv } from '../../utils/csv';

export const StandingsView = ({
  tournament,
  standings,
  teams
}) => {
  const handleExportStandings = () => {
    const rows = standings.map((s, idx) => {
      const team = teams.find(t => t.id === s.teamId);
      return {
        Position: idx + 1,
        Team: team ? team.name : s.teamId,
        Played: s.matchesPlayed,
        Won: s.won,
        Lost: s.lost,
        Tied: s.tied,
        Points: s.points,
        RunsScored: s.runsScored,
        OversFaced: s.oversFaced,
        RunsConceded: s.runsConceded,
        OversBowled: s.oversBowled,
        NetRunRate: s.netRunRate
      };
    });
    exportToCsv(`${tournament?.name?.replace(/\s+/g, '_') || 'Tournament'}_Official_Standings`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Points Table & Net Run Rate (NRR)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-calculated standings from verified match scorecards with ICC standard Net Run Rate formulas.
          </p>
        </div>

        <button
          onClick={handleExportStandings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Points Table (CSV)
        </button>
      </div>

      {/* Standings Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Pos</th>
                <th className="py-3 px-4">Franchise Team</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center">T/NR</th>
                <th className="py-3 px-4 text-center font-bold text-slate-900">Pts</th>
                <th className="py-3 px-4 text-right">Runs (For / Against)</th>
                <th className="py-3 px-4 text-right">NRR</th>
                <th className="py-3 px-4 text-center">Qualification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {standings.map((row, idx) => {
                const team = teams.find(t => t.id === row.teamId);
                const isTop4 = idx < 4;

                return (
                  <tr
                    key={row.teamId}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isTop4 ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: team?.primaryColor || '#0284c7' }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {team?.name || 'Unknown Team'}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({team?.shortCode})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {team?.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-800 font-medium">
                      {row.matchesPlayed}
                    </td>
                    <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">
                      {row.won}
                    </td>
                    <td className="py-3.5 px-3 text-center text-rose-700 font-medium">
                      {row.lost}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500">
                      {row.tied + row.noResult}
                    </td>

                    <td className="py-3.5 px-4 text-center text-sm font-extrabold text-slate-900 bg-slate-50/50">
                      {row.points}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[11px] text-slate-600">
                      <div>{row.runsScored} / {row.oversFaced} ov</div>
                      <div className="text-slate-400">{row.runsConceded} / {row.oversBowled} ov</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={`${
                          row.netRunRate > 0
                            ? 'text-emerald-700'
                            : row.netRunRate < 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {row.netRunRate > 0 ? `+${row.netRunRate.toFixed(3)}` : row.netRunRate.toFixed(3)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      {isTop4 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                          Playoff Bound <ArrowUpRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Elimination Zone
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* NRR Formula Explainer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-700">ICC Net Run Rate Calculation:</span> NRR is calculated as (Total Runs Scored / Total Overs Faced) minus (Total Runs Conceded / Total Overs Bowled). In matches where a team is bowled out inside 20 overs, their full quota of 20 overs is applied. Ties are awarded {tournament?.pointsPerTie || 1} point each; wins receive {tournament?.pointsPerWin || 2} points.
          </div>
        </div>
      </div>
    </div>
  );
};
