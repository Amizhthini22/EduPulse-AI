import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertTriangle, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Dashboard({ setActiveTab, setSelectedStudentId }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, insightsRes, studentsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/insights'),
          fetch('/api/students')
        ]);

        if (!statsRes.ok || !insightsRes.ok || !studentsRes.ok) throw new Error('API error');

        const statsData = await statsRes.json();
        const insightsData = await insightsRes.json();

        const studentsList = await studentsRes.json();
        const studentsDetails = await Promise.all(
          studentsList.map(async (student) => {
            const res = await fetch(`/api/students/${student.id}`);
            return res.ok ? res.json() : null;
          })
        );

        setStats(statsData);
        setInsights(insightsData);
        setStudents(studentsDetails.filter(Boolean));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setActiveTab('student-detail');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label={t.common.loading}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="max-w-xl mx-auto mt-16 p-8 glass-card rounded-2xl text-center space-y-4">
        <p className="text-rose-400 font-bold">Could not load dashboard. Check that the backend is running.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const highRiskStudents = students.filter(s => s.risk_level === 'High Risk');
  const mediumRiskStudents = students.filter(s => s.risk_level === 'Medium Risk');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.dashboard.title}</h2>
          <p className="text-slate-400 mt-1 text-sm">{t.dashboard.subtitle}</p>
        </div>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold shadow-lg shadow-brand-500/20 transition-all duration-300 self-start text-sm"
        >
          {t.dashboard.recordScore}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label="Key metrics">
        {[
          { label: t.dashboard.totalStudents, value: stats?.total_students ?? 0, color: 'brand', Icon: Users },
          { label: t.dashboard.classAverage, value: `${stats?.class_average ?? 0}%`, color: 'emerald', Icon: GraduationCap },
          { label: t.dashboard.highRiskStudents, value: stats?.struggling_students ?? 0, color: 'rose', Icon: ShieldAlert },
          { label: t.dashboard.weakConcepts, value: stats?.weak_concepts_count ?? 0, color: 'amber', Icon: AlertTriangle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} role="listitem" className="glass-card glow-hover rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
              <h3 className={`text-3xl font-extrabold ${color === 'rose' ? 'text-rose-400' : color === 'amber' ? 'text-amber-400' : ''}`}>
                {value}
              </h3>
            </div>
            <div className={`h-11 w-11 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/20`}>
              <Icon size={22} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* Learning Gaps */}
          <section aria-labelledby="learning-gaps-heading" className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-brand-400" aria-hidden="true" />
              <h3 id="learning-gaps-heading" className="text-lg font-bold">{t.dashboard.learningGaps}</h3>
            </div>
            <div className="space-y-4">
              {insights?.weakest_concepts?.length > 0 ? (
                insights.weakest_concepts.map((item, idx) => {
                  const percent = item.average;
                  const colorClass = percent < 60 ? 'bg-rose-500' : percent <= 75 ? 'bg-amber-500' : 'bg-emerald-500';
                  const bgTrack   = percent < 60 ? 'bg-rose-950/20' : percent <= 75 ? 'bg-amber-950/20' : 'bg-emerald-950/20';
                  const textColor = percent < 60 ? 'text-rose-400' : percent <= 75 ? 'text-amber-400' : 'text-emerald-400';
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-200">{item.concept}</span>
                        <span className={textColor}>{t.dashboard.classAvg}: {percent}%</span>
                      </div>
                      <div
                        className={`w-full h-3 rounded-full ${bgTrack} overflow-hidden border border-slate-800`}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.concept} class average: ${percent}%`}
                      >
                        <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">{t.dashboard.noConceptData}</p>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">{t.dashboard.clusteringActive}</span>
              <button
                onClick={() => setActiveTab('smart-groups')}
                className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 group"
              >
                {t.dashboard.viewSmartGroups} <ArrowRight size={14} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* Smart Grouping Banner */}
          <div className="bg-gradient-to-br from-purple-950/30 to-brand-950/20 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-purple-200 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" aria-hidden="true" />
                  {t.dashboard.smartGroupingReady}
                </h4>
                <p className="text-slate-300 text-sm mt-1">{t.dashboard.smartGroupingDesc}</p>
              </div>
              <button
                onClick={() => setActiveTab('smart-groups')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all self-start md:self-center"
              >
                {t.dashboard.reviewPairings}
              </button>
            </div>
          </div>
        </div>

        {/* Intervention Roster */}
        <section aria-labelledby="intervention-heading" className="glass-card rounded-2xl p-6 space-y-6 h-fit">
          <div>
            <h3 id="intervention-heading" className="text-lg font-bold flex items-center gap-2 text-rose-400">
              <ShieldAlert size={20} aria-hidden="true" />
              {t.dashboard.interventionRoster}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t.dashboard.interventionDesc}</p>
          </div>

          <div className="space-y-3">
            {highRiskStudents.length > 0 ? (
              highRiskStudents.map((s) => (
                <button
                  key={s.student_id}
                  onClick={() => handleStudentClick(s.student_id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer group transition-all text-left"
                  aria-label={`View ${s.name}, High Risk`}
                >
                  <div>
                    <p className="text-sm font-bold group-hover:text-rose-300 transition-colors">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{s.roll_number} • {s.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold uppercase px-2 py-0.5 rounded-md">
                      {t.common.highRisk}
                    </span>
                    <ArrowRight size={14} aria-hidden="true" className="text-slate-500 group-hover:translate-x-1 group-hover:text-rose-400 transition-all" />
                  </div>
                </button>
              ))
            ) : (
              <p className="text-slate-400 text-sm">{t.dashboard.noHighRisk}</p>
            )}

            {mediumRiskStudents.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t.dashboard.moderateWatchlist}</p>
                {mediumRiskStudents.slice(0, 3).map((s) => (
                  <button
                    key={s.student_id}
                    onClick={() => handleStudentClick(s.student_id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 cursor-pointer group transition-all text-left"
                    aria-label={`View ${s.name}, Medium Risk`}
                  >
                    <div>
                      <p className="text-sm font-bold group-hover:text-amber-300 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.roll_number} • {s.grade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold uppercase px-2 py-0.5 rounded-md">
                        {t.common.mediumRisk}
                      </span>
                      <ArrowRight size={14} aria-hidden="true" className="text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('students')}
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 font-bold text-xs text-slate-300 hover:text-white transition-all"
          >
            {t.dashboard.viewFullList}
          </button>
        </section>

      </div>
    </div>
  );
}