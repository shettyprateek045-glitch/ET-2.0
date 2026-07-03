"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Palette, Globe, Database,
  Monitor, Moon, Sun, Check, Save, RefreshCw, Trash2,
  Download, Upload, Eye, EyeOff, Volume2, VolumeX,
  Mail, MessageSquare, Smartphone, Webhook, Key, Lock
} from 'lucide-react';

type SettingTab = 'appearance' | 'notifications' | 'privacy' | 'integrations' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('appearance');
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState('sky');
  const [fontSize, setFontSize] = useState('medium');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [soundNotifs, setSoundNotifs] = useState(false);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profilePublic, setProfilePublic] = useState(false);
  const [saved, setSaved] = useState(false);

  const TABS: { id: SettingTab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  const ACCENT_COLORS = [
    { name: 'sky', class: 'bg-sky-500', label: 'Sky Blue' },
    { name: 'indigo', class: 'bg-indigo-500', label: 'Indigo' },
    { name: 'teal', class: 'bg-teal-500', label: 'Teal' },
    { name: 'emerald', class: 'bg-emerald-500', label: 'Emerald' },
    { name: 'purple', class: 'bg-purple-500', label: 'Purple' },
    { name: 'rose', class: 'bg-rose-500', label: 'Rose' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-primary' : 'bg-border'}`}
      aria-pressed={enabled}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-secondary mt-1">Manage your platform preferences, notifications, and account security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <nav className="lg:w-56 shrink-0">
          <div className="glass rounded-2xl border border-border p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-secondary hover:text-foreground hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-5">Theme & Display</h3>

                {/* Dark / Light toggle */}
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-3 block">Color Mode</label>
                  <div className="flex gap-3">
                    {[
                      { label: 'Dark', icon: Moon, value: true },
                      { label: 'Light', icon: Sun, value: false },
                    ].map(mode => (
                      <button
                        key={mode.label}
                        onClick={() => setDarkMode(mode.value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          darkMode === mode.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-white/5 text-secondary'
                        }`}
                      >
                        <mode.icon className="w-4 h-4" /> {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-3 block">Accent Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setAccentColor(c.name)}
                        title={c.label}
                        className={`w-8 h-8 rounded-full ${c.class} flex items-center justify-center transition-all hover:scale-110 ${accentColor === c.name ? 'ring-2 ring-offset-2 ring-offset-background ring-white' : ''}`}
                      >
                        {accentColor === c.name && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Interface Density</label>
                  <div className="flex gap-3">
                    {['compact', 'medium', 'comfortable'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                          fontSize === size
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-white/5 text-secondary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-base mb-5 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> Sidebar & Layout
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Collapse sidebar by default', desc: 'Start with a compact sidebar on load' },
                    { label: 'Show project breadcrumbs', desc: 'Display project context in header' },
                    { label: 'Enable smooth scroll animations', desc: 'Framer Motion page transitions' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-secondary mt-0.5">{item.desc}</p>
                      </div>
                      <ToggleSwitch enabled={idx !== 0} onToggle={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-5">Notification Channels</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Email Notifications', desc: 'Receive updates and alerts via email', icon: Mail, enabled: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                    { label: 'Push Notifications', desc: 'Browser push alerts for real-time events', icon: Bell, enabled: pushNotifs, toggle: () => setPushNotifs(!pushNotifs) },
                    { label: 'Sound Alerts', desc: 'Play audio when high-priority alerts arrive', icon: soundNotifs ? Volume2 : VolumeX, enabled: soundNotifs, toggle: () => setSoundNotifs(!soundNotifs) },
                    { label: 'SMS Notifications', desc: 'Text messages for critical milestones', icon: Smartphone, enabled: smsNotifs, toggle: () => setSmsNotifs(!smsNotifs) },
                  ].map((n, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <n.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{n.label}</p>
                          <p className="text-xs text-secondary mt-0.5">{n.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={n.enabled} onToggle={n.toggle} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-base mb-5">Alert Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'New RFI Filed', 'Quality Issue Raised', 'Schedule Risk Detected',
                    'Supplier Alert', 'Document Approved', 'Commissioning Checkpoint',
                    'AI Report Generated', 'Budget Threshold Exceeded'
                  ].map((alert, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-black/10 border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm font-medium">{alert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Account Security
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Two-Factor Authentication', desc: 'Extra security layer via authenticator app', enabled: twoFactor, toggle: () => setTwoFactor(!twoFactor) },
                    { label: 'Session Timeout (30 min)', desc: 'Auto logout after 30 minutes of inactivity', enabled: true, toggle: () => {} },
                    { label: 'Login Notifications', desc: 'Email alert on new device sign-in', enabled: true, toggle: () => {} },
                    { label: 'Profile Visibility', desc: 'Make your profile visible to other team members', enabled: profilePublic, toggle: () => setProfilePublic(!profilePublic) },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{s.label}</p>
                        <p className="text-xs text-secondary mt-0.5">{s.desc}</p>
                      </div>
                      <ToggleSwitch enabled={s.enabled} onToggle={s.toggle} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-base mb-5">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows 11', location: 'San Francisco, CA', time: 'Current session', current: true },
                    { device: 'Safari on iPhone 15', location: 'San Francisco, CA', time: '2 hours ago', current: false },
                    { device: 'Chrome on MacBook Pro', location: 'New York, NY', time: '1 day ago', current: false },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-border/50">
                      <div>
                        <p className="font-semibold text-sm">{session.device}</p>
                        <p className="text-xs text-secondary">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Active</span>
                      ) : (
                        <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-5">Connected Services</h3>
                <div className="space-y-4">
                  {[
                    { name: 'OpenAI / GPT-4o', desc: 'AI document intelligence and RAG queries', status: 'Connected', color: 'text-emerald-400 bg-emerald-500/10' },
                    { name: 'FAISS Vector Store', desc: 'Semantic similarity search and embeddings', status: 'Connected', color: 'text-emerald-400 bg-emerald-500/10' },
                    { name: 'PostgreSQL Database', desc: 'Structured project and procurement data', status: 'Connected', color: 'text-emerald-400 bg-emerald-500/10' },
                    { name: 'Firebase Authentication', desc: 'Role-based auth and SSO', status: 'Not Connected', color: 'text-amber-400 bg-amber-500/10' },
                    { name: 'AWS S3 Storage', desc: 'Document and drawing file storage', status: 'Not Connected', color: 'text-amber-400 bg-amber-500/10' },
                    { name: 'Procore API', desc: 'Import project data from Procore', status: 'Not Connected', color: 'text-amber-400 bg-amber-500/10' },
                  ].map((integration, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center">
                          <Webhook className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{integration.name}</p>
                          <p className="text-xs text-secondary">{integration.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${integration.color}`}>{integration.status}</span>
                        <button className="text-xs font-medium text-primary hover:underline transition-colors">
                          {integration.status === 'Connected' ? 'Manage' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" /> API Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">OpenAI API Key</label>
                    <div className="flex gap-2">
                      <input type="password" placeholder="sk-****" className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      <button className="px-3 py-2.5 border border-border rounded-xl hover:bg-white/5 transition-colors"><Eye className="w-4 h-4 text-secondary" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Webhook Endpoint URL</label>
                    <input type="url" placeholder="https://your-app.com/webhook" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Data & Storage */}
          {activeTab === 'data' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-lg mb-5">Storage Usage</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Documents & Drawings', used: 14.2, total: 50, color: 'bg-sky-500' },
                    { label: 'AI Chat History', used: 2.8, total: 10, color: 'bg-purple-500' },
                    { label: 'Report Archives', used: 4.1, total: 20, color: 'bg-teal-500' },
                  ].map((s, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{s.label}</span>
                        <span className="text-secondary text-xs">{s.used} GB / {s.total} GB</span>
                      </div>
                      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.used / s.total) * 100}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${s.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="font-bold text-base mb-5">Data Management</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Export All Project Data', desc: 'Download a JSON/CSV archive of all your data', icon: Download, action: 'Export', color: 'text-primary hover:bg-primary/10' },
                    { label: 'Import Data', desc: 'Bulk import from Procore, Autodesk, or CSV', icon: Upload, action: 'Import', color: 'text-primary hover:bg-primary/10' },
                    { label: 'Backup to Cloud', desc: 'Trigger an immediate backup to AWS S3', icon: RefreshCw, action: 'Backup', color: 'text-emerald-400 hover:bg-emerald-500/10' },
                    { label: 'Delete Account Data', desc: 'Permanently remove all your data from the platform', icon: Trash2, action: 'Delete', color: 'text-rose-400 hover:bg-rose-500/10' },
                  ].map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-border/50">
                      <div className="flex items-center gap-4">
                        <action.icon className={`w-5 h-5 ${action.label.includes('Delete') ? 'text-rose-400' : 'text-secondary'}`} />
                        <div>
                          <p className="font-semibold text-sm">{action.label}</p>
                          <p className="text-xs text-secondary">{action.desc}</p>
                        </div>
                      </div>
                      <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${action.color} border border-current/20`}>
                        {action.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-105"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-emerald-400 font-medium"
              >
                ✓ Settings saved successfully
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
