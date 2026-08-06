import React, { useState, useEffect } from 'react';
import {
  Bell,
  UserCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  X,
  Users,
  LogIn,
} from 'lucide-react';
import { BOPSStore, subscribeToStore } from '../../services/storage';
import { User } from '../../types';
import { LoginModal } from '../auth/LoginModal';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  toggleSidebar,
  onOpenMobileSidebar,
  activeModule,
  setActiveModule,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(BOPSStore.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(BOPSStore.getUsers());
  const [notifications, setNotifications] = useState(BOPSStore.getNotifications());
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(BOPSStore.getCurrentUser());
      setAllUsers(BOPSStore.getUsers());
      setNotifications(BOPSStore.getNotifications());
    });
    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.receiverId === currentUser.id || n.receiverId === currentUser.role || n.receiverId === 'all')
  ).length;

  const handleSelectUser = (user: User) => {
    BOPSStore.setCurrentUser(user.id);
    setShowRoleDropdown(false);
  };

  const currentDisplayTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currentDateFormatted = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Left: Mobile menu button & Current Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          title="Mở menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Hệ thống Quản trị Nội trú
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {currentDateFormatted} • {currentDisplayTime}
          </span>
        </div>
      </div>

      {/* Right: Login Button, Role Switcher, Notifications, Dark Mode */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Login / Account Switch Button */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          title="Đăng nhập tài khoản GVQN / Quản lý"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Đăng Nhập GVQN</span>
        </button>

        {/* Quick Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="h-6 w-6 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="text-left hidden md:block">
              <div className="font-semibold leading-tight text-slate-900 dark:text-white">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentUser.role === 'manager' ? ' Trưởng Bộ phận' : ` ${currentUser.teacherCode}`}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* User Switcher Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Chuyển tài khoản thử nghiệm</span>
                <Users className="h-3.5 w-3.5" />
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                <div className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Quản lý
                </div>
                {allUsers
                  .filter((u) => u.role === 'manager')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img src={u.avatar} alt={u.fullName} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">{u.position}</div>
                      </div>
                    </button>
                  ))}

                <div className="mt-2 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase">
                  Giáo viên Quản nhiệm (23)
                </div>
                {allUsers
                  .filter((u) => u.role === 'teacher')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img src={u.avatar} alt={u.fullName} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">
                          {u.fullName} <span className="text-[10px] font-normal text-slate-400">({u.teacherCode})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{u.position}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Thông báo"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Thông báo hệ thống</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {unreadCount} chưa đọc
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto py-2">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => BOPSStore.markNotificationRead(n.id)}
                      className={`mb-2 cursor-pointer rounded-xl p-2.5 text-xs transition ${
                        !n.read
                          ? 'bg-blue-50/80 dark:bg-blue-950/40'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-normal text-slate-400">{n.createdAt.split(' ')[1]}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 line-clamp-2">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title={darkMode ? 'Chuyển Chế độ Sáng' : 'Chuyển Chế độ Tối'}
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={allUsers}
        currentUser={currentUser}
      />
    </header>
  );
};
