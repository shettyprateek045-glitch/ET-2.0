"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center p-4 relative overflow-hidden text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card-bg/60 border border-border p-8 rounded-2xl shadow-2xl glass relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center font-extrabold text-white text-lg">
              DC
            </div>
            <span className="font-bold text-2xl tracking-tight">DataCentre AI</span>
          </Link>
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-1 text-center">We will email you credentials recovery guidelines</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg">Check Your Email</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              If an account exists for <span className="font-semibold text-white">{email}</span>, you will receive a password reset link shortly.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 font-semibold pt-4">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
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
                  placeholder="engineer@datacentre.ai"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-border rounded-xl focus:outline-none focus:border-sky-500 text-sm transition-colors text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-bold rounded-xl text-white shadow-lg shadow-sky-500/10 transition-all hover:scale-[1.02]"
            >
              Send Reset Directions
            </button>

            <Link href="/login" className="flex items-center justify-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-semibold mt-4">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
