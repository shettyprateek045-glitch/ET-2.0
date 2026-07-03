"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Mail, Lock, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError('All fields are required');
      return;
    }
    setError('');
    setIsLoading(true);

    const success = await signup(email, role, name);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Signup failed. Check server configurations.');
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
          <h2 className="text-xl font-bold">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1">Start auditing and managing construction risks</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="David Vance"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-sky-500 text-sm transition-colors text-white"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Role Profile</label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-bold rounded-xl text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 transition-all hover:scale-[1.02] mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Seeding Account...
              </>
            ) : (
              'Create Platform Account'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-8">
          Already registered?{' '}
          <Link href="/login" className="text-sky-400 hover:text-sky-300 font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
