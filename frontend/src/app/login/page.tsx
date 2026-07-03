"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Engineer');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate login call
    const success = await login(email, role, name || email.split('@')[0]);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Auth error. Check server logs.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card-bg/60 border border-border p-8 rounded-2xl shadow-2xl glass relative z-10 text-white"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-sky-500/20">
              DC
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">DataCentre AI</span>
          </Link>
          <h2 className="text-xl font-bold">Sign In to Platform</h2>
          <p className="text-sm text-slate-400 mt-1">Select demo role for hackathon audit review</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pm@datacentre.ai"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-sky-500 text-sm transition-colors text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Name (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="David Vance"
                className="w-full px-4 py-3 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-sky-500 text-sm transition-colors text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Workspace User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-sky-500 text-sm transition-colors text-white cursor-pointer"
            >
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Engineer">Engineer</option>
              <option value="Contractor">Contractor</option>
              <option value="Client">Client</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-950 border-border focus:ring-sky-500 focus:ring-offset-slate-900 text-sky-500" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sky-400 hover:text-sky-300 font-medium">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-bold rounded-xl text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 transition-all hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Authenticate Access'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link href="/signup" className="text-sky-400 hover:text-sky-300 font-semibold">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
