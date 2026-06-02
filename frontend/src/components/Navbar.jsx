import React from 'react';
import { BrainCircuit, LayoutDashboard, BarChart3, Users, UploadCloud, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Class Insights', icon: BarChart3 },
    { id: 'smart-groups', label: 'Smart Groups', icon: Sparkles, highlight: true },
    { id: 'students', label: 'Student Roster', icon: Users },
    { id: 'upload', label: 'Record Assessment', icon: UploadCloud },
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 border-b border-slate-800 backdrop-blur-md bg-slate-900/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg shadow-brand-500/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent">
              EduPulse <span className="text-brand-500">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Learning Gap Analyst</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? item.highlight 
                      ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : item.highlight
                      ? 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className={item.highlight && !isActive ? 'text-purple-400 animate-pulse' : ''} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 tracking-wider">
                    Hack
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-[11px] font-semibold text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Sync: edupulse.db</span>
        </div>

      </div>
    </nav>
  );
}
