import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TaskProvider, useTasks } from './context/TaskContext.jsx';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TaskDetailModal from './components/TaskDetailModal.jsx';
import CreateTaskModal from './components/CreateTaskModal.jsx';
import AIChatDrawer from './components/AIChatDrawer.jsx';
import TeamChatDrawer from './components/TeamChatDrawer.jsx';
import OnboardingTour from './components/OnboardingTour.jsx';

import MyDayPage from './pages/MyDayPage.jsx';
import ProjectBoardPage from './pages/ProjectBoardPage.jsx';
import ProjectStatusPage from './pages/ProjectStatusPage.jsx';
import ManagerDashboardPage from './pages/ManagerDashboardPage.jsx';
import PersonalHabitsPage from './pages/PersonalHabitsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function MainAppShell() {
  const { user } = useAuth();
  const { selectedTask, setSelectedTask } = useTasks();

  // Set default active tab based on user role (Managers default to 'manager' dashboard)
  const [activeTab, setActiveTab] = useState(() => {
    return user?.role === 'manager' ? 'manager' : 'myday';
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultProject, setCreateDefaultProject] = useState(null);
  const [createDefaultInMyDay, setCreateDefaultInMyDay] = useState(false);
  const [createInitialTitle, setCreateInitialTitle] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(() => {
    return !localStorage.getItem('synhub_tour_seen');
  });

  useEffect(() => {
    if (user?.role === 'manager') {
      setActiveTab('manager');
    } else if (user?.role === 'employee') {
      setActiveTab('myday');
    }
  }, [user?.id, user?.role]);

  if (!user) {
    return <LoginPage />;
  }

  const handleOpenCreateTask = (projectId = null, inMyDay = false, initialTitle = '') => {
    setCreateDefaultProject(projectId);
    setCreateDefaultInMyDay(inMyDay);
    setCreateInitialTitle(initialTitle);
    setIsCreateModalOpen(true);
  };

  const handleCloseTour = () => {
    localStorage.setItem('synhub_tour_seen', 'true');
    setIsTourOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navbar
        onOpenCreateTask={() => handleOpenCreateTask()}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenTeamChat={() => setIsTeamChatOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenTeamChat={() => setIsTeamChatOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask()}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'myday' && (
            <MyDayPage
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenCreateTask={handleOpenCreateTask}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
          )}

          {activeTab === 'personal-habits' && (
            <PersonalHabitsPage />
          )}

          {activeTab === 'board' && (
            <ProjectBoardPage
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenCreateTask={handleOpenCreateTask}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
          )}

          {activeTab === 'project-status' && (
            <ProjectStatusPage
              onSelectTask={(t) => setSelectedTask(t)}
            />
          )}

          {activeTab === 'manager' && (
            <ManagerDashboardPage
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          defaultProjectId={createDefaultProject}
          defaultInMyDay={createDefaultInMyDay}
          initialTitle={createInitialTitle}
          initialDescription={createInitialTitle}
        />
      )}

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />

      <TeamChatDrawer
        isOpen={isTeamChatOpen}
        onClose={() => setIsTeamChatOpen(false)}
        onOpenCreateTask={handleOpenCreateTask}
      />

      <OnboardingTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <MainAppShell />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
