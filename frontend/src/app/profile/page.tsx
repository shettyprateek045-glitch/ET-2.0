"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Building2, MapPin, Calendar, Shield,
  Edit3, Camera, Save, X, Award, Clock, CheckCircle2,
  FolderKanban, FileText, Star, Activity, Briefcase, Key
} from 'lucide-react';

const ACTIVITY_HISTORY = [
  { date: 'Today, 14:32', action: 'Updated Dublin DC-1 specifications', type: 'document', icon: FileText },
  { date: 'Today, 11:15', action: 'Closed RFI #104 – Generator Belly Tank', type: 'rfi', icon: CheckCircle2 },
  { date: 'Yesterday', action: 'Generated Q2 Procurement Cost Report', type: 'report', icon: FolderKanban },
  { date: '2 days ago', action: 'Approved vendor submittal – Eaton Corp', type: 'approval', icon: Shield },
  { date: '3 days ago', action: 'Reviewed commissioning test results', type: 'commissioning', icon: Activity },
];

const CERTIFICATIONS = [
  { name: 'PMP – Project Management Professional', issuer: 'PMI', year: '2023', icon: Award, color: 'text-amber-400 bg-amber-500/10' },
  { name: 'LEED AP – Building Design + Construction', issuer: 'USGBC', year: '2022', icon: Star, color: 'text-emerald-400 bg-emerald-500/10' },
  { name: 'Certified Data Centre Design Pro', issuer: 'BICSI', year: '2024', icon: Shield, color: 'text-sky-400 bg-sky-500/10' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || 'Sarah Connor',
    email: user?.email || 'admin@datacentre.ai',
    role: user?.role || 'Admin',
    phone: '+1 (555) 012-3456',
    company: 'DataCentre AI Inc.',
    location: 'San Francisco, CA',
    bio: 'Senior EPC project manager specialising in hyperscale data centre commissioning, quality assurance, and AI-driven construction intelligence.',
    joined: 'January 2025',
  });

  const handleSave = () => {
    setIsEditing(false);
    // API call would go here
  };

  const ROLE_COLOR: Record<string, string> = {
    Admin: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    'Project Manager': 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    Engineer: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    Contractor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    Client: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border p-6"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-purple-500/20">
              {(profileData.fullName || 'U').charAt(0)}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                <p className="text-secondary text-sm mt-1">{profileData.email}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLOR[profileData.role] || 'bg-gray-500/10 text-gray-400'}`}>
                    {profileData.role}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-secondary">
                    <Calendar className="w-3.5 h-3.5" /> Joined {profileData.joined}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-secondary">
                    <MapPin className="w-3.5 h-3.5" /> {profileData.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isEditing
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'border border-border hover:bg-white/5'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mt-5 pt-5 border-t border-border">
              {[
                { label: 'Projects', value: '4' },
                { label: 'Documents', value: '47' },
                { label: 'RFIs Resolved', value: '23' },
                { label: 'Approvals', value: '12' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-secondary">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form / Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-2xl border border-border p-6"
        >
          <h3 className="text-lg font-bold mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Full Name', key: 'fullName', icon: User, type: 'text' },
              { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
              { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel' },
              { label: 'Company', key: 'company', icon: Building2, type: 'text' },
              { label: 'Location', key: 'location', icon: MapPin, type: 'text' },
              { label: 'Role', key: 'role', icon: Briefcase, type: 'text', disabled: true },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">{field.label}</label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input
                    type={field.type}
                    value={profileData[field.key as keyof typeof profileData]}
                    onChange={e => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={!isEditing || field.disabled}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm transition-all ${
                      isEditing && !field.disabled
                        ? 'bg-background border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
                        : 'bg-black/10 border-border text-secondary cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all ${
                  isEditing
                    ? 'bg-background border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40'
                    : 'bg-black/10 border-border text-secondary cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" /> Save Profile
              </button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </motion.div>

        {/* Side Cards */}
        <div className="space-y-6">
          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl border border-border p-6"
          >
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Certifications
            </h3>
            <div className="space-y-3">
              {CERTIFICATIONS.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/10 border border-border/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                    <c.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-snug">{c.name}</p>
                    <p className="text-xs text-secondary mt-0.5">{c.issuer} · {c.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-border p-6"
          >
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> Security
            </h3>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <input type="password" placeholder="New password" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                Update Password
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Activity History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl border border-border p-6"
      >
        <h3 className="text-lg font-bold mb-5">Recent Activity</h3>
        <div className="space-y-4">
          {ACTIVITY_HISTORY.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-secondary mt-0.5">{item.date}</p>
              </div>
              <span className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full text-secondary capitalize">{item.type}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
