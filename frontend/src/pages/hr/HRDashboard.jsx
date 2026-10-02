import React, { useState, useEffect } from 'react';
import { FileText, Search, Edit } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { SelectField } from '../../components/forms/SelectField';
import { TextareaField } from '../../components/forms/TextareaField';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../hooks/useToast';
import { COMPLAINT_CATEGORIES } from '../../constants';

export const HRDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [updateData, setUpdateData] = useState({
    status: '',
    resolution_summary: '',
  });

  const { showToast } = useToast();

  const filteredCases = cases.filter((c) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [c.tracking_code, c.title, c.category]
      .some((value) => String(value || '').toLowerCase().includes(query));
    return matchesSearch && (!statusFilter || c.status === statusFilter) &&
      (!categoryFilter || c.category === categoryFilter);
  });

  const fetchCases = async () => {
    try {
      const res = await apiClient.get('/hr/cases');
      if (res.success) {
        setCases(res.data);
      }
    } catch (err) {
      showToast('Failed to load HR cases', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const openStatusModal = (c) => {
    setSelectedCase(c);
    setUpdateData({
      status: c.status,
      resolution_summary: c.resolution_summary || '',
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await apiClient.patch(`/hr/cases/${selectedCase.id}`, updateData);
      if (res.success) {
        showToast(`Case ${selectedCase.tracking_code} updated successfully`, 'success');
        setCases((prev) =>
          prev.map((c) => (c.id === selectedCase.id ? { ...c, ...updateData } : c))
        );
        setStatusModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading POSH Internal Committee case registry..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          POSH Internal Committee (IC) Case Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Confidential workplace and institutional incident management, evidence review, and resolution records.
        </p>
      </div>

      {cases.length === 0 ? (
        <EmptyState icon={FileText} title="No active cases on record" description="No complaints are currently pending review." />
      ) : (
        <>
        <Card className="p-4 border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="relative block">
              <span className="sr-only">Search cases</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search code, subject, or category" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="">All statuses</option>
              {['submitted', 'under_review', 'investigation_in_progress', 'hearing_scheduled', 'resolved', 'closed', 'escalated_to_ngo'].map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="">All categories</option>
              {COMPLAINT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs text-slate-500">Showing {filteredCases.length} of {cases.length} cases</p>
        </Card>
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Case Code</th>
                  <th className="py-3.5 px-6">Subject / Category</th>
                  <th className="py-3.5 px-6">Reporter</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                      No cases match these filters. Try changing the search or filter selections.
                    </td>
                  </tr>
                ) : filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-teal-700">{c.tracking_code}</td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800">{c.title}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{c.category.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {c.is_anonymous ? (
                        <span className="text-slate-400 italic font-medium">Anonymous</span>
                      ) : (
                        'Verified Employee'
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant={c.severity === 'high' || c.severity === 'critical' ? 'danger' : 'neutral'}>
                        {c.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant="blue">{c.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button variant="outline" size="sm" icon={Edit} onClick={() => openStatusModal(c)}>
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      )}

      {/* Update Case Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Case Status & Findings">
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <SelectField
            label="Investigation Milestone / Status"
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            options={[
              { value: 'submitted', label: 'Submitted / Awaiting Review' },
              { value: 'under_review', label: 'Under IC Committee Review' },
              { value: 'investigation_in_progress', label: 'Investigation In Progress' },
              { value: 'hearing_scheduled', label: 'Hearing Scheduled' },
              { value: 'resolved', label: 'Resolved / Action Completed' },
              { value: 'closed', label: 'Closed' },
              { value: 'escalated_to_ngo', label: 'Escalated to External Support' },
            ]}
            required
          />

          <TextareaField
            label="Resolution Summary & Committee Notes"
            rows={4}
            placeholder="Document formal decisions, warnings issued, or counseling referrals..."
            value={updateData.resolution_summary}
            onChange={(e) => setUpdateData({ ...updateData, resolution_summary: e.target.value })}
            helperText="Visible to complainant during status tracking lookup."
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updating}>
              Save Case Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
