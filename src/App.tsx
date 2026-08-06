import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TodayScreen } from './features/today/TodayScreen';
import { OperationsCenter } from './features/operations/OperationsCenter';
import { TeacherList } from './features/teachers/TeacherList';
import { StudentList } from './features/students/StudentList';
import { RoomList } from './features/rooms/RoomList';
import { ScheduleScreen } from './features/schedule/ScheduleScreen';
import { TaskCenter } from './features/tasks/TaskCenter';
import { InteractionCenter } from './features/interactions/InteractionCenter';
import { KPICenter } from './features/kpi/KPICenter';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ReportExporter } from './features/reports/ReportExporter';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { BOPSStore, subscribeToStore } from './services/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(BOPSStore.getCurrentUser());
  const [activeModule, setActiveModule] = useState<string>('today');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const u = BOPSStore.getCurrentUser();
      setCurrentUser(u);
      // If switched to teacher role and currently on operations module, switch back to today
      if (u.role === 'teacher' && activeModule === 'operations') {
        setActiveModule('today');
      }
    };

    const unsubscribe = subscribeToStore(handleUpdate);
    return unsubscribe;
  }, [activeModule]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeModule === 'today' && <TodayScreen setActiveModule={setActiveModule} />}
            {activeModule === 'operations' && <OperationsCenter setActiveModule={setActiveModule} />}
            {activeModule === 'teachers' && <TeacherList />}
            {activeModule === 'students' && <StudentList />}
            {activeModule === 'rooms' && <RoomList />}
            {activeModule === 'schedule' && <ScheduleScreen />}
            {activeModule === 'tasks' && <TaskCenter />}
            {activeModule === 'interactions' && <InteractionCenter />}
            {activeModule === 'kpi' && <KPICenter />}
            {activeModule === 'dashboard' && <DashboardScreen setActiveModule={setActiveModule} />}
            {activeModule === 'reports' && <ReportExporter />}
            {activeModule === 'settings' && <SettingsScreen />}
          </div>
        </main>
      </div>
    </div>
  );
}
