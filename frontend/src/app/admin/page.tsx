"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Shield, Activity, AlertTriangle, CheckCircle2,
  Settings, Database, Server, Globe, Lock, Eye, Edit3,
  Trash2, UserPlus, BarChart3, TrendingUp, Clock, RefreshCw,
  ChevronDown, Search, Filter, MoreVertical, Key, Mail
} from 'lucide-react';

const DEMO_USERS = [
  { id: 1, name: 'Sarah Connor', email: 'admin@datacentre.ai', role: 'Admin', status: 'Active', lastLogin: '2 mins ago', projects: 4, avatar: 'SC' },
  { id: 2, name: 'David Vance', email: 'pm@datacentre.ai', role: 'Project Manager', status: 'Active', lastLogin: '1 hr ago', projects: 3, avatar: 'DV' },
  { id: 3, name: 'Alex Mercer', email: 'engineer@datacentre.ai', role: 'Engineer', status: 'Active', lastLogin: '3 hrs ago', projects: 2, avatar: 'AM' },
  { id: 4, name: 'Marcus Aurelius', email: 'contractor@datacentre.ai', role: 'Contractor', status: 'Inactive', lastLogin: '2 days ago', projects: 1, avatar: 'MA' },
  { id: 5, name: 'Bill Gates', email: 'client@datacentre.ai', role: 'Client', status: 'Active', lastLogin: '5 hrs ago', projects: 4, avatar: 'BG' },
];

const AUDIT_LOGS = [
  { time: '14:32:11', user: 'Sarah Connor', action: 'Updated project status', resource: 'Dublin Hyperscale DC-1', level: 'info' },
  { time: '13:45:02', user: 'Alex Mercer', action: 'Uploaded specification document', resource: 'RFI-105_Response.pdf', level: 'info' },
  { time: '12:11:44', user: 'Marcus Aurelius', action: 'Login attempt failed', resource: 'Authentication', level: 'warning' },
  { time: '11:55:30', user: 'David Vance', action: 'Generated cost report', resource: 'Report #R-2026-044', level: 'info' },
  { time: '10:08:17', user: 'System', action: 'Database backup completed', resource: 'PostgreSQL', level: 'success' },
  { time: '09:22:05', user: 'Bill Gates', action: 'Accessed sensitive procurement data', resource: 'PO-2026-001', level: 'warning' },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  'Project Manager': 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  Engineer: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  Contractor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Client: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
};

const LEVEL_STYLES: Record<string, string> = {
  info: 'bg-sky-500/10 text-sky-400',
  warning: 'bg-amber-500/10 text-amber-400',
  success: 'bg-emerald-500/10 text-emerald-400',
  error: 'bg-red-500/10 text-red-400',
};

const SYSTEM_HEALTH = [
  { label: 'API Gateway', status: 'Operational', uptime: '99.98%', icon: Globe, color: 'text-emerald-400' },
  { label: 'PostgreSQL DB', status: 'Operational', uptime: '99.95%', icon: Database, color: 'text-emerald-400' },
  { label: 'FastAPI Backend', status: 'Operational', uptime: '99.91%', icon: Server, color: 'text-emerald-400' },
  { label: 'Vector DB (FAISS)', status: 'Degraded', uptime: '97.2%', icon: Activity, color: 'text-amber-400' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'audit' | 'security'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredUsers = DEMO_USERS.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Control Panel</h2>
          <p className="text-sm text-secondary mt-1">Manage users, roles, system health, and security settings</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-105"
        >
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '5', icon: Users, color: 'text-sky-400 bg-sky-500/10', change: '+2 this month' },
          { label: 'Active Sessions', value: '3', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10', change: 'Right now' },
          { label: 'Security Alerts', value: '2', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10', change: 'Needs review' },
          { label: 'System Uptime', value: '99.9%', icon: Server, color: 'text-purple-400 bg-purple-500/10', change: 'Last 30 days' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="glass rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-secondary font-medium uppercase tracking-wider">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-secondary">{card.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/20 rounded-xl p-1 w-fit">
        {(['users', 'system', 'audit', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            {tab === 'audit' ? 'Audit Log' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Search users by name, email or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Users Table */}
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-black/10">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Last Login</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Projects</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-secondary">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || 'bg-gray-500/10 text-gray-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-emerald-400' : 'text-secondary'}`}>{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary text-xs">{user.lastLogin}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground bg-white/5 border border-border rounded-lg px-2 py-1">
                          <BarChart3 className="w-3 h-3 text-primary" /> {user.projects}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-secondary transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-sky-500/10 hover:text-sky-400 text-secondary transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-secondary transition-colors" title="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">System Health Monitor</h3>
              <button className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {SYSTEM_HEALTH.map((s, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-black/10 border border-border/50">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs text-secondary">Uptime: {s.uptime}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    s.status === 'Operational' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Usage */}
          <div className="glass rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold mb-6">Resource Utilisation</h3>
            <div className="space-y-5">
              {[
                { label: 'CPU Usage', value: 34, color: 'bg-sky-500' },
                { label: 'Memory', value: 61, color: 'bg-purple-500' },
                { label: 'Storage', value: 48, color: 'bg-teal-500' },
                { label: 'API Rate Limit', value: 22, color: 'bg-amber-500' },
              ].map((r, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{r.label}</span>
                    <span className="font-bold text-foreground">{r.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.value}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${r.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-primary">Performance Insight</p>
                  <p className="text-xs text-secondary mt-0.5">All systems nominal. Vector DB experiencing slight latency — auto-scaling in progress.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Audit Trail</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <span className="text-xs text-secondary">Today, {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {AUDIT_LOGS.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <span className="text-xs text-secondary font-mono mt-0.5 whitespace-nowrap">{log.time}</span>
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    log.level === 'warning' ? 'bg-amber-400' : log.level === 'success' ? 'bg-emerald-400' : log.level === 'error' ? 'bg-red-400' : 'bg-sky-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-secondary">{log.user}</span>
                      <span className="text-xs text-secondary">→</span>
                      <span className="text-xs text-primary font-medium">{log.resource}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_STYLES[log.level] || ''}`}>{log.level}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Security Settings
            </h3>
            {[
              { label: 'Two-Factor Authentication', desc: 'Enforce 2FA for all users', enabled: true },
              { label: 'SSO / SAML Integration', desc: 'Single sign-on via enterprise IdP', enabled: false },
              { label: 'IP Allowlisting', desc: 'Restrict access by IP range', enabled: false },
              { label: 'Audit Log Retention (90 days)', desc: 'Auto-purge logs after 90 days', enabled: true },
              { label: 'API Rate Limiting', desc: '500 req/min per token', enabled: true },
            ].map((setting, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-border/50">
                <div>
                  <p className="font-semibold text-sm">{setting.label}</p>
                  <p className="text-xs text-secondary mt-0.5">{setting.desc}</p>
                </div>
                <button
                  className={`relative w-11 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-primary' : 'bg-border'}`}
                  aria-label={`Toggle ${setting.label}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${setting.enabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl border border-border p-6">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-primary" /> Active API Keys
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Production Key', key: 'sk-prod-****-****-3f7a', created: 'Jan 15, 2026', lastUsed: '2 mins ago', scope: 'Full Access' },
                { name: 'Read-Only Key', key: 'sk-read-****-****-9b2c', created: 'Mar 01, 2026', lastUsed: '1 day ago', scope: 'Read Only' },
              ].map((k, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/10 border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm">{k.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${k.scope === 'Full Access' ? 'bg-rose-500/10 text-rose-400' : 'bg-sky-500/10 text-sky-400'}`}>{k.scope}</span>
                  </div>
                  <p className="font-mono text-xs text-secondary mb-3">{k.key}</p>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Created: {k.created}</span>
                    <span>Last used: {k.lastUsed}</span>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border/50 rounded-xl text-sm text-secondary hover:border-primary/50 hover:text-primary transition-colors">
                <Key className="w-4 h-4" /> Generate New Key
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass w-full max-w-md rounded-2xl border border-border p-6 mx-4"
          >
            <h3 className="text-xl font-bold mb-2">Invite Team Member</h3>
            <p className="text-sm text-secondary mb-6">Send an invitation link to join the platform</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input type="email" placeholder="user@company.com" className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Role</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer">
                  <option>Engineer</option>
                  <option>Project Manager</option>
                  <option>Contractor</option>
                  <option>Client</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
