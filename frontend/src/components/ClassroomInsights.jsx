import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ClassroomInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/dashboard/insights');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const avgs = data?.concept_averages || [];
  const struggles = data?.struggling_per_concept || [];
  const weakest = data?.weakest_concepts || [];

  // 1. Concept Averages Chart Setup
  const averagesChartData = {
    labels: avgs.map(a => a.concept),
    datasets: [
      {
        label: 'Class Average (%)',
        data: avgs.map(a => a.average),
        backgroundColor: avgs.map(a => a.average < 60 ? 'rgba(244, 63, 94, 0.75)' : 'rgba(59, 130, 246, 0.75)'),
        borderColor: avgs.map(a => a.average < 60 ? 'rgb(244, 63, 94)' : 'rgb(59, 130, 246)'),
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  };

  const averagesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Class Average: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      }
    }
  };

  // 2. Struggles per Concept Chart Setup
  const strugglesChartData = {
    labels: struggles.map(s => s.concept),
    datasets: [
      {
        label: 'Students Struggling (<60%)',
        data: struggles.map(s => s.count),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  };

  const strugglesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Struggling Students: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#94a3b8', 
          font: { family: 'Inter', size: 11 },
          stepSize: 1
        },
        grid: { color: 'rgba(255, 255, 255, 0.03)' }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Classroom Insights</h2>
        <p className="text-slate-400 mt-1">Detailed statistical insights and analytics across concepts and test criteria.</p>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Concept Averages */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-brand-400" size={20} />
            <h3 className="text-lg font-bold">Class Average per Concept</h3>
          </div>
          <p className="text-xs text-slate-400">Class average scores. Red bars indicate areas with averages under 60%.</p>
          <div className="h-72 relative w-full pt-4">
            {avgs.length > 0 ? (
              <Bar data={averagesChartData} options={averagesChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center border border-slate-800 rounded-xl text-slate-500 text-xs">
                No scores recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Struggle Counts */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-rose-400" size={20} />
            <h3 className="text-lg font-bold">Students Struggling per Concept</h3>
          </div>
          <p className="text-xs text-slate-400">Count of students scoring below 60% inside each conceptual group.</p>
          <div className="h-72 relative w-full pt-4">
            {struggles.length > 0 ? (
              <Bar data={strugglesChartData} options={strugglesChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center border border-slate-800 rounded-xl text-slate-500 text-xs">
                No scores recorded yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Top 5 Weakest Concepts detailed listing */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <BarChart3 className="text-brand-400" size={20} />
          Priority Target List: Top 5 Weakest Concepts
        </h3>
        
        {weakest.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Concept Area</th>
                  <th className="py-3 px-4">Class Average</th>
                  <th className="py-3 px-4">Struggling Students</th>
                  <th className="py-3 px-4 text-right">Intervention Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {weakest.map((w, idx) => {
                  const numStruggling = struggles.find(s => s.concept === w.concept)?.count || 0;
                  const score = w.average;
                  let colorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                  let label = "High Intervention";
                  
                  if (score >= 60 && score <= 75) {
                    colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    label = "Monitor Progress";
                  } else if (score > 75) {
                    colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    label = "Enriched Content";
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{w.concept}</td>
                      <td className="py-3.5 px-4 font-bold">{score}%</td>
                      <td className="py-3.5 px-4 text-rose-400 font-semibold">{numStruggling} students</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`text-[10px] font-extrabold uppercase border px-2 py-0.5 rounded ${colorClass}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm font-medium text-center py-6">No data registered to calculate weak concepts.</p>
        )}
      </div>

    </div>
  );
}
