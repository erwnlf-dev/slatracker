// FILE: src/app/dashboard/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, AlertTriangle, Settings, Activity } from 'lucide-react';
import { StoreProvider } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SLA Policies', href: '/dashboard/policies', icon: ShieldCheck },
    { name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-60 border-r border-[rgba(255,255,255,0.05)] bg-[#0f1011] flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
              <Activity className="h-5 w-5 text-[#5e6ad2]" />
              <span>SLATracker</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#191a1b] text-white border border-[rgba(255,255,255,0.08)]'
                      : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#191a1b]/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#5e6ad2]' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[rgba(255,255,255,0.05)] text-xs text-[#62666d] text-center">
            v1.0.0 • Production
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="pl-60">
          {/* Topbar */}
          <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0f1011] flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#8a8f98] font-semibold">Workspace</span>
              <span className="text-xs text-[rgba(255,255,255,0.15)]">/</span>
              <span className="text-xs text-[#d0d6e0]">Default Team</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs text-[#8a8f98]">All Systems Operational</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
