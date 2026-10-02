import React from 'react';
import { Shield, Lock, EyeOff, FileText, CheckCircle, Scale, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="primary">Data Privacy & Child Safety Charter</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          TeenTalk Privacy Policy
        </h1>
        <p className="text-sm text-slate-600">
          Last Updated: September 2026 • Compliant with DPDP Act (2023) & POCSO Act (2012)
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-lavender-50 border border-lavender-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-lavender-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-lavender-900 leading-relaxed">
          <strong>Summary in Plain English:</strong> TeenTalk is built to protect you. We do not sell data, we do not run advertisements, and we support 100% anonymous complaint reporting. You are never forced to use your real name or personal photo.
        </div>
      </div>

      <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-lavender-600" /> 1. Our Core Privacy Principles
          </h2>
          <p>
            At TeenTalk, privacy is not an afterthought—it is our core architectural foundation. We operate on principles of data minimization, role-isolated permissions, and zero-commercialization. We collect only what is strictly necessary to deliver safety learning and support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-warmrose-600" /> 2. Confidential & Anonymous Reporting
          </h2>
          <p>
            When filing a safety incident or complaint on TeenTalk:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li><strong>No Name Required:</strong> You can submit reports completely anonymously.</li>
            <li><strong>Private Tracking Token:</strong> You receive a cryptographically random token to check case updates and upload follow-up evidence.</li>
            <li><strong>Metadata Stripping:</strong> Uploaded evidence files (PNG, JPG, PDF) are cleansed of EXIF camera/GPS location metadata before being stored in private, access-restricted storage.</li>
            <li><strong>Private Streaming:</strong> Evidence files are NEVER accessible via public internet URLs. They require validated role tokens to inspect.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-trust-600" /> 3. Information We Collect
          </h2>
          <p>Depending on your chosen usage tier, we may collect:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Card className="p-4 border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Student / Learner Accounts</h4>
              <p className="text-xs text-slate-600">
                Display name (can be a pseudonym), age group cohort, chosen avatar, module completion progress, quiz scores, and optional daily mood logs.
              </p>
            </Card>
            <Card className="p-4 border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Institutional & Staff Accounts</h4>
              <p className="text-xs text-slate-600">
                Official institution email, verified designation (School Counselor, HR POSH Member, Administrator), and audit log of administrative actions.
              </p>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-mint-600" /> 4. Institutional Access Boundaries
          </h2>
          <p>
            School Principals and Teachers have access to aggregate cohort metrics (e.g. <em>"85% of Grade 9 has completed the Cyber Hygiene module"</em>). They DO NOT have access to individual confidential counseling notes, student mood logs, or anonymous complaint identities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" /> 5. Emergency Interventions & Life Safety
          </h2>
          <p>
            In rare cases where an intake message or AI interaction indicates imminent threat to human life or acute sexual abuse of a minor, statutory laws (including Section 19 of the POCSO Act) require mandatory escalation to official child protection authorities (Childline 1098 or local police).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" /> 6. Your Rights & Data Deletion
          </h2>
          <p>
            In compliance with the Digital Personal Data Protection Act (DPDP), you hold the right to access your learning transcript, correct your preferences, or request full account deletion at any time by contacting our designated Data Protection Officer at <code>privacy@teentalk.org</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
