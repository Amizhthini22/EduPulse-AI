import React, { useState, useEffect } from 'react';
import { Sparkles, Users, UserMinus, ShieldAlert, Award, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function SmartGroups() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch('http://localhost:8000/api/dashboard/groupings');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching groupings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const groups = data?.remedial_groups || [];
  const pairings = data?.peer_pairings || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
              Innovative Feature
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-purple-400 animate-pulse" />
            AI Smart Grouping Engine
          </h2>
          <p className="text-slate-400">
            Automatically clusters student performance records to build action groups and peer tutoring alignments.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Remedial Study Groups (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-brand-400" />
              Remedial Intervention Groups
            </h3>
            <span className="text-xs text-slate-400 font-medium">{groups.length} active groups</span>
          </div>

          {groups.length > 0 ? (
            <div className="space-y-6">
              {groups.map((group, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-6 border-l-4 border-l-rose-500/80 shadow-md">
                  
                  {/* Group Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {group.subject}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {group.concept} Support Squad
                      </h4>
                    </div>
                    <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold px-3 py-1 rounded-full">
                      {group.struggling_students.length} Students
                    </span>
                  </div>

                  {/* Student Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {group.struggling_students.map((student) => (
                      <span 
                        key={student.id} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold hover:border-rose-500/30 transition-all cursor-default"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {student.name}
                        <span className="text-[10px] text-rose-400 font-bold">({student.score}%)</span>
                      </span>
                    ))}
                  </div>

                  {/* Guided Activities */}
                  <div className="mt-5 space-y-3 pt-4 border-t border-slate-800/60 text-sm">
                    <div className="bg-slate-800/30 border border-slate-800/80 rounded-xl p-3">
                      <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wide block">
                        Remedial Intervention Plan
                      </span>
                      <p className="text-slate-300 mt-1 text-xs leading-relaxed font-semibold">
                        {group.remedial_action}
                      </p>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-800/80 rounded-xl p-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wide block">
                        Suggested Classroom Activity
                      </span>
                      <p className="text-slate-300 mt-1 text-xs leading-relaxed font-semibold">
                        {group.suggested_activity}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
              <p className="font-semibold text-sm">No concept averages indicate standard learning gaps!</p>
              <p className="text-xs text-slate-500 mt-1">All class performance scores are above 60%.</p>
            </div>
          )}
        </div>

        {/* Peer Tutoring Matches (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="text-purple-400" />
              Peer-Tutoring Pairings
            </h3>
            <span className="text-xs text-slate-400 font-medium">{pairings.length} matches</span>
          </div>

          {pairings.length > 0 ? (
            <div className="space-y-4">
              {pairings.map((pair, idx) => (
                <div 
                  key={idx} 
                  className="bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-lg shadow-purple-950/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-bl-full pointer-events-none"></div>

                  <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                    {pair.concept} Pairing
                  </span>

                  {/* Matching Layout */}
                  <div className="flex items-center justify-between gap-2 mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    
                    {/* Mentor */}
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mentor</p>
                      <h5 className="text-xs font-extrabold text-purple-200 mt-0.5 truncate">{pair.mentor.name}</h5>
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                        {pair.mentor.score}%
                      </span>
                    </div>

                    {/* Connection Icon */}
                    <div className="flex flex-col items-center text-purple-400">
                      <ArrowRightLeft size={16} className="animate-pulse" />
                    </div>

                    {/* Mentee */}
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Peer</p>
                      <h5 className="text-xs font-extrabold text-rose-300 mt-0.5 truncate">{pair.tutee.name}</h5>
                      <span className="text-[10px] bg-rose-500/10 text-rose-300 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                        {pair.tutee.score}%
                      </span>
                    </div>

                  </div>

                  {/* Discussion prompt */}
                  <div className="mt-4 p-3 bg-slate-900/30 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-300 font-medium">
                    <span className="font-bold text-purple-300 block mb-0.5">Task Description:</span>
                    {pair.activity}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
              <UserMinus size={36} className="mx-auto text-slate-500 mb-3" />
              <p className="font-semibold text-sm">No peer pairings available.</p>
              <p className="text-xs text-slate-500 mt-1">Requires at least one student below 60% and one student above 85% in the same concept.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
