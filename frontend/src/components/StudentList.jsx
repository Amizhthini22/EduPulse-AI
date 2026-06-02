import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, ShieldAlert, GraduationCap, X, Eye } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function StudentList({ onSelectStudent }) {
  const { t } = useLanguage();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [currentStudent, setCurrentStudent] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("8th Grade");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      const detailedStudents = await Promise.all(
        data.map(async (student) => {
          const detRes = await fetch(`/api/students/${student.id}`);
          return detRes.ok ? detRes.json() : { ...student, average_score: 0, risk_level: 'Low Risk', weak_concepts: [] };
        })
      );
      setStudents(detailedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setModalType("add");
    setName("");
    setRollNumber("");
    setGrade("8th Grade");
    setError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setModalType("edit");
    setCurrentStudent(student);
    setName(student.name);
    setRollNumber(student.roll_number);
    setGrade(student.grade);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !rollNumber) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = { name, grade, roll_number: rollNumber };
    
    try {
      let res;
      if (modalType === "add") {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/students/${currentStudent.student_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error saving student.");
      }

      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm(t.students.deleteConfirm)) return;
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (res.ok) fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.students.title}</h2>
          <p className="text-slate-400 mt-1 text-sm">{t.students.subtitle}</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold shadow-lg shadow-brand-500/20 transition-all text-sm self-start"
        >
          <Plus size={16} aria-hidden="true" /> {t.students.addStudent}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/20 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder={t.students.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t.students.search}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
          />
        </div>
        <p className="text-xs text-slate-400 font-semibold" aria-live="polite">
          {t.students.showing} {filteredStudents.length} {t.students.of} {students.length} {t.students.studentsLabel}
        </p>
      </div>

      {/* Roster Cards/Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => {
            const hasData = s.average_score > 0;
            let riskBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            if (s.risk_level === "High Risk") {
              riskBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
            } else if (s.risk_level === "Medium Risk") {
              riskBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            }

            return (
              <div key={s.student_id} className="glass-card rounded-2xl p-6 glow-hover relative overflow-hidden group">
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  s.risk_level === "High Risk" ? 'bg-rose-500' : s.risk_level === "Medium Risk" ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>

                {/* Card Title */}
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h3 className="font-extrabold text-lg text-white group-hover:text-brand-300 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Roll No: {s.roll_number} • {s.grade}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase border px-2.5 py-1 rounded-md ${riskBadgeColor}`}>
                    {s.risk_level}
                  </span>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-4 mt-6 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Score Avg</span>
                    <span className="text-xl font-extrabold flex items-center gap-1.5 mt-0.5 text-white">
                      <GraduationCap size={16} className="text-brand-400" />
                      {hasData ? `${s.average_score}%` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gaps Detected</span>
                    <span className="text-xl font-extrabold flex items-center gap-1.5 mt-0.5 text-rose-400">
                      <ShieldAlert size={16} />
                      {s.weak_concepts?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => onSelectStudent(s.student_id)}
                    className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold"
                    aria-label={`${t.students.fullAnalytics} for ${s.name}`}
                  >
                    <Eye size={14} aria-hidden="true" /> {t.students.fullAnalytics}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/60 transition-all hover:bg-slate-700"
                      aria-label={`Edit ${s.name}`}
                    >
                      <Edit2 size={13} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.student_id)}
                      className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all hover:bg-rose-950/20 hover:border-rose-500/20"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <p className="font-semibold text-lg">No students found matching "{search}"</p>
          <p className="text-sm text-slate-500 mt-1">Try searching for a different keyword or create a new student profile.</p>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative animate-fade-in">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 text-white">
              {modalType === "add" ? t.students.registerNew : t.students.updateProfile}
            </h3>

            {error && (
              <div role="alert" className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="student-name" className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  {t.students.fullName}
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="roll-number" className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  {t.students.rollNumber}
                </label>
                <input
                  id="roll-number"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. R108"
                  disabled={modalType === "edit"}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 disabled:opacity-55"
                />
              </div>
              <div>
                <label htmlFor="grade-class" className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  {t.students.gradeClass}
                </label>
                <input
                  id="grade-class"
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 8th Grade"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white">
                  {t.students.cancel}
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold shadow-lg shadow-brand-500/20">
                  {modalType === "add" ? t.students.addBtn : t.students.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
