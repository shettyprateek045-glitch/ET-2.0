"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Paperclip, Mic, Minimize2, Maximize2, Loader2, Sparkles, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

export default function AIChatbot() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI EPC Intelligence Assistant. I can help you query project knowledge bases, analyze specifications for compliance, or predict schedule risks. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Don't show on landing or auth pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-support-chat', handleOpenChat);
    return () => window.removeEventListener('open-support-chat', handleOpenChat);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Fast API integration
      const res = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'default-session',
          query: userMsg.content,
          language: language
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          sources: data.sources,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Backend offline");
      }
    } catch (e) {
      // Mock Fallback
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `(Local Mode) Based on the intelligence database, here is the analysis for: "${userMsg.content}". Recommend checking the procurement timeline for chillers.`,
          sources: ['Spec-Section-26.pdf', 'RFI-104'],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
      }, 1500);
      return;
    }
    
    setIsLoading(false);
  };

  const handleFileTicket = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    const ticketContent = input;
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const saved = localStorage.getItem('epc_submitted_tickets');
        const tickets = saved ? JSON.parse(saved) : [];
        const newTicket = {
          name: user ? user.full_name : 'Chatbot User',
          email: user ? user.email : 'chatbot@datacentre.ai',
          company: 'Filed via Support Chatbot',
          department: 'Technical Support',
          message: ticketContent,
          date: new Date().toISOString()
        };
        const updated = [newTicket, ...tickets];
        localStorage.setItem('epc_submitted_tickets', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('ticket-submitted'));
      } catch (e) {
        console.error(e);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Your support ticket has been successfully created and saved! You can view this enquiry under "Submitted Support Tickets" at the bottom of the Contact page.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-purple-700 hover:bg-purple-800 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-purple-700/50 transition-all z-50 group"
          >
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
            <Bot className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-6 right-6 z-50 glass shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 border border-purple-200 ${
              isExpanded ? 'w-[800px] h-[80vh] right-1/2 translate-x-1/2 bottom-1/2 translate-y-1/2' : 'w-[380px] h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="bg-purple-900 text-white px-4 py-3 flex items-center justify-between border-b border-purple-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">EPC Intelligence Copilot</h3>
                  <p className="text-[10px] text-purple-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <select 
                  className="bg-black/20 border border-white/20 rounded text-xs px-1 py-0.5 text-white mr-2 outline-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English" className="text-black">EN</option>
                  <option value="Spanish" className="text-black">ES</option>
                  <option value="German" className="text-black">DE</option>
                  <option value="French" className="text-black">FR</option>
                </select>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-700 text-white rounded-tr-sm' 
                      : 'bg-purple-50 border border-purple-100 text-purple-950 rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-purple-200/30">
                        <p className="text-[10px] font-semibold text-purple-700 uppercase mb-1">Sources Cited:</p>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((src, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200/50 rounded-full">
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className={`text-[9px] mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-50 border border-purple-100 shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-purple-800">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                    <span className="text-xs font-medium">Analyzing intelligence vectors...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card-bg border-t border-purple-100">
              <div className="relative flex items-center bg-background border border-purple-200 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 shadow-inner">
                <button className="p-2 text-purple-400 hover:text-purple-600 transition-colors ml-1">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or submit as ticket..."
                  className="flex-1 bg-transparent py-2.5 px-2 text-sm text-purple-950 focus:outline-none resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button className="p-2 text-purple-400 hover:text-purple-600 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleFileTicket}
                  disabled={!input.trim() || isLoading}
                  title="Submit Inquiry as Support Ticket"
                  className="p-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:bg-secondary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  title="Send Message to Chat"
                  className="p-2 mx-1 text-white bg-purple-750 rounded-lg hover:bg-purple-850 disabled:opacity-50 disabled:bg-secondary transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
