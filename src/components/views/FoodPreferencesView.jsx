import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Download,
  CheckCircle,
  Clock,
  CheckCheck,
  Filter,
  User,
  Coffee
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { exportToCsv } from '../../utils/csv';
import { FOOD_PREFERENCES, MEAL_TYPES, MEAL_STATUSES } from '../../constants';

export const FoodPreferencesView = ({
  tournament,
  foodOrders,
  teams,
  players,
  onCreateFoodOrder,
  onUpdateOrderStatus
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    teamId: teams[0]?.id || '',
    playerId: players[0]?.id || '',
    mealType: 'Lunch',
    date: new Date().toISOString().split('T')[0],
    foodChoice: 'Veg',
    quantity: 1,
    status: 'confirmed',
    specialInstructions: ''
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateFoodOrder({
      tournamentId: tournament.id,
      teamId: form.teamId,
      playerId: form.playerId,
      mealType: form.mealType,
      date: form.date,
      foodChoice: form.foodChoice,
      quantity: form.quantity,
      status: form.status,
      specialInstructions: form.specialInstructions
    });
    setCreateModalOpen(false);
  };

  const handleExportCateringSheet = () => {
    const rows = foodOrders.map(f => {
      const team = teams.find(t => t.id === f.teamId);
      const player = players.find(p => p.id === f.playerId);
      return {
        Date: f.date,
        MealType: f.mealType,
        Team: team?.name || 'Unassigned',
        Player: player?.name || 'Staff / Official',
        DietaryPreference: f.foodChoice,
        Quantity: f.quantity,
        Status: f.status,
        Instructions: f.specialInstructions || ''
      };
    });
    exportToCsv(`${tournament.name.replace(/\s+/g, '_')}_Catering_Distribution_Sheet`, rows);
  };

  // Diet statistics across all registered players
  const dietStats = {
    Veg: players.filter(p => p.foodPreference === 'Veg').length,
    'Non-Veg': players.filter(p => p.foodPreference === 'Non-Veg').length,
    Jain: players.filter(p => p.foodPreference === 'Jain').length,
    Vegan: players.filter(p => p.foodPreference === 'Vegan').length,
    Halal: players.filter(p => p.foodPreference === 'Halal').length
  };

  const filteredOrders = foodOrders.filter(o => {
    if (teamFilter !== 'all' && o.teamId !== teamFilter) return false;
    if (mealFilter !== 'all' && o.mealType !== mealFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Player Food & Dietary Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track nutritional preferences, match-day catering buffets, and distribution status for {tournament.name}.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={handleExportCateringSheet}
            className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sheet</span>
          </button>
          <button
            onClick={() => {
              setForm({
                teamId: teams[0]?.id || '',
                playerId: players[0]?.id || '',
                mealType: 'Lunch',
                date: new Date().toISOString().split('T')[0],
                foodChoice: 'Veg',
                quantity: 1,
                status: 'confirmed',
                specialInstructions: ''
              });
              setCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Meal Order</span>
          </button>
        </div>
      </div>

      {/* Dietary Census Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {FOOD_PREFERENCES.map(diet => (
          <div
            key={diet}
            className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs text-center last:col-span-2 sm:last:col-span-1"
          >
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block uppercase tracking-wider truncate">
              {diet}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {dietStats[diet] || 0}
            </span>
            <span className="text-[10px] text-slate-400">Athletes</span>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            <option value="all">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Meal Type Filter */}
          <select
            value={mealFilter}
            onChange={e => setMealFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            <option value="all">All Meals</option>
            {MEAL_TYPES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {MEAL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Meal Order Cards (Mobile < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No meal orders match this filter.
          </div>
        ) : (
          filteredOrders.map(order => {
            const team = teams.find(t => t.id === order.teamId);
            const player = players.find(p => p.id === order.playerId);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-slate-900 text-sm truncate">{player?.name || 'Staff Member'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{team?.name || 'Tournament Official'}</div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize shrink-0 ${
                      order.status === 'served'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Meal Type</span>
                    <span className="font-semibold text-slate-800">{order.mealType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Diet Choice</span>
                    <span className="text-slate-700 font-medium">{order.foodChoice} ({order.quantity} portion)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Instructions</span>
                    <span className="text-slate-600 truncate block">{order.specialInstructions || 'Standard sports buffet'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">{order.date}</span>

                  <div className="flex items-center gap-1.5">
                    {order.status !== 'served' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'served')}
                        className="px-3 py-1.5 min-h-[34px] rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Mark Served
                      </button>
                    )}
                    {order.status === 'requested' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                        className="px-3 py-1.5 min-h-[34px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Meal Orders Table (md+) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Beneficiary Athlete</th>
                <th className="py-3 px-4">Meal Window</th>
                <th className="py-3 px-4">Diet Choice</th>
                <th className="py-3 px-4">Date & Qty</th>
                <th className="py-3 px-4">Special Instructions</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No meal records found for selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const team = teams.find(t => t.id === order.teamId);
                  const player = players.find(p => p.id === order.playerId);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{player?.name || 'Staff Member'}</div>
                        <div className="text-[11px] text-slate-400">{team?.name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {order.mealType}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {order.foodChoice}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div>{order.date}</div>
                        <div className="text-[10px] text-slate-400">{order.quantity} portion(s)</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {order.specialInstructions || 'Standard sports buffet'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                            order.status === 'served'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.status !== 'served' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'served')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Mark Served
                            </button>
                          )}
                          {order.status === 'requested' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Meal Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Log Player Meal Order"
        subtitle={`Match day catering reservation for ${tournament.name}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Franchise Team</label>
              <select
                value={form.teamId}
                onChange={e => {
                  const tId = e.target.value;
                  const firstP = players.find(p => p.teamId === tId);
                  setForm({ ...form, teamId: tId, playerId: firstP?.id || '' });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Player</label>
              <select
                value={form.playerId}
                onChange={e => {
                  const p = players.find(x => x.id === e.target.value);
                  setForm({
                    ...form,
                    playerId: e.target.value,
                    foodChoice: p?.foodPreference || form.foodChoice
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {players
                  .filter(p => !form.teamId || p.teamId === form.teamId)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.foodPreference})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meal Window</label>
              <select
                value={form.mealType}
                onChange={e => setForm({ ...form, mealType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {MEAL_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Category</label>
              <select
                value={form.foodChoice}
                onChange={e => setForm({ ...form, foodChoice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {FOOD_PREFERENCES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portion Quantity</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Special Dietary Instructions</label>
              <input
                type="text"
                placeholder="e.g. Gluten-free bread, no onion/garlic, hydration electrolytes"
                value={form.specialInstructions}
                onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              Save Meal Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
