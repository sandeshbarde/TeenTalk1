import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Shield, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Card, CardHeader } from '../../components/common/Card';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';

export const TrackComplaintPage = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async (codeToSearch) => {
    const query = codeToSearch || trackingCode;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setCaseData(null);

    try {
      const res = await apiClient.get(`/complaints/${query.trim()}`);
      if (res.success && res.data) {
        setCaseData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Case tracking code not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchStatus(initialCode);
    }
  }, [initialCode]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge variant="success">Resolved</Badge>;
      case 'investigation_in_progress':
        return <Badge variant="warning">Investigation Active</Badge>;
      case 'under_review':
        return <Badge variant="blue">Under Committee Review</Badge>;
      default:
        return <Badge variant="neutral">Report Submitted</Badge>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Confidential Case Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter your unique tracking token to view real-time investigation stages, IC notices, and resolution status.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 sm:p-6 mb-8 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStatus();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <InputField
              placeholder="e.g. TT-CASE-2026-00112233445566778899AABBCCDDEEFF"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" isLoading={loading} icon={Search}>
            Track Case
          </Button>
        </form>
      </Card>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center mb-6">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Locating encrypted incident record..." />}

      {caseData && (
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                {caseData.tracking_code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{caseData.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filed on {new Date(caseData.created_at).toLocaleDateString()} • {caseData.organization_name}
              </p>
            </div>
            <div>{getStatusBadge(caseData.status)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Category</span>
              <span className="font-semibold text-slate-800">{caseData.category.replace(/_/g, ' ')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Severity</span>
              <span className="font-semibold text-slate-800 uppercase">{caseData.severity}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Assigned Officer</span>
              <span className="font-semibold text-slate-800">{caseData.assigned_name || 'IC Quorum'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Incident Summary on Record
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
              {caseData.description}
            </p>
          </div>

          {caseData.resolution_summary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Committee Findings & Redressal Action
              </h4>
              <p className="text-xs text-emerald-950 leading-relaxed mt-1">
                {caseData.resolution_summary}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
