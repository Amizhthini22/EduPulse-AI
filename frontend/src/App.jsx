import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ClassroomInsights from './components/ClassroomInsights';
import SmartGroups from './components/SmartGroups';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import AssessmentUpload from './components/AssessmentUpload';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Router dispatcher
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedStudentId={setSelectedStudentId} 
          />
        );
      case 'insights':
        return <ClassroomInsights />;
      case 'smart-groups':
        return <SmartGroups />;
      case 'students':
        return (
          <StudentList 
            onSelectStudent={(id) => {
              setSelectedStudentId(id);
              setActiveTab('student-detail');
            }} 
          />
        );
      case 'upload':
        return (
          <AssessmentUpload 
            onUploadSuccess={() => {
              setActiveTab('dashboard');
            }} 
          />
        );
      case 'student-detail':
        return (
          <StudentDetail 
            studentId={selectedStudentId} 
            onBack={() => setActiveTab('students')} 
          />
        );
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedStudentId={setSelectedStudentId} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Panel Content */}
      <main className="flex-grow py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 font-semibold bg-slate-900/40">
        <p>© 2026 EduPulse AI. Powered by FastAPI & React. Designed for Hackathon Demonstration.</p>
      </footer>
    </div>
  );
}
