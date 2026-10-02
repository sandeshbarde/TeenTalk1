import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  User,
  Building,
  Calendar,
  MessageSquare,
  Send,
  FileCheck2,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { AlertBanner } from '../../components/feedback/AlertBanner';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCase = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/complaints/${id}`);
      if (res.success && res.data) {
        setCaseData(res.data);
        setStatusUpdate(res.data.status);
      } else {
        setError('Unable to locate this case report. Please verify your tracking ID.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load case details. You may need authorized credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCase();
    }
  }, [id]);

  const handleDownloadEvidence = async (evidenceId, fileName) => {
    try {
      const token = localStorage.getItem('teentalk_token');
      const response = await fetch(`/api/complaints/${caseData.id}/evidence/${evidenceId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unauthorized evidence download or file not found');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Downloaded: ${fileName}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download evidence file', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setAddingNote(true);
    try {
      // Endpoint depends on role: HR or Counselor
      const endpoint = user?.role === 'hr'
        ? `/hr/cases/${caseData.id}/notes`
        : `/counselor/notes`;

      const payload = user?.role === 'hr'
        ? { note_text: noteContent.trim() }
        : { complaint_id: caseData.id, note_text: noteContent.trim(), is_private: true };

      const res = await apiClient.post(endpoint, payload);
      if (res.success) {
        showToast('Case note recorded securely', 'success');
        setNoteContent('');
        fetchCase();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add case note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await apiClient.patch(`/hr/cases/${caseData.id}`, { status: newStatus });
      if (res.success) {
        showToast(`Case status updated to "${newStatus}"`, 'success');
        setStatusUpdate(newStatus);
        fetchCase();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update case status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Card className="p-8 text-center space-y-4 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-warmrose-100 text-warmrose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Case Record Not Accessible</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isHandler = ['counselor', 'hr', 'super_admin', 'ngo'].includes(user?.role);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to complaints
        </button>
      </div>

      {/* Case Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary">CASE REPORT</Badge>
            <span className="font-mono text-xs font-bold text-slate-500">
              #{caseData.tracking_code}
            </span>
            {caseData.is_anonymous && (
              <Badge variant="neutral" className="gap-1">
                <Lock className="w-3 h-3" /> Anonymous
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Filed on {new Date(caseData.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              caseData.status === 'resolved'
                ? 'mint'
                : caseData.status === 'under_investigation' || caseData.status === 'in_review'
                ? 'primary'
                : 'neutral'
            }
            className="text-sm px-3 py-1 uppercase tracking-wider"
          >
            {caseData.status.replace('_', ' ')}
          </Badge>

          {isHandler && (
            <select
              value={statusUpdate}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={updatingStatus}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white focus:ring-2 focus:ring-lavender-500"
            >
              <option value="submitted">Submitted</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Narrative */}
        <div className="lg:col-span-8 space-y-6">
          {/* Incident Description */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-lavender-600" /> Incident Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {caseData.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
              <div>
                <p className="text-slate-400 font-medium">Category</p>
                <p className="font-semibold text-slate-800 capitalize">
                  {caseData.category?.replace('_', ' ') || 'General'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Incident Date</p>
                <p className="font-semibold text-slate-800">
                  {caseData.incident_date ? new Date(caseData.incident_date).toLocaleDateString() : 'Not Specified'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Location</p>
                <p className="font-semibold text-slate-800">{caseData.location || 'Online / Campus'}</p>
              </div>
            </div>
          </Card>

          {/* Secure Evidence Files */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-mint-600" /> Encrypted Evidence Attachments
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {caseData.evidence?.length || 0} file(s)
              </span>
            </div>

            {caseData.evidence && caseData.evidence.length > 0 ? (
              <div className="space-y-2">
                {caseData.evidence.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-mint-100 text-mint-700 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{file.file_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(file.file_size / 1024).toFixed(1)} KB • {file.file_type}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadEvidence(file.id, file.file_name)}
                      className="gap-1.5 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No external evidence files were uploaded with this submission.
              </div>
            )}
          </Card>

          {/* Case Notes / Resolution Log */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-trust-600" /> Counselor & Committee Notes
            </h3>

            {caseData.case_notes && caseData.case_notes.length > 0 ? (
              <div className="space-y-3">
                {caseData.case_notes.map((note) => (
                  <div key={note.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {note.author_name || 'Authorized Responder'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{note.note_text || note.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No public notes have been published on this case yet.
              </div>
            )}

            {/* Note Input for Counselors/HR */}
            {isHandler && (
              <form onSubmit={handleAddNote} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Add Case Observation / Internal Note
                </label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record counseling actions taken, risk assessment, or hearing dates..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-lavender-500 focus:outline-none"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={addingNote}>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {addingNote ? 'Saving Note...' : 'Post Case Note'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Right Column: Case Metadata & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Confidentiality Metadata</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tracking Code</span>
                <span className="font-mono font-bold text-slate-800">{caseData.tracking_code}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Complainant Identity</span>
                <span className="font-semibold text-slate-800">
                  {caseData.is_anonymous ? 'Anonymous (Protected)' : caseData.complainant_name || 'Registered User'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Assigned Handler</span>
                <span className="font-semibold text-slate-800">
                  {caseData.assigned_counselor_name || 'POSH / School Committee'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Encryption Standard</span>
                <span className="font-mono text-mint-700 font-semibold">AES-256 GCM</span>
              </div>
            </div>
          </Card>

          {/* Life Cycle Stages */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Resolution Stages</h4>
            <div className="space-y-4">
              {[
                { title: 'Report Filed', desc: 'Case received & logged with tracking code', completed: true },
                {
                  title: 'Triaged & Under Review',
                  desc: 'Assigned to verified counselor or POSH IC',
                  completed: ['under_investigation', 'in_review', 'resolved'].includes(caseData.status),
                },
                {
                  title: 'Inquiry & Support Session',
                  desc: 'Confidential hearing or counseling initiated',
                  completed: ['in_review', 'resolved'].includes(caseData.status),
                },
                {
                  title: 'Case Resolution & Safe Closure',
                  desc: 'Action plan completed with statutory compliance',
                  completed: caseData.status === 'resolved',
                },
              ].map((stage, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      stage.completed
                        ? 'bg-mint-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {stage.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${stage.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
