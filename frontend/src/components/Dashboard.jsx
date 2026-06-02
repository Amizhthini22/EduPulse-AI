import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertTriangle, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react';

export default function Dashboard({ setActiveTab, setSelectedStudentId }) {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, insightsRes, studentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/stats'),
          fetch('http://localhost:8000/api/dashboard/insights'),
          fetch('http://localhost:8000/api/students')
        ]);
        
        const statsData = await statsRes.json();
        const insightsData = await insightsRes.json();
        
        // Fetch detailed profiles of students to get risk levels
        const studentsList = await studentsRes.json();
        const studentsDetails = await Promise.all(
          studentsList.map(async (student) => {
            const res = await fetch(`http://localhost:8000/api/students/${student.id}`);
            return res.json();
          })
        );
        
        setStats(statsData);
        setInsights(insightsData);
        setStudents(studentsDetails);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const highRiskStudents = students.filter(s => s.risk_level === 'High Risk');
  const mediumRiskStudents = students.filter(s => s.risk_level === 'Medium Risk');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Classroom Overview</h2>
          <p className="text-slate-400 mt-1">Identify learning gaps and deliver immediate intervention recommendations.</p>
        </div>
        <button 
          onClick={() => setActiveTab('upload')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold shadow-lg shadow-brand-500/20 transition-all duration-300 self-start text-sm"
        >
          + Record Test Score
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="glass-card glow-hover rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Total Students</p>
            <h3 className="text-4xl font-extrabold">{stats?.total_students || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
            <Users size={24} />
          </div>
        </div>

        {/* Class Average */}
        <div className="glass-card glow-hover rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Class Average</p>
            <h3 className="text-4xl font-extrabold">{stats?.class_average || 0}%</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Struggling Students */}
        <div className="glass-card glow-hover rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">High Risk Students</p>
            <h3 className="text-4xl font-extrabold text-rose-400">{stats?.struggling_students || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Weak Concepts */}
        <div className="glass-card glow-hover rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Weak Concepts</p>
            <h3 className="text-4xl font-extrabold text-amber-400">{stats?.weak_concepts_count || 0}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Weakest Concepts & Dashboard Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Weakest Concepts list */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-brand-400" />
              <h3 className="text-lg font-bold">Classroom Learning Gaps</h3>
            </div>
            
            <div className="space-y-4">
              {insights?.weakest_concepts.length > 0 ? (
                insights.weakest_concepts.map((item, idx) => {
                  const percent = item.average;
                  let colorClass = "bg-rose-500";
                  let bgTrack = "bg-rose-950/20";
                  if (percent >= 60 && percent <= 75) {
                    colorClass = "bg-amber-500";
                    bgTrack = "bg-amber-950/20";
                  } else if (percent > 75) {
                    colorClass = "bg-emerald-500";
                    bgTrack = "bg-emerald-950/20";
                  }

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-200">{item.concept}</span>
                        <span className={percent < 60 ? 'text-rose-400' : percent <= 75 ? 'text-amber-400' : 'text-emerald-400'}>
                          Class Average: {percent}%
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full ${bgTrack} overflow-hidden border border-slate-800`}>
                        <div 
                          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">No concept averages available.</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">Classroom clustering is active.</span>
              <button 
                onClick={() => setActiveTab('smart-groups')}
                className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 group"
              >
                View Smart Remedial Groups <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Peer Tutoring Action Board Card */}
          <div className="bg-gradient-to-br from-purple-950/30 to-brand-950/20 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-purple-200 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping"></span>
                  EduPulse Smart Grouping Ready
                </h4>
                <p className="text-slate-300 text-sm mt-1">
                  We've automatically clustered students by skill gaps and paired peer mentors for group tutoring.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('smart-groups')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all self-start md:self-center"
              >
                Review Pairings
              </button>
            </div>
          </div>

        </div>

        {/* Right Column - Student Risk Roster */}
        <div className="space-y-6">
          
          {/* Urgent Risk Intervention List */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400">
                <ShieldAlert size={20} />
                Intervention Roster
              </h3>
              <p className="text-xs text-slate-400 mt-1">Students requiring immediate curriculum reinforcement.</p>
            </div>

            <div className="space-y-3">
              {highRiskStudents.length > 0 ? (
                highRiskStudents.map((s, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleStudentClick(s.student_id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-rose-300 transition-colors">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.roll_number} • {s.grade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold uppercase px-2 py-0.5 rounded-md">
                        {s.risk_level}
                      </span>
                      <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 group-hover:text-rose-400 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No students identified as High Risk! 🎉</p>
              )}

              {/* Medium risk additions */}
              {mediumRiskStudents.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Moderate Watchlist</p>
                  {mediumRiskStudents.slice(0, 3).map((s, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleStudentClick(s.student_id)}
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 cursor-pointer group transition-all"
                    >
                      <div>
                        <h4 className="text-sm font-bold group-hover:text-amber-300 transition-colors">{s.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{s.roll_number} • {s.grade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold uppercase px-2 py-0.5 rounded-md">
                          {s.risk_level}
                        </span>
                        <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('students')}
              className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 font-bold text-xs text-slate-300 hover:text-white transition-all text-center block"
            >
              View Full Student List
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
