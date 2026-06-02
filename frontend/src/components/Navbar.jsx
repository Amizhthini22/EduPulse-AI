import React, { useState } from 'react';
import {
  BrainCircuit,
  LayoutDashboard,
  BarChart3,
  Users,
  UploadCloud,
  Sparkles,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { t, locale, changeLocale, supportedLocales } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard',     label: t.nav.dashboard,    icon: LayoutDashboard },
    { id: 'insights',      label: t.nav.insights,     icon: BarChart3 },
    { id: 'smart-groups',  label: t.nav.smartGroups,  icon: Sparkles, highlight: true },
    { id: 'students',      label: t.nav.students,     icon: Users },
    { id: 'upload',        label: t.nav.upload,       icon: UploadCloud },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="glass-card sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <button
          onClick={() => handleNav('dashboard')}
          aria-label="Go to Dashboard"
          className="flex items-center gap-3 min-h-[44px] min-w-[44px]"
        >
          <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg shadow-brand-500/20 flex-shrink-0">
            <BrainCircuit size={22} aria-hidden="true" />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent leading-none">
              {t.appName}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
              {t.appTagline}
            </p>
          </div>
        </button>

        {/* Desktop Nav */}
        <div
          className="hidden lg:flex items-center gap-1"
          role="menubar"
          aria-label="Navigation menu"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : item.highlight
                      ? 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  size={15}
                  aria-hidden="true"
                  className={item.highlight && !isActive ? 'text-purple-400' : ''}
                />
                <span>{item.label}</span>
                {item.highlight && (
                  <span
                    aria-hidden="true"
                    className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  >
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Language Switcher + Live Indicator + Hamburger */}
        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <div className="relative flex items-center gap-1">
            <Globe size={14} className="text-slate-400" aria-hidden="true" />
            <select
              value={locale}
              onChange={(e) => changeLocale(e.target.value)}
              aria-label="Select language"
              className="bg-transparent text-slate-300 text-xs font-semibold border-none outline-none cursor-pointer min-h-[44px] pr-1"
            >
              {supportedLocales.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Live Sync indicator — desktop only */}
          <div
            aria-hidden="true"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-[11px] font-semibold text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Sync</span>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-4 space-y-1 animate-fade-in"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white'
                      : 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
