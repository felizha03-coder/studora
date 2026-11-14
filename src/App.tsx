import React from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { AppShell } from './components/layout/AppShell';
import { SkeletonBlock } from './components/ui/NeoComponents';
import { ToastProvider } from './components/ui/ToastProvider';
import { StudoraProvider, useStudora } from './context/StudoraContext';
import { AcademicPage } from './pages/AcademicPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CodingLabPage } from './pages/CodingLabPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { NotesPage } from './pages/NotesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { SchedulePage } from './pages/SchedulePage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskManagerPage } from './pages/TaskManagerPage';

const StudoraRouter: React.FC = () => {
  const { session, workspace, loading, activePage } = useStudora();

  if (!session) {
    return <AuthScreen />;
  }

  if (loading || !workspace) {
    return (
      <div className="min-h-screen bg-studora-canvas p-6 space-y-4 max-w-6xl mx-auto">
        <SkeletonBlock className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonBlock className="h-44" />
          <SkeletonBlock className="h-44" />
          <SkeletonBlock className="h-44" />
        </div>
        <SkeletonBlock className="h-80 w-full" />
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'academic':
        return <AcademicPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'tasks':
        return <TaskManagerPage />;
      case 'coding':
        return <CodingLabPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'finance':
        return <FinancePage />;
      case 'notes':
        return <NotesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
};

export function App() {
  return (
    <ToastProvider>
      <StudoraProvider>
        <StudoraRouter />
      </StudoraProvider>
    </ToastProvider>
  );
}

export default App;
