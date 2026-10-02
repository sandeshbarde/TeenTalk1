import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Upload, CheckCircle2, ShieldAlert, ArrowRight, FileText } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Card } from '../../components/common/Card';
import { InputField } from '../../components/forms/InputField';
import { SelectField } from '../../components/forms/SelectField';
import { TextareaField } from '../../components/forms/TextareaField';
import { Button } from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { COMPLAINT_CATEGORIES } from '../../constants';

export const FileComplaintPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'posh_harassment',
    description: '',
    incident_date: new Date().toISOString().split('T')[0],
    is_anonymous: false,
    severity: 'medium',
    consent_confirmed: true,
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleEvidenceFile = (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Unsupported file type. Please upload PDF, PNG, JPG, or WEBP only.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File exceeds the 10MB size limit.', 'error');
      return;
    }

    setEvidenceFile(file);
    showToast(`Attached: ${file.name}`, 'info');
  };

  const handleFileChange = (e) => {
    handleEvidenceFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent_confirmed) {
      showToast('Please confirm your consent to submit this complaint', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. File complaint
      const res = await apiClient.post('/complaints/file', formData);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to file report');
      }

      const complaint = res.data;

      // Keep the case tracking code available even if the optional upload fails.
      setSubmittedCase(complaint);

      // 2. Upload evidence if attached
      if (evidenceFile) {
        const uploadData = new FormData();
        uploadData.append('complaint_id', complaint.id);
        uploadData.append('tracking_code', complaint.tracking_code);
        uploadData.append('evidence', evidenceFile);

        try {
          await apiClient.post('/complaints/upload-evidence', uploadData);
        } catch (uploadError) {
          showToast(`Complaint saved, but evidence upload failed: ${uploadError.message}`, 'error');
          return;
        }
      }

      showToast('Incident filed successfully. Please store your tracking code safely!', 'success');
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedCase) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
        <Card className="p-8 text-center border-teal-200">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Complaint Confirmed & Protected</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
            Your incident has been securely recorded and assigned an encrypted tracking token.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 max-w-md mx-auto text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Confidential Case Tracking Code
            </span>
            <span className="font-mono text-xl font-extrabold text-teal-700 block select-all">
              {submittedCase.tracking_code}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">
              Save this code safely. You can use it at any time to monitor investigation progress, hearing schedules,
              and redressal actions without logging in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate(`/track-complaint?code=${submittedCase.tracking_code}`)}
              icon={ArrowRight}
            >
              Track Status Now
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedCase(null);
                setFormData({
                  title: '',
                  category: 'posh_harassment',
                  description: '',
                  incident_date: new Date().toISOString().split('T')[0],
                  is_anonymous: false,
                  severity: 'medium',
                  consent_confirmed: true,
                });
                setEvidenceFile(null);
              }}
            >
              File Another Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          Confidential & Statutory Complaint Redressal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          File a Confidential Safety or POSH Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Report incidents of sexual harassment, bullying, cyber stalking, or boundary violations to authorized
          Internal Committees and Counselors.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Submit Anonymously</h4>
              <p className="text-xs text-slate-500">
                Your name and email will not be recorded or visible to committee members.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-teal-600" />
            </label>
          </div>

          <InputField
            label="Incident Subject / Title"
            placeholder="Brief summary of what occurred..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Incident Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={COMPLAINT_CATEGORIES}
              required
            />

            <InputField
              label="Date of Occurrence"
              type="date"
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
              required
            />
          </div>

          <TextareaField
            label="Detailed Statement of the Incident"
            rows={5}
            placeholder="Please provide specifics: where it took place, what was said or done, any witnesses present..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            helperText="Include relevant context, dates, and names if not filing anonymously."
          />

          {/* Secure Evidence Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Attach Supporting Evidence (Optional)
            </label>
            <div
              onDragEnter={(e) => { e.preventDefault(); setIsDraggingEvidence(true); }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingEvidence(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingEvidence(false);
                handleEvidenceFile(e.dataTransfer.files?.[0]);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${isDraggingEvidence ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-500 bg-slate-50/50'}`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {evidenceFile ? evidenceFile.name : 'Drag and drop a file here, or choose a file (Max 10MB)'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Screenshots of messages, emails, photos, or incident logs.
              </p>
              <input
                type="file"
                id="evidence-input"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />
              <label
                htmlFor="evidence-input"
                className="mt-3 inline-block cursor-pointer px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Statutory Consent Confirmation */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consent_confirmed}
                onChange={(e) => setFormData({ ...formData, consent_confirmed: e.target.checked })}
                className="mt-1 w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                required
              />
              <span className="text-xs text-teal-950 leading-relaxed">
                I affirm that the information provided is accurate and truthful to the best of my knowledge. I consent
                to this complaint being reviewed by authorized Internal Committee (IC) and counseling officers under
                statutory confidentiality protocols.
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={submitting}>
            Submit Confidential Complaint
          </Button>
        </form>
      </Card>
    </div>
  );
};
