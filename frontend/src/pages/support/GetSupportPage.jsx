import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileCheck2,
  Bot,
  Calendar,
  PhoneCall,
  HeartHandshake,
  Lock,
  ArrowRight,
  ShieldCheck,
  LifeBuoy,
  MessageCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const GetSupportPage = () => {
  const [selectedPath, setSelectedPath] = useState(null);

  const supportOptions = [
    {
      id: 'emergency',
      title: 'Urgent Safety or Crisis',
      subtitle: 'Immediate danger, acute harassment, or physical harm',
      desc: 'Connect immediately with official national emergency helplines. No internet latency, available 24/7.',
      icon: PhoneCall,
      actionText: 'View Emergency Contacts',
      link: '/helpline',
      color: 'bg-warmrose-100 text-warmrose-800 border-warmrose-200',
      btnVariant: 'danger',
    },
    {
      id: 'report',
      title: 'File Confidential Report',
      subtitle: 'Cyberbullying, stalking, safe touch boundary violations, or POSH',
      desc: 'Submit incident details with 100% anonymity. Securely attach evidence and receive an encrypted tracking code.',
      icon: FileCheck2,
      actionText: 'File a Report Now',
      link: '/file-complaint',
      color: 'bg-lavender-100 text-lavender-800 border-lavender-200',
      btnVariant: 'primary',
    },
    {
      id: 'ai-chat',
      title: '24/7 AI Safety Companion',
      subtitle: 'Confidential conversational guidance & grounding',
      desc: 'Talk through confusing peer situations, cyber doubts, or emotional distress in a safe, non-judgmental space.',
      icon: Bot,
      actionText: 'Chat Anonymously',
      link: '/dashboard/teen/ai-chat',
      color: 'bg-mint-100 text-mint-800 border-mint-200',
      btnVariant: 'secondary',
    },
    {
      id: 'counselor',
      title: 'Counselor & Wellbeing Session',
      subtitle: '1-on-1 appointment with verified child/youth psychologists',
      desc: 'Book a private virtual session with certified counselors trained in youth trauma and student wellbeing.',
      icon: Calendar,
      actionText: 'Book Counseling',
      link: '/dashboard/support',
      color: 'bg-trust-100 text-trust-800 border-trust-200',
      btnVariant: 'outline',
    },
  ];

  return (
    <div className="space-y-12 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Care & Triage Navigation</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How Can TeenTalk Support You Today?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          You are not alone. Whether you need immediate emergency help, want to document an incident safely, or simply want to talk, choose the option that feels safest.
        </p>
      </div>

      {/* Reassurance Banner */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-lavender-50 border border-lavender-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-lavender-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-lavender-900 leading-relaxed">
          <strong>Your Dignity & Privacy Come First:</strong> All support paths are confidential. We never notify peers, family, or employers without your consent unless statutory minor emergency mandates apply.
        </div>
      </div>

      {/* Grid of 4 Support Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {supportOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Card
              key={opt.id}
              className="p-6 sm:p-8 flex flex-col justify-between border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${opt.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{opt.title}</h3>
                    <p className="text-xs text-slate-500">{opt.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Confidential</span>
                </div>
                <Link to={opt.link}>
                  <Button variant={opt.btnVariant} size="sm">
                    {opt.actionText} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Lookup of Existing Complaint */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 text-center space-y-3 bg-slate-50 border-slate-200">
          <h4 className="text-sm font-bold text-slate-900">Already have your confidential tracking code?</h4>
          <p className="text-xs text-slate-600">
            Check live case updates, view counselor responses, or securely attach additional evidence.
          </p>
          <div className="pt-2">
            <Link to="/track-complaint">
              <Button variant="outline" size="sm">
                Track Existing Incident Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
