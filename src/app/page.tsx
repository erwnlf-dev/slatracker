// FILE: src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Activity, 
  Zap, 
  Layers, 
  Download, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight 
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: "SLA Policy Builder",
      desc: "Define target uptime, response, and resolution times per service tier."
    },
    {
      icon: Activity,
      title: "Incident Lifecycle",
      desc: "Track status transitions from open to closed with automatic timestamps."
    },
    {
      icon: Zap,
      title: "Real-time Compliance",
      desc: "Instant adherence metrics and health indicators without delay."
    },
    {
      icon: Layers,
      title: "Bulk Management",
      desc: "Select, update, and delete multiple incidents or policies at once."
    },
    {
      icon: Download,
      title: "Data Portability",
      desc: "Full JSON export and import with merge strategies. No vendor lock-in."
    },
    {
      icon: Sliders,
      title: "Zero Bloat",
      desc: "Pure SLA focus. No host-based pricing, agents, or complex setups."
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$0",
      desc: "For side projects and small tools.",
      features: ["3 SLA Policies", "50 Incidents / month", "Local storage persistence", "JSON Export"]
    },
    {
      name: "Pro",
      price: "$19",
      desc: "For growing teams needing full tracking.",
      features: ["Unlimited Policies", "Unlimited Incidents", "Priority support", "JSON Import & Merge", "Advanced Analytics"]
    },
    {
      name: "Team",
      price: "$49",
      desc: "For organizations managing multiple SLAs.",
      features: ["Everything in Pro", "Team workspaces", "SLA breach alerts", "Dedicated support", "Custom retention"]
    }
  ];

  const faqs = [
    {
      q: "What is SLATracker?",
      a: "SLATracker is a lightweight dashboard designed to track contractual uptime and response/resolution targets without the cost and complexity of enterprise monitoring systems."
    },
    {
      q: "Where is my data stored?",
      a: "By default, all data is stored locally in your browser's localStorage. You have complete control over your data and can export or reset it at any time."
    },
    {
      q: "How is compliance calculated?",
      a: "Compliance is calculated in real-time based on your active policies and the resolution times of logged incidents against those policy targets."
    },
    {
      q: "Can I import data from other tools?",
      a: "Yes, SLATracker supports importing data via a standard JSON format, allowing you to merge or overwrite your existing local dataset."
    },
    {
      q: "Is there a self-hosted option?",
      a: "Currently, SLATracker runs entirely in the client browser. You can export the static build and host it on your own infrastructure easily."
    },
    {
      q: "How do notifications work?",
      a: "You can toggle browser-based notifications in your preferences to get alerts when incidents change status or breach SLA thresholds."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.05)] bg-[#0f1011]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#5e6ad2] flex items-center justify-center font-bold text-xs text-white">S</div>
            <span className="font-semibold text-sm tracking-tight text-[#f7f8f8]">SLATracker</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">Features</Link>
            <Link href="#pricing" className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">Pricing</Link>
            <Link href="#faq" className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">FAQ</Link>
            <Link href="/dashboard" className="rounded-md bg-[#5e6ad2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#828fff] transition-colors">
              Go to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#0f1011] text-xs text-[#8a8f98] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            Pure SLA tracking. No agent bloat.
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#f7f8f8] mb-6 leading-[1.1]">
            SLA compliance tracking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5e6ad2] to-[#828fff]">made simple.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#d0d6e0] max-w-xl mx-auto mb-10">
            Define policies, track incident lifecycles, and monitor real-time compliance metrics. Built for teams who need clarity, not complexity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto rounded-md bg-[#5e6ad2] px-6 py-3 text-sm font-medium text-white hover:bg-[#828fff] transition-colors flex items-center justify-center gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto rounded-md border border-[rgba(255,255,255,0.08)] px-6 py-3 text-sm text-[#d0d6e0] hover:bg-white/5 transition-colors flex items-center justify-center">
              Learn More
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(94,106,210,0.08),transparent_50%)] pointer-events-none"></div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-[rgba(255,255,255,0.05)] bg-[#0f1011]/40 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#8a8f98] mb-6">Trusted by 200+ engineering teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-40 grayscale">
            <span className="font-bold text-lg tracking-wider text-[#f7f8f8]">AETHER</span>
            <span className="font-bold text-lg tracking-wider text-[#f7f8f8]">VORTEX</span>
            <span className="font-bold text-lg tracking-wider text-[#f7f8f8]">APEX</span>
            <span className="font-bold text-lg tracking-wider text-[#f7f8f8]">NOVA</span>
            <span className="font-bold text-lg tracking-wider text-[#f7f8f8]">SPECTRA</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#f7f8f8] mb-4">Everything you need, nothing you don't</h2>
          <p className="text-sm text-[#8a8f98]">Designed to monitor service level agreements without the overhead of full-scale APM suites.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6 hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#191a1b] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#5e6ad2] mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#f7f8f8] mb-2">{f.title}</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#0f1011]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#f7f8f8] mb-4">Simple, transparent pricing</h2>
            <p className="text-sm text-[#8a8f98]">Start tracking for free, upgrade as your team and SLA commitments grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={`rounded-lg border p-6 flex flex-col justify-between ${i === 1 ? 'border-[#5e6ad2] bg-[#0f1011] relative' : 'border-[rgba(255,255,255,0.05)] bg-[#0f1011]/60'}`}>
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5e6ad2] px-3 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-[#f7f8f8] mb-1">{p.name}</h3>
                  <p className="text-xs text-[#8a8f98] mb-6">{p.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-[#f7f8f8]">{p.price}</span>
                    <span className="text-xs text-[#8a8f98]">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#d0d6e0]">
                        <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/dashboard" className={`w-full rounded-md py-2 text-xs font-medium text-center transition-colors ${i === 1 ? 'bg-[#5e6ad2] text-white hover:bg-[#828fff]' : 'border border-[rgba(255,255,255,0.08)] text-[#d0d6e0] hover:bg-white/5'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#f7f8f8] mb-4">Frequently Asked Questions</h2>
            <p className="text-sm text-[#8a8f98]">Got questions? We have answers.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors"
                >
                  <span className="text-xs font-medium text-[#f7f8f8]">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#8a8f98]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8a8f98]" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-[rgba(255,255,255,0.05)] pt-3">
                    <p className="text-xs text-[#8a8f98] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-transparent to-[#0f1011]/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#f7f8f8] mb-4">Ready to track your SLAs?</h2>
          <p className="text-xs text-[#8a8f98] max-w-md mx-auto mb-8">Get started instantly. No credit card required, no account setup needed to try.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-[#5e6ad2] px-6 py-3 text-sm font-medium text-white hover:bg-[#828fff] transition-colors">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[#08090a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#5e6ad2] flex items-center justify-center font-bold text-[10px] text-white">S</div>
            <span className="text-xs font-semibold tracking-tight text-[#f7f8f8]">SLATracker</span>
          </div>
          <p className="text-[11px] text-[#8a8f98] order-last sm:order-none">
            &copy; {new Date().getFullYear()} SLATracker. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-[11px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">Privacy</Link>
            <Link href="#" className="text-[11px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">Terms</Link>
            <Link href="#" className="text-[11px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
