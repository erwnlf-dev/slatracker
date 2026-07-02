// FILE: src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { User, Mail, Bell, Download, Upload, Trash2, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const { dispatch } = useStore();
  const [profile, setProfile] = useState({ name: '', email: '', notifications: true });
  const [confirmText, setConfirmText] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('slatracker_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        // ponytail: fallback to empty profile if parse fails
      }
    }
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('slatracker_profile', JSON.stringify(profile));
    dispatch({ type: 'TOAST', payload: { message: 'Profile updated successfully', type: 'success' } });
  };

  const handleExport = () => {
    const data = {
      policies: JSON.parse(localStorage.getItem('slatracker_policies') || '[]'),
      incidents: JSON.parse(localStorage.getItem('slatracker_incidents') || '[]'),
      activities: JSON.parse(localStorage.getItem('slatracker_activities') || '[]'),
      profile: JSON.parse(localStorage.getItem('slatracker_profile') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slatracker-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'TOAST', payload: { message: 'Data exported successfully', type: 'success' } });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.policies) localStorage.setItem('slatracker_policies', JSON.stringify(data.policies));
        if (data.incidents) localStorage.setItem('slatracker_incidents', JSON.stringify(data.incidents));
        if (data.activities) localStorage.setItem('slatracker_activities', JSON.stringify(data.activities));
        if (data.profile) localStorage.setItem('slatracker_profile', JSON.stringify(data.profile));
        
        dispatch({ type: 'TOAST', payload: { message: 'Data imported successfully', type: 'success' } });
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        setImportError('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirmText !== 'RESET') return;
    localStorage.clear();
    dispatch({ type: 'TOAST', payload: { message: 'App reset to seed data', type: 'success' } });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">Settings</h1>
        <p className="text-sm text-[#8a8f98]">Manage your profile, data import/export, and system state.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Form */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
          <h2 className="mb-4 text-lg font-medium text-[#f7f8f8]">Profile & Preferences</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#62666d]" />
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] pl-10 pr-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#62666d]" />
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] pl-10 pr-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-[rgba(255,255,255,0.05)] bg-[#191a1b] p-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#8a8f98]" />
                <div>
                  <p className="text-sm font-medium text-[#f7f8f8]">SLA Breach Alerts</p>
                  <p className="text-xs text-[#8a8f98]">Receive notifications on status changes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.notifications}
                onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
              />
            </div>

            <button type="submit" className="w-full rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]">
              Save Changes
            </button>
          </form>
        </div>

        {/* Data Management */}
        <div className="space-y-6">
          <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
            <h2 className="mb-2 text-lg font-medium text-[#f7f8f8]">Import / Export Data</h2>
            <p className="text-xs text-[#8a8f98] mb-4">Backup your configuration or restore from a previous export.</p>
            
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
              >
                <Download className="h-4 w-4" /> Export Configuration
              </button>

              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]">
                <Upload className="h-4 w-4" /> Import Configuration
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              {importError && <p className="text-xs text-[#ef4444]">{importError}</p>}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-[#ef4444]/20 bg-[#0f1011] p-5">
            <div className="flex items-center gap-2 text-[#ef4444] mb-2">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-medium">Danger Zone</h2>
            </div>
            <p className="text-xs text-[#8a8f98] mb-4">
              Resetting will clear all custom policies, incidents, and activities, reverting to default seed data.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET to confirm"
                className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#ef4444] focus:outline-none"
              />
              <button
                onClick={handleReset}
                disabled={confirmText !== 'RESET'}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" /> Reset Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
