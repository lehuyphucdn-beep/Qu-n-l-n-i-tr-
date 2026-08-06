import React, { useState } from 'react';
import {
  LogIn,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  Search,
  CheckCircle2,
  Users,
  X,
  KeyRound,
} from 'lucide-react';
import { User } from '../../types';
import { BOPSStore } from '../../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'teacher' | 'manager'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [password, setPassword] = useState('123456');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.teacherCode && u.teacherCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = users.find((u) => u.id === selectedUserId);
    if (!userToLogin) return;

    BOPSStore.setCurrentUser(userToLogin.id);
    setLoginSuccessMessage(`Đã đăng nhập thành công tài khoản: ${userToLogin.fullName} (${userToLogin.role === 'manager' ? 'Quản lý' : userToLogin.teacherCode})`);

    setTimeout(() => {
      setLoginSuccessMessage(null);
      onClose();
    }, 1000);
  };

  const handleQuickSelect = (u: User) => {
    setSelectedUserId(u.id);
  };

  const selectedUserObj = users.find((u) => u.id === selectedUserId) || currentUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <LogIn className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Đăng Nhập Tài Khoản Giáo Viên Quản Nhiệm & Quản Lý
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hệ thống Quản trị Nội trú • Vận hành & Đánh giá Hiệu suất GVQN
            </p>
          </div>
        </div>

        {loginSuccessMessage && (
          <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{loginSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4 text-xs">
          {/* Active User Preview / Credentials form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tài khoản Đã Chọn
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <img
                  src={selectedUserObj.avatar}
                  alt={selectedUserObj.fullName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {selectedUserObj.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {selectedUserObj.role === 'manager'
                      ? 'Tài khoản Quản lý'
                      : `${selectedUserObj.teacherCode} • ${selectedUserObj.position}`}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mật Khẩu Xác Thực
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Account Filter & Search */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter('all')}
                  className={`rounded-lg px-3 py-1 font-bold text-[11px] transition ${
                    selectedRoleFilter === 'all'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Tất cả ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter('teacher')}
                  className={`rounded-lg px-3 py-1 font-bold text-[11px] transition ${
                    selectedRoleFilter === 'teacher'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Giáo viên ({users.filter((u) => u.role === 'teacher').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter('manager')}
                  className={`rounded-lg px-3 py-1 font-bold text-[11px] transition ${
                    selectedRoleFilter === 'manager'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Quản lý
                </button>
              </div>

              {/* Search input */}
              <div className="relative sm:w-56">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm GVQN theo tên, mã..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Account Grid */}
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/80 space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-400">Không tìm thấy tài khoản phù hợp</div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleQuickSelect(u)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.fullName} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {u.role === 'manager' ? (
                              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                QUẢN LÝ
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                  {u.teacherCode}
                                </span>
                                {u.username && (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-mono">
                                    @{u.username}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {u.position} • Mật khẩu: <span className="font-semibold text-slate-600 dark:text-slate-300">{u.password || u.fullName}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              * Tên đăng nhập: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">Tên viết tắt</span> • Mật khẩu: <span className="font-bold text-slate-600 dark:text-slate-300">Tên đầy đủ</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng Nhập Tài Khoản</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
