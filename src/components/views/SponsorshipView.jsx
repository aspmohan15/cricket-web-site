import React, { useState } from 'react';
import {
  BadgePercent,
  Plus,
  Globe,
  Mail,
  User,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SPONSOR_TIERS } from '../../constants';

export const SponsorshipView = ({
  tournament,
  sponsors,
  onCreateSponsor,
  onUpdateSponsor,
  onDeleteSponsor
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    tier: 'Associate Sponsor',
    contributionAmount: 2500000,
    benefitsDescription: '',
    websiteUrl: '',
    contactPerson: '',
    contactEmail: '',
    isActive: true,
    displayOnPublicWeb: true
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateSponsor({
      tournamentId: tournament.id,
      name: form.name,
      tier: form.tier,
      contributionAmount: form.contributionAmount,
      benefitsDescription: form.benefitsDescription,
      websiteUrl: form.websiteUrl,
      contactPerson: form.contactPerson,
      contactEmail: form.contactEmail,
      isActive: form.isActive,
      displayOnPublicWeb: form.displayOnPublicWeb
    });
    setCreateModalOpen(false);
  };

  const totalCommitted = sponsors.reduce((acc, s) => acc + s.contributionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sponsorship Partnerships</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate brand agreements, sponsorship tiers, and website visibility for {tournament.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-medium">Total Sponsorship Raised: </span>
            <span className="font-bold font-mono text-emerald-900">₹{(totalCommitted / 100000).toFixed(1)} Lakhs</span>
          </div>
          <button
            onClick={() => {
              setForm({
                name: '',
                tier: 'Associate Sponsor',
                contributionAmount: 2000000,
                benefitsDescription: 'Boundary perimeter LED board rotations, VIP corporate box passes, and digital website link.',
                websiteUrl: 'https://',
                contactPerson: '',
                contactEmail: '',
                isActive: true,
                displayOnPublicWeb: true
              });
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Sponsor
          </button>
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map(sponsor => {
          return (
            <div
              key={sponsor.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                      {sponsor.tier}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5">{sponsor.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSponsor(sponsor)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit sponsor"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove sponsor ${sponsor.name}?`)) {
                          onDeleteSponsor(sponsor.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete sponsor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Benefits & Deliverables:</span>
                  {sponsor.benefitsDescription}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sponsor.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sponsor.contactEmail}</span>
                  </div>
                  {sponsor.websiteUrl && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={sponsor.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline truncate"
                      >
                        {sponsor.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with Amount & Public Web Toggle */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contribution</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{sponsor.contributionAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateSponsor(sponsor.id, { displayOnPublicWeb: !sponsor.displayOnPublicWeb })}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      sponsor.displayOnPublicWeb
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {sponsor.displayOnPublicWeb ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{sponsor.displayOnPublicWeb ? 'Public Live' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Sponsor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Tournament Sponsor"
        subtitle={`Associate partnership with ${tournament.name}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Telecom"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sponsorship Tier</label>
              <select
                value={form.tier}
                onChange={e => setForm({ ...form, tier: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {SPONSOR_TIERS.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Financial Commitment (₹)</label>
              <input
                type="number"
                required
                step={100000}
                value={form.contributionAmount}
                onChange={e => setForm({ ...form, contributionAmount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Benefits & Deliverables</label>
              <textarea
                rows={3}
                required
                value={form.benefitsDescription}
                onChange={e => setForm({ ...form, benefitsDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={form.contactPerson}
                onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                required
                placeholder="email@company.com"
                value={form.contactEmail}
                onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={form.websiteUrl}
                onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="displayWeb"
                checked={form.displayOnPublicWeb}
                onChange={e => setForm({ ...form, displayOnPublicWeb: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="displayWeb" className="font-semibold text-slate-700 cursor-pointer">
                Display on Public Tournament Website
              </label>
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
              Save Sponsor
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Sponsor Modal */}
      {editingSponsor && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSponsor(null)}
          title={`Edit ${editingSponsor.name}`}
          subtitle="Update sponsorship deliverables"
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              onUpdateSponsor(editingSponsor.id, editingSponsor);
              setEditingSponsor(null);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editingSponsor.name}
                  onChange={e => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contribution (₹)</label>
                <input
                  type="number"
                  value={editingSponsor.contributionAmount}
                  onChange={e => setEditingSponsor({ ...editingSponsor, contributionAmount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Benefits</label>
                <textarea
                  rows={3}
                  value={editingSponsor.benefitsDescription}
                  onChange={e => setEditingSponsor({ ...editingSponsor, benefitsDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingSponsor(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
