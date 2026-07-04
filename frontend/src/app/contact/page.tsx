"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, Globe, Send, MessageSquare,
  Clock, Building2, CheckCircle2, AlertCircle, ChevronDown,
  ExternalLink, Users
} from 'lucide-react';

const OFFICES = [
  {
    city: 'London HQ',
    address: '1 Canada Square, Canary Wharf, London, E14 5AB, UK',
    phone: '+44 20 7946 0321',
    email: 'london@datacentre.ai',
    hours: 'Mon–Fri: 8am–6pm GMT',
    flag: '🇬🇧',
  },
  {
    city: 'San Francisco',
    address: '1 Market Street, Suite 900, San Francisco, CA 94105, USA',
    phone: '+1 415 555 0198',
    email: 'sf@datacentre.ai',
    hours: 'Mon–Fri: 9am–5pm PST',
    flag: '🇺🇸',
  },
  {
    city: 'Singapore APAC',
    address: '1 Raffles Place, #20-61, One Raffles Place, Singapore 048616',
    phone: '+65 6632 1100',
    email: 'apac@datacentre.ai',
    hours: 'Mon–Fri: 9am–6pm SGT',
    flag: '🇸🇬',
  },
];

const DEPARTMENTS = [
  'General Inquiry',
  'Enterprise Sales',
  'Technical Support',
  'Partnership & Integration',
  'Media & Press',
  'Data Privacy Request',
];

const FAQ_ITEMS = [
  {
    q: 'How quickly can we onboard our project team?',
    a: 'Onboarding takes under 48 hours. Our solution engineers will guide you through project setup, document ingestion, and AI model configuration.'
  },
  {
    q: 'Do you offer a free trial or proof of concept?',
    a: 'Yes. We offer a 14-day full-access trial for Enterprise Core tier and a dedicated PoC environment for Operator Suite prospects.'
  },
  {
    q: 'What SLA guarantees do you offer?',
    a: 'Enterprise Core plans include 99.9% uptime SLA. Operator Suite includes dedicated infrastructure with 99.99% uptime and a 4-hour response SLA.'
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', company: '', department: DEPARTMENTS[0], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const loadTickets = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('epc_submitted_tickets');
        if (saved) {
          try {
            setTickets(JSON.parse(saved));
          } catch (e) {
            console.error("Error parsing saved tickets", e);
          }
        }
      }
    };
    
    loadTickets();
    window.addEventListener('storage', loadTickets);
    window.addEventListener('ticket-submitted', loadTickets);
    
    return () => {
      window.removeEventListener('storage', loadTickets);
      window.removeEventListener('ticket-submitted', loadTickets);
    };
  }, []);

  React.useEffect(() => {
    if (submitted && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulated submission
    
    const newTicket = {
      ...formState,
      date: new Date().toISOString()
    };
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('epc_submitted_tickets', JSON.stringify(updatedTickets));
    
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/20" />
        <div className="relative px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Get in Touch</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">We&apos;d love to hear from you</h2>
          <p className="text-secondary text-base max-w-xl mx-auto">
            Whether you have questions about our platform, need a demo, or want to explore an enterprise partnership — our team is here.
          </p>
        </div>
      </motion.div>

      {/* Quick Contact Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Mail, label: 'Email Us', value: 'hello@datacentre.ai', desc: 'We reply within 4 hours', color: 'text-sky-400 bg-sky-500/10' },
          { icon: Phone, label: 'Call Sales', value: '+1 800 DC-AI-EPC', desc: 'Mon–Fri, 9am–6pm PST', color: 'text-teal-400 bg-teal-500/10' },
          { icon: MessageSquare, label: 'AI Support Chat', value: 'Chat with Copilot', desc: 'Instant response 24/7', color: 'text-purple-400 bg-purple-500/10', action: () => { window.dispatchEvent(new CustomEvent('open-support-chat')) } },
          { icon: Clock, label: 'Book a Demo', value: 'Schedule a call', desc: 'Live platform walkthrough', color: 'text-pink-400 bg-pink-500/10' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={item.action}
            className="glass rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">{item.label}</p>
            <p className="font-bold text-sm">{item.value}</p>
            <p className="text-xs text-secondary mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!submitted ? (
            <div className="glass rounded-2xl border border-border p-8">
              <h3 className="text-xl font-bold mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={formState.name}
                      onChange={e => setFormState(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formState.email}
                      onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      placeholder="Hyperscale Corp Ltd"
                      value={formState.company}
                      onChange={e => setFormState(p => ({ ...p, company: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Department</label>
                  <select
                    value={formState.department}
                    onChange={e => setFormState(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your project, team size, or questions in detail..."
                    value={formState.message}
                    onChange={e => setFormState(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>

                <p className="text-xs text-secondary text-center">
                  By submitting, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl border border-emerald-500/30 p-8 flex flex-col items-center justify-center text-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message Received!</h3>
              <p className="text-secondary text-sm max-w-xs">
                Thank you, <strong>{formState.name}</strong>. Our team will respond to <strong>{formState.email}</strong> within 4 business hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', company: '', department: DEPARTMENTS[0], message: '' }); }}
                className="mt-6 text-sm text-primary font-semibold hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column: Offices + FAQ */}
        <div className="space-y-6">
          {/* Global Offices */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl border border-border p-6"
          >
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Global Offices
            </h3>
            <div className="space-y-5">
              {OFFICES.map((office, idx) => (
                <div key={idx} className="flex gap-4 pb-5 border-b border-border/40 last:border-0 last:pb-0">
                  <span className="text-2xl mt-1">{office.flag}</span>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{office.city}</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-secondary flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{office.address}</p>
                      <p className="text-xs text-secondary flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{office.phone}</p>
                      <p className="text-xs text-secondary flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" />{office.email}</p>
                      <p className="text-xs text-secondary flex items-center gap-1.5"><Clock className="w-3 h-3 shrink-0" />{office.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-border p-6"
          >
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> Common Questions
            </h3>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-secondary shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-sm text-secondary leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl border border-border p-6"
          >
            <h3 className="text-base font-bold mb-4">Follow DataCentre AI</h3>
            <div className="flex gap-3">
              {[
                { icon: Users, label: 'LinkedIn', color: 'hover:bg-sky-700' },
                { icon: Globe, label: 'Twitter', color: 'hover:bg-sky-500' },
                { icon: ExternalLink, label: 'YouTube', color: 'hover:bg-red-600' },
                { icon: Globe, label: 'Blog', color: 'hover:bg-emerald-600' },
              ].map((social, idx) => (
                <button
                  key={idx}
                  title={social.label}
                  className={`w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center text-secondary hover:text-white transition-all ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Submitted Tickets Log */}
      {tickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border p-6 mt-12 space-y-6"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Submitted Support Tickets ({tickets.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t, idx) => (
              <div key={idx} className="p-4 bg-white/5 border border-border/60 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-xs border-b border-border/20 pb-2">
                  <span className="font-semibold text-primary">{t.department}</span>
                  <span className="text-secondary">{new Date(t.date).toLocaleString()}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-secondary">Email: {t.email}</p>
                  {t.company && <p className="text-secondary">Company: {t.company}</p>}
                </div>
                <p className="text-xs text-secondary bg-white/3 p-2.5 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed">
                  {t.message}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
