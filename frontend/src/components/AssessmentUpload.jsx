import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';

const STANDARD_CONCEPTS = {
  "Mathematics": ["Fractions", "Algebra", "Geometry", "Word Problems"],
  "Science": ["Photosynthesis", "Forces", "Circuits", "Ecosystems"],
  "English": ["Grammar", "Punctuation", "Vocabulary", "Reading Comprehension"]
};

export default function AssessmentUpload({ onUploadSuccess }) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [scores, setScores] = useState({}); // {"Fractions": 80, "Algebra": 45}
  
  // Custom concepts mapping for "Custom" subject
  const [customConcepts, setCustomConcepts] = useState([{ name: "", score: "" }]);

  // Status State
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('http://localhost:8000/api/students');
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].id);
        }
      } catch (err) {
        console.error("Error loading students list:", err);
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  // Update score state when subject or template concepts change
  useEffect(() => {
    if (subject !== "Custom") {
      const concepts = STANDARD_CONCEPTS[subject] || [];
      const initialScores = {};
      concepts.forEach(c => {
        initialScores[c] = "";
      });
      setScores(initialScores);
    } else {
      setScores({});
    }
  }, [subject]);

  const handleScoreChange = (concept, val) => {
    setScores(prev => ({
      ...prev,
      [concept]: val === "" ? "" : parseFloat(val)
    }));
  };

  const handleAddCustomConcept = () => {
    setCustomConcepts(prev => [...prev, { name: "", score: "" }]);
  };

  const handleRemoveCustomConcept = (index) => {
    setCustomConcepts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomChange = (index, field, val) => {
    setCustomConcepts(prev => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedStudentId) {
      setError("Please select a student.");
      return;
    }

    let finalScores = {};
    if (subject !== "Custom") {
      // Validate template scores
      const concepts = STANDARD_CONCEPTS[subject];
      for (let c of concepts) {
        const scoreVal = scores[c];
        if (scoreVal === "" || scoreVal === undefined || isNaN(scoreVal)) {
          setError(`Please fill in the score for ${c}.`);
          return;
        }
        if (scoreVal < 0 || scoreVal > 100) {
          setError(`Score for ${c} must be between 0 and 100.`);
          return;
        }
        finalScores[c] = scoreVal;
      }
    } else {
      // Validate custom scores
      if (customConcepts.length === 0 || (customConcepts.length === 1 && !customConcepts[0].name)) {
        setError("Please add at least one concept and score.");
        return;
      }

      for (let i = 0; i < customConcepts.length; i++) {
        const item = customConcepts[i];
        if (!item.name.trim()) {
          setError(`Concept name at position ${i + 1} cannot be blank.`);
          return;
        }
        const scoreVal = parseFloat(item.score);
        if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
          setError(`Score for "${item.name}" must be a number between 0 and 100.`);
          return;
        }
        finalScores[item.name.trim()] = scoreVal;
      }
    }

    setIsSubmitting(true);
    const payload = {
      student_id: parseInt(selectedStudentId),
      subject: subject === "Custom" ? "Custom Assessment" : subject,
      scores: finalScores
    };

    try {
      const res = await fetch('http://localhost:8000/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to upload assessment.");
      }

      setSuccess(true);
      
      // Reset scores input fields
      if (subject !== "Custom") {
        const concepts = STANDARD_CONCEPTS[subject];
        const cleared = {};
        concepts.forEach(c => cleared[c] = "");
        setScores(cleared);
      } else {
        setCustomConcepts([{ name: "", score: "" }]);
      }
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Record Test Score</h2>
        <p className="text-slate-400 mt-1">Upload assessment records for a student to trigger learning gap updates.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        
        {/* Alerts */}
        {success && (
          <div className="p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} />
            Assessment recorded successfully! Gaps and AI feedback have been updated.
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300 font-semibold flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Dropdown */}
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Select Student
              </label>
              {students.length > 0 ? (
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-rose-300 font-bold">
                  No students in database. Add students first.
                </div>
              )}
            </div>

            {/* Subject Selector */}
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Subject
              </label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white font-semibold"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Custom">Custom Subject</option>
              </select>
            </div>

          </div>

          {/* Dynamic Concept Scores Inputs */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Concept Scores (0 - 100)</h4>

            {subject !== "Custom" ? (
              // Standard template scoring
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(STANDARD_CONCEPTS[subject] || []).map((concept) => (
                  <div key={concept} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">{concept}</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      placeholder="Enter score"
                      value={scores[concept] === undefined ? "" : scores[concept]}
                      onChange={(e) => handleScoreChange(concept, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white"
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Custom scoring mode
              <div className="space-y-3">
                {customConcepts.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input 
                      type="text"
                      placeholder="Concept Name (e.g. History, Decimals)"
                      value={item.name}
                      onChange={(e) => handleCustomChange(idx, "name", e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white"
                    />
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Score"
                      value={item.score}
                      onChange={(e) => handleCustomChange(idx, "score", e.target.value)}
                      className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-white"
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveCustomConcept(idx)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={handleAddCustomConcept}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all"
                >
                  <Plus size={14} /> Add Concept Score Row
                </button>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button 
              type="submit"
              disabled={isSubmitting || students.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-sm shadow-lg shadow-brand-500/20 text-white transition-all disabled:opacity-50"
            >
              <UploadCloud size={16} /> {isSubmitting ? "Uploading..." : "Record Assessment Data"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
