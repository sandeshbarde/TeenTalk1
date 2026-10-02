import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  Lock,
  FileCheck2,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const HowItWorksPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const pillars = [
    {
      step: '01',
      title: 'Personalized Age-Adaptive Learning',
      desc: 'Whether you are 10, 16, 22, or 45, TeenTalk adapts lesson language, tone, and practical real-world scenarios to your life stage.',
      points: [
        'Bite-sized visual modules on cyber hygiene & boundaries',
        'Interactive branching decision scenarios with real consequences',
        'Knowledge checks with verifiable digital completion certificates',
      ],
      icon: BookOpen,
      color: 'bg-lavender-100 text-lavender-800 border-lavender-200',
    },
    {
      step: '02',
      title: 'Confidential & Anonymous Reporting',
      desc: 'Encountered cyber harassment, bullying, or workplace misconduct? Report safely with total privacy control.',
      points: [
        '100% anonymous complaint submission option',
        'Zero-knowledge evidence upload with AES-256 storage',
        'Private tracking token without needing phone or email',
      ],
      icon: Lock,
      color: 'bg-warmrose-100 text-warmrose-800 border-warmrose-200',
    },
    {
      step: '03',
      title: 'Verified Support & Escalation Network',
      desc: 'Every report and query is triaged by verified professionals according to statutory POCSO & POSH guidelines.',
      points: [
        'Direct connection to school counselors and internal committees',
        'Non-judgmental AI safety companion for 24/7 crisis guidance',
        'One-touch national emergency helplines (1098 Childline, 112 Emergency)',
      ],
      icon: HeartHandshake,
      color: 'bg-mint-100 text-mint-800 border-mint-200',
    },
  ];

  const faqs = [
    {
      q: 'Is TeenTalk really confidential for students and employees?',
      a: 'Yes. TeenTalk allows you to file complaints completely anonymously. You receive a private tracking token that you can use to check updates and upload supplementary evidence without revealing your personal identity.',
    },
    {
      q: 'How does the age personalization work without separate apps?',
      a: 'TeenTalk is one unified platform. When you register or select your age group (10–13, 14–17, 18–25, 26–40, 41–50), the system dynamically filters modules, adapts illustrative scenarios, adjusts terminology, and recommends age-relevant resources while maintaining strict role-based access control.',
    },
    {
      q: 'What happens when someone mentions self-harm or immediate crisis?',
      a: 'Our built-in safety guardrails instantly detect high-risk crisis keywords in AI chat and complaint intakes. The interface immediately surfaces direct one-click dialers for emergency helplines (Childline 1098, National Emergency 112, Women Helpline 1091) and notifies authorized emergency counselors.',
    },
    {
      q: 'Can schools and organizations track student completion without violating privacy?',
      a: 'Yes. School administrators and HR leaders access aggregated analytics (module completion rates, average quiz scores, risk trends). Student full names can be anonymized with avatars, ensuring administrators track institutional safety compliance without intrusive personal surveillance.',
    },
    {
      q: 'Are completion certificates verified?',
      a: 'Every safety certificate generated on TeenTalk features a unique SHA-256 cryptographic verification hash and issuer signature that can be audited by educational boards and employers.',
    },
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Platform Architecture & Care Flow</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How TeenTalk Protects, Educates, and Empowers
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Designed by educators, mental health professionals, and cybersecurity experts to build safe digital communities for girls and women.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.step} className="p-6 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pillar.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300">{pillar.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                <ul className="space-y-2 pt-2 border-t border-slate-100">
                  {pillar.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Workflow Diagram Preview */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="mint">End-to-End Resolution Pipeline</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">The Safe Resolution Journey</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            From the moment an issue occurs to institutional closure, your dignity and rights are guarded at every milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs font-mono font-bold text-lavender-300">STAGE 1</span>
            <h4 className="text-base font-bold mt-1 text-white">Safe Detection</h4>
            <p className="text-xs text-slate-300 mt-2">
              Learner engages with interactive modules or identifies a distressing situation online or on campus.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs font-mono font-bold text-warmrose-300">STAGE 2</span>
            <h4 className="text-base font-bold mt-1 text-white">Confidential Filing</h4>
            <p className="text-xs text-slate-300 mt-2">
              Submit details anonymously or authenticated. Attach encrypted screenshots/PDFs. Receive private code.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs font-mono font-bold text-mint-300">STAGE 3</span>
            <h4 className="text-base font-bold mt-1 text-white">Triage & Investigation</h4>
            <p className="text-xs text-slate-300 mt-2">
              Assigned School Counselor or POSH Internal Committee reviews evidence under strict role-based isolation.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs font-mono font-bold text-trust-300">STAGE 4</span>
            <h4 className="text-base font-bold mt-1 text-white">Resolution & Care</h4>
            <p className="text-xs text-slate-300 mt-2">
              Counselor schedules 1-on-1 session, issues guidance notes, and provides ongoing psychological first aid.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600">Everything you need to know about safety, privacy, and our principles.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-semibold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-lavender-50 via-warmrose-50 to-mint-50 rounded-3xl p-8 text-center border border-slate-200 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Ready to begin your safety journey?</h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Explore our interactive modules or speak to our 24/7 AI safety companion without any cost.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/modules">
            <Button variant="primary" size="lg">
              Explore Learning Modules <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link to="/helpline">
            <Button variant="danger" size="lg">
              <PhoneCall className="w-4 h-4 mr-1.5" /> 24/7 Helplines
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
