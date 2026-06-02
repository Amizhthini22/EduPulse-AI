import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  GraduationCap, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  Clipboard, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StudentDetail({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState(null);

  useEffect(() => {
    async function fetchStudentDetail() {
      if (!studentId) return;
      try {
        const res = await fetch(`/api/students/${studentId}`);
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentDetail();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading student data">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-slate-400">
        <p className="text-lg font-bold">Student not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-400 font-bold hover:underline">
          Return to Roster
        </button>
      </div>
    );
  }

  // Setup trend chart data
  const sortedAssessments = [...(student.assessments || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const chartLabels = sortedAssessments.map(a => 
    new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );

  const chartPoints = sortedAssessments.map(a => {
    if (!a.scores || a.scores.length === 0) return 0;
    const total = a.scores.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / a.scores.length) * 10) / 10;
  });

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Assessment Average Score (%)',
        data: chartPoints,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointRadius: 4,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Avg: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter' }
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter' },
          stepSize: 20
        }
      }
    }
  };

  const toggleAssessmentExpand = (id) => {
    setExpandedAssessmentId(expandedAssessmentId === id ? null : id);
  };

  // Concept classifications
  const conceptScores = student.latest_scores || {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Back Button / Navigation */}
      <div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft size={16} /> Back to Student Roster
        </button>
      </div>

      {/* Profile summary header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/10 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-white">{student.name}</h2>
            <span className={`text-xs font-extrabold uppercase border px-2.5 py-0.5 rounded-md ${
              student.risk_level === 'High Risk' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : student.risk_level === 'Medium Risk' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {student.risk_level}
            </span>
          </div>
          <p className="text-sm text-slate-400 font-semibold">Roll Number: {student.roll_number} • Grade: {student.grade}</p>
        </div>

        {/* Global Performance Indicator */}
        <div className="flex gap-6 items-center">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Score Avg</span>
            <span className="text-2xl font-extrabold text-brand-400 mt-1 block">{student.average_score}%</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Gap Areas</span>
            <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{student.weak_concepts.length}</span>
          </div>
        </div>
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Diagnostics, Recommendations, and History (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Gap Analysis & Feedback */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            {/* Visual glow */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-brand-500/5 rounded-bl-full"></div>
            
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
              <BookOpen size={20} className="text-brand-400" />
              EduPulse AI Feedback Digest
            </h3>
            
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-sm text-slate-300 font-medium italic">
              "{student.feedback}"
            </div>
          </div>

          {/* Actionable Recommendations (Remedial, Suggested Activity, Homework) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clipboard size={20} className="text-brand-400" />
              Teacher Intervention Action Items
            </h3>

            {student.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {student.recommendations.map((rec, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-6 border-l-4 border-l-brand-500/80 shadow-md space-y-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-bold text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        {rec.concept} Reinforcement Plan
                      </h4>
                      <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded">
                        Score: {rec.score}%
                      </span>
                    </div>

                    {/* Three specific components */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Remedial Action */}
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">1. Remedial Action</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{rec.remedial_action}</p>
                      </div>

                      {/* Suggested Activity */}
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">2. Small-Group Activity</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{rec.suggested_activity}</p>
                      </div>

                      {/* Homework */}
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">3. Homework Target</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{rec.homework}</p>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 text-center text-slate-400 flex items-center justify-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <span className="font-semibold text-sm">No weak areas requiring structured remedial intervention plans!</span>
              </div>
            )}
          </div>

          {/* Assessment History Table */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Clock size={20} className="text-brand-400" />
              Assessment History
            </h3>

            {student.assessments.length > 0 ? (
              <div className="border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/80">
                {student.assessments.map((item) => (
                  <div key={item.id} className="bg-slate-900/30">
                    
                    {/* Header Row */}
                    <div 
                      onClick={() => toggleAssessmentExpand(item.id)}
                      className="flex justify-between items-center p-4 hover:bg-slate-800/20 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{item.subject}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-xs bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-lg text-slate-300 font-bold">
                          Concept Avg: {Math.round((item.scores.reduce((sum, s) => sum + s.score, 0) / item.scores.length) * 10) / 10}%
                        </span>
                        <ChevronRight 
                          size={16} 
                          className={`text-slate-500 transition-transform ${expandedAssessmentId === item.id ? 'rotate-90 text-white' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Expandable Concept scores */}
                    {expandedAssessmentId === item.id && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60">
                        {item.scores.map((scoreObj, idx) => {
                          const classification = scoreObj.score < 60 ? 'Weak' : scoreObj.score <= 75 ? 'Moderate' : 'Strong';
                          let tagColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                          if (classification === 'Weak') {
                            tagColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                          } else if (classification === 'Moderate') {
                            tagColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                          }

                          return (
                            <div key={idx} className="p-3 bg-slate-955/40 border border-slate-800/80 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block truncate">{scoreObj.concept_name}</span>
                              <div className="flex items-baseline justify-between">
                                <span className="text-sm font-extrabold text-white">{scoreObj.score}%</span>
                                <span className={`text-[8px] font-extrabold uppercase border px-1 rounded ${tagColor}`}>
                                  {classification}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">No assessment history recorded yet.</p>
            )}
          </div>

        </div>

        {/* Right Side: Trend Chart & Concept Breakdown (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Performance Trend Chart */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-brand-400" />
              Score Trend Over Time
            </h3>
            
            {chartLabels.length > 0 ? (
              <div className="h-56 relative w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center border border-slate-800/80 rounded-xl bg-slate-900/10 text-xs text-slate-500">
                Need assessment records to plot trend
              </div>
            )}
          </div>

          {/* Concept Mastery breakdown */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-md font-bold mb-4">Latest Concept Mastery</h3>
            <div className="space-y-4">
              {Object.keys(conceptScores).length > 0 ? (
                Object.entries(conceptScores).map(([concept, score]) => {
                  let barColor = "bg-rose-500";
                  let tagText = "Weak";
                  let tagColor = "text-rose-400";
                  
                  if (score >= 60 && score <= 75) {
                    barColor = "bg-amber-500";
                    tagText = "Moderate";
                    tagColor = "text-amber-400";
                  } else if (score > 75) {
                    barColor = "bg-emerald-500";
                    tagText = "Strong";
                    tagColor = "text-emerald-400";
                  }

                  return (
                    <div key={concept} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300">{concept}</span>
                        <span className={`font-bold ${tagColor}`}>{score}% ({tagText})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden border border-slate-800/80">
                        <div 
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-xs">No concept score breakdowns available.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
