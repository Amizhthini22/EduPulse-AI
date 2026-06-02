import React, { useState } from 'react';
import { LanguageProvider } from './LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import OnboardingBanner from './components/OnboardingBanner';
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
            onUploadSuccess={() => setActiveTab('dashboard')}
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
    <LanguageProvider>
      {/* Skip-to-content link for keyboard and screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main id="main-content" className="flex-grow py-2 sm:py-6" tabIndex={-1}>
          <OnboardingBanner />
          <ErrorBoundary key={activeTab}>
            {renderContent()}
          </ErrorBoundary>
        </main>

        <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500 font-semibold bg-slate-900/40">
          <p>© 2026 EduPulse AI — Open-source · No external AI costs · Works offline</p>
        </footer>

        {/* Offline connectivity banner */}
        <OfflineBanner />
      </div>
    </LanguageProvider>
  );
}
