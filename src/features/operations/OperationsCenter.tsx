import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  MessageSquareHeart,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  XCircle,
  FileText,
  UserCheck,
  Zap,
  ShieldCheck,
  Calendar,
  Filter,
  Check,
  RotateCcw,
  Search,
  X,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { BOPSStore, subscribeToStore } from '../../services/storage';
import { Room, Student, TaskInstance, User, KPIRecord } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { VietnamDatePicker } from '../../components/common/VietnamDatePicker';
import {
  WorkEvaluationModal,
  WorkEvaluationItem,
} from '../../components/common/WorkEvaluationModal';

interface OperationsCenterProps {
  setActiveModule: (mod: string) => void;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({ setActiveModule }) => {
  const [currentUser, setCurrentUser] = useState<User>(BOPSStore.getCurrentUser());
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [kpis, setKPIs] = useState<KPIRecord[]>([]);

  // Search & Verification filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [verificationSuccessToast, setVerificationSuccessToast] = useState<string | null>(null);

  // Batch Approval State (Duyệt hàng loạt)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchRejectModalOpen, setIsBatchRejectModalOpen] = useState(false);
  const [batchCriteriaKey, setBatchCriteriaKey] = useState<'operation' | 'quality' | 'studentCare' | 'discipline'>('operation');
  const [batchCriteriaLabel, setBatchCriteriaLabel] = useState<string>('Vận hành ca trực & Điểm danh KTX');
  const [batchDeductedPoints, setBatchDeductedPoints] = useState<number>(2);
  const [batchReason, setBatchReason] = useState<string>('Chưa đạt chất lượng ca trực, vi phạm quy trình bàn giao');

  // Work Evaluation Modal state
  const [evaluationItem, setEvaluationItem] = useState<WorkEvaluationItem | null>(null);

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllDutyTasks = (availableTasks: TaskInstance[]) => {
    const ids = availableTasks.map((t) => t.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedTaskIds.includes(id));
    if (allSelected) {
      setSelectedTaskIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleBatchApprove = () => {
    if (selectedTaskIds.length === 0) return;

    selectedTaskIds.forEach((id) => {
      BOPSStore.evaluateWorkItem({
        itemType: 'task',
        itemId: id,
        managerName: currentUser.fullName,
        evaluation: 'approved',
        reason: 'Quản lý phê duyệt hàng loạt: Hoàn thành Đạt tiêu chuẩn',
      });
    });

    const count = selectedTaskIds.length;
    setSelectedTaskIds([]);
    setVerificationSuccessToast(`ĐÃ DUYỆT HÀNG LOẠT THÀNH CÔNG ${count} nhiệm vụ ca trực!`);
    setTimeout(() => setVerificationSuccessToast(null), 4000);
  };

  const handleBatchRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskIds.length === 0) return;

    selectedTaskIds.forEach((id) => {
      BOPSStore.evaluateWorkItem({
        itemType: 'task',
        itemId: id,
        managerName: currentUser.fullName,
        evaluation: 'rejected',
        criteriaKey: batchCriteriaKey,
        criteriaLabel: batchCriteriaLabel,
        deductedPoints: batchDeductedPoints,
        reason: batchReason,
      });
    });

    const count = selectedTaskIds.length;
    setSelectedTaskIds([]);
    setIsBatchRejectModalOpen(false);
    setVerificationSuccessToast(
      `ĐÃ ĐÁNH GIÁ CHƯA TỐT HÀNG LOẠT cho ${count} nhiệm vụ! (-${batchDeductedPoints} điểm KPI)`
    );
    setTimeout(() => setVerificationSuccessToast(null), 4000);
  };

  const handleOpenEvaluationModal = (t: TaskInstance) => {
    setEvaluationItem({
      itemType: 'task',
      id: t.id,
      title: t.title || t.taskName,
      teacherId: t.teacherId,
      teacherName: t.teacherName,
      date: t.date,
      shift: t.shift,
      completionNote: t.note,
      proofPhotos: t.proofPhotos,
      status: t.status,
      verified: t.verified,
      evaluationCriteria: t.evaluationCriteria,
      deductedPoints: t.deductedPoints,
      evaluationNote: t.note,
    });
  };

  const handleExecuteEvaluation = (evalData: {
    itemType: 'task' | 'schedule';
    itemId: string;
    evaluation: 'approved' | 'rejected';
    criteriaKey?: 'operation' | 'quality' | 'studentCare' | 'discipline';
    criteriaLabel?: string;
    deductedPoints?: number;
    reason?: string;
  }) => {
    BOPSStore.evaluateWorkItem({
      itemType: evalData.itemType,
      itemId: evalData.itemId,
      managerName: currentUser.fullName,
      evaluation: evalData.evaluation,
      criteriaKey: evalData.criteriaKey,
      criteriaLabel: evalData.criteriaLabel,
      deductedPoints: evalData.deductedPoints,
      reason: evalData.reason,
    });

    const label = evalData.evaluation === 'approved' ? 'HOÀN THÀNH (ĐẠT)' : `CHƯA TỐT (-${evalData.deductedPoints}đ KPI)`;
    setVerificationSuccessToast(`Đã lưu kết quả đánh giá: ${label}`);
    setTimeout(() => setVerificationSuccessToast(null), 4000);
  };

  useEffect(() => {
    const loadData = () => {
      setCurrentUser(BOPSStore.getCurrentUser());
      setUsers(BOPSStore.getUsers());
      setTasks(BOPSStore.getTasks());
      setRooms(BOPSStore.getRooms());
      setStudents(BOPSStore.getStudents());
      setKPIs(BOPSStore.getKPIs());
    };

    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return unsubscribe;
  }, []);

  const teachers = users.filter((u) => u.role === 'teacher');
  const teachersWorking = teachers.filter((t) => t.status === 'active').length;

  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
  const lateTasks = tasks.filter((t) => t.status === 'late');
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'working');

  const criticalRooms = rooms.filter((r) => r.hygieneStatus === 'critical' || r.hygieneStatus === 'needs_correction');
  const specialStudents = students.filter((s) => s.specialCare);

  const topKPIs = [...kpis].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

  // Filter tasks for Manager Duty Verification
  const filteredDutyTasks = tasks.filter((t) => {
    const matchesDate = !selectedDate || t.date === selectedDate;
    const matchesShift = selectedShiftFilter === 'all' || t.shift === selectedShiftFilter;
    const matchesTeacher = selectedTeacherFilter === 'all' || t.teacherId === selectedTeacherFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDate && matchesShift && matchesTeacher && matchesSearch;
  });

  // Filter tasks for Live Monitored Tasks
  const monitoredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const sq = searchQuery.toLowerCase();
    return (
      task.taskName.toLowerCase().includes(sq) ||
      task.teacherName.toLowerCase().includes(sq) ||
      task.teacherId.toLowerCase().includes(sq) ||
      (task.note && task.note.toLowerCase().includes(sq)) ||
      (task.title && task.title.toLowerCase().includes(sq))
    );
  });

  const handleMarkTaskAchieved = (taskId: string, taskName: string, teacherName: string) => {
    BOPSStore.updateTaskStatus(
      taskId,
      'verified',
      `Quản lý (${currentUser.fullName}) đã đánh dấu ĐẠT công việc cho ${teacherName}`
    );
    setVerificationSuccessToast(`Đã đánh dấu ĐẠT công việc "${taskName}" của GV ${teacherName}`);
    setTimeout(() => setVerificationSuccessToast(null), 3000);
  };

  const handleMarkTaskUnsatisfactory = (taskId: string, taskName: string, teacherName: string) => {
    BOPSStore.updateTaskStatus(
      taskId,
      'rejected',
      `Quản lý (${currentUser.fullName}) đã đánh giá CHƯA ĐẠT cho công việc của ${teacherName}`
    );
    setVerificationSuccessToast(`Đã đánh dấu CHƯA ĐẠT công việc "${taskName}" của GV ${teacherName}`);
    setTimeout(() => setVerificationSuccessToast(null), 3000);
  };

  const handleMarkTaskNeedsImprovement = (taskId: string, taskName: string, teacherName: string) => {
    BOPSStore.updateTaskStatus(
      taskId,
      'working',
      `Quản lý (${currentUser.fullName}) yêu cầu GV ${teacherName} LÀM LẠI nhiệm vụ`
    );
    setVerificationSuccessToast(`Đã ghi nhận YÊU CẦU LÀM LẠI công việc "${taskName}" của GV ${teacherName}`);
    setTimeout(() => setVerificationSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header: Operations Command Pulse */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Activity className="h-4 w-4" />
            <span>Operations Center • Live Control</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Trung tâm Giám sát Vận hành & Đánh giá Nhiệm vụ Ca trực
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('schedule')}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Quản lý Lịch trực
          </button>
          <button
            onClick={() => setActiveModule('reports')}
            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            Xuất Báo cáo Vận hành
          </button>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhanh công việc, tên GVQN, mã GV, nội dung báo cáo, ca trực..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              title="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2 flex items-center gap-1.5 shrink-0">
            <span>Đang tìm kiếm: "{searchQuery}"</span>
            <button
              onClick={() => setSearchQuery('')}
              className="underline text-slate-500 hover:text-slate-700 text-[11px]"
            >
              Đặt lại
            </button>
          </div>
        )}
      </div>

      {/* MANAGER VERIFICATION SECTION */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
          <ShieldCheck className="h-96 w-96 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/30 backdrop-blur border border-blue-400/30 text-blue-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    Kiểm Duyệt & Đánh Dấu Đạt Nhiệm Vụ Ca Trực Từng Ngày
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    {currentUser.role === 'manager' ? 'Quyền Quản Lý Activated' : 'Chế độ Giám sát'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Dành cho Quản lý / BGH: Chọn ngày và lịch trực để đánh dấu công việc đã đạt chuẩn chuyên môn của GVQN.
                </p>
              </div>
            </div>

            {verificationSuccessToast && (
              <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-2.5 text-xs font-bold text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{verificationSuccessToast}</span>
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 backdrop-blur p-3 rounded-2xl border border-white/10 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                Ngày Trực
              </label>
              <VietnamDatePicker
                value={selectedDate}
                onChange={(dateStr) => setSelectedDate(dateStr)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                Ca Trực
              </label>
              <select
                value={selectedShiftFilter}
                onChange={(e) => setSelectedShiftFilter(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2 font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">Tất cả các ca trực trong ngày</option>
                <option value="morning">Ca Sáng (06:00 - 07:30)</option>
                <option value="lunch">Ca Trưa (11:00 - 12:15)</option>
                <option value="afternoon">Ca Chiều (16:00 - 18:45)</option>
                <option value="evening">Ca Tối (19:15 - 22:30)</option>
                <option value="night">Ca Đêm (22:30 - 06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                Giáo Viên Quản Nhiệm
              </label>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2 font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">Tất cả GVQN ({teachers.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.teacherCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Batch Action Toolbar */}
          {selectedTaskIds.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-950/90 border border-blue-400/50 p-3.5 rounded-2xl backdrop-blur shadow-xl text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500 font-black text-xs shadow-inner">
                  {selectedTaskIds.length}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">Đang chọn {selectedTaskIds.length} nhiệm vụ ca trực</div>
                  <div className="text-[10px] text-blue-200">Bấm nút bên phải để áp dụng phê duyệt hoặc trừ điểm KPI đồng loạt</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBatchApprove}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-extrabold shadow-md transition"
                  title="Duyệt tất cả nhiệm vụ đã chọn là Hoàn thành / Đạt"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Duyệt Hàng Loạt: ĐẠT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBatchRejectModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-extrabold shadow-md transition"
                  title="Đánh giá tất cả nhiệm vụ đã chọn là Chưa Tốt và trừ điểm KPI"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Duyệt Hàng Loạt: CHƯA TỐT (-KPI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTaskIds([])}
                  className="rounded-xl border border-white/20 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
          )}

          {/* Verification Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectAllDutyTasks(filteredDutyTasks)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
                      title="Chọn tất cả / Bỏ chọn tất cả"
                    >
                      {filteredDutyTasks.length > 0 &&
                      filteredDutyTasks.every((t) => selectedTaskIds.includes(t.id)) ? (
                        <CheckSquare className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Giáo Viên Phụ Trách</th>
                  <th className="p-3">Ca Trực & Giờ</th>
                  <th className="p-3">Nhiệm Vụ Ca Trực</th>
                  <th className="p-3">Trạng Thái Đánh Giá</th>
                  <th className="p-3 text-right">Thao Tác Quản Lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDutyTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      Không có task ca trực phù hợp với bộ lọc ngày/ca/giáo viên.
                    </td>
                  </tr>
                ) : (
                  filteredDutyTasks.map((t) => {
                    const isVerified = t.status === 'verified';
                    const isRejected = t.status === 'rejected';
                    const isCompleted = t.status === 'completed';
                    const isSelected = selectedTaskIds.includes(t.id);

                    return (
                      <tr
                        key={t.id}
                        className={`transition ${
                          isSelected ? 'bg-blue-900/30 border-l-2 border-l-blue-400' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectTask(t.id)}
                            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
                            title="Chọn nhiệm vụ này để duyệt hàng loạt"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-blue-400" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-500" />
                            )}
                          </button>
                        </td>

                        <td className="p-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                            <div>
                              <div className="font-bold text-white">{t.teacherName}</div>
                              <div className="text-[10px] text-slate-400">Mã GV: {t.teacherId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-blue-300 uppercase">
                            {t.shift === 'morning'
                              ? 'Ca Sáng'
                              : t.shift === 'lunch'
                              ? 'Ca Trưa'
                              : t.shift === 'afternoon'
                              ? 'Ca Chiều'
                              : t.shift === 'evening'
                              ? 'Ca Tối'
                              : 'Ca Đêm'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t.plannedStart} - {t.plannedEnd}
                          </div>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-white">{t.taskName}</div>
                          {t.note && (
                            <div className="mt-0.5 text-[10px] text-amber-200 bg-amber-900/30 px-2 py-0.5 rounded w-fit">
                              Ghi chú: {t.note}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-extrabold text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Đã Đạt
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-extrabold text-rose-300 border border-rose-500/30">
                              <XCircle className="h-3.5 w-3.5 text-rose-400" />
                              Chưa Đạt
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-extrabold text-blue-300 border border-blue-500/30">
                              <Check className="h-3.5 w-3.5" />
                              GV Đã Báo Hoàn Thành
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                              <Clock className="h-3.5 w-3.5" />
                              Đang Thực Hiện
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEvaluationModal(t)}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 font-bold text-xs shadow-sm transition"
                              title="Xem chi tiết & Duyệt đánh giá (Hoàn thành / Chưa tốt)"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Duyệt / Đánh giá</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkTaskAchieved(t.id, t.taskName, t.teacherName)}
                              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-bold transition text-xs shadow-sm ${
                                isVerified
                                  ? 'bg-emerald-600/50 text-emerald-200 cursor-default ring-1 ring-emerald-400'
                                  : 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                              }`}
                              title="Nhanh: Đánh dấu công việc Đạt"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{isVerified ? 'Đã Đạt' : 'Đạt'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkTaskUnsatisfactory(t.id, t.taskName, t.teacherName)}
                              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-bold transition text-xs shadow-sm ${
                                isRejected
                                  ? 'bg-rose-600/50 text-rose-200 cursor-default ring-1 ring-rose-400'
                                  : 'bg-rose-600/80 hover:bg-rose-500 text-white'
                              }`}
                              title="Nhanh: Đánh dấu CHƯA ĐẠT"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{isRejected ? 'Chưa Đạt' : 'Chưa Đạt'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Giáo viên Đang làm việc"
          value={`${teachersWorking} / ${teachers.length}`}
          subText="100% đúng ca trực hôm nay"
          icon={Users}
          color="blue"
          badgeText="Active"
        />

        <StatCard
          title="Tiến độ Task Vận hành"
          value={`${completedTasks} / ${tasks.length}`}
          subText={`${lateTasks.length} task muộn giờ`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Phòng Cần Kiện toàn Vệ sinh"
          value={criticalRooms.length}
          subText="Yêu cầu khắc phục trong ca"
          icon={AlertTriangle}
          color={criticalRooms.length > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Học sinh Ưu tiên Chăm sóc"
          value={specialStudents.length}
          subText="Tâm lý, sức khỏe, học tập"
          icon={MessageSquareHeart}
          color="purple"
        />
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Shift Monitor & Critical Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Hygiene Rooms Alert Section */}
          <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-950 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cảnh báo Vệ sinh Phòng KTX ({criticalRooms.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phòng có trạng thái "Chưa đạt" hoặc "Kiện toàn gấp" trong ca sáng/trưa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModule('rooms')}
                className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
              >
                Xem tất cả phòng
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {criticalRooms.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tất cả các phòng KTX đều đạt tiêu chuẩn vệ sinh hôm nay.
                </div>
              ) : (
                criticalRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {room.roomName} ({room.building} - Tầng {room.floor})
                        </span>
                        <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                          {room.hygieneStatus === 'critical' ? 'Kiện toàn gấp' : 'Cần sửa'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {room.correctionNote || 'Chưa đạt vệ sinh gấp chăn gối.'}
                      </p>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Phụ trách: <strong>{room.teacherName}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        BOPSStore.updateRoomHygiene(room.id, 'clean', 'pass', 'Đã kiện toàn vệ sinh.')
                      }
                      className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                    >
                      Đánh dấu Đã đạt
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Monitored Task Progress */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Giám sát Tiến độ Task trong Ngày ({monitoredTasks.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bấm trực tiếp vào từng task để xem chi tiết báo cáo, ảnh minh chứng & thực hiện duyệt / đánh giá
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl w-fit">
                {pendingTasks.length} task đang chờ / làm
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
              {monitoredTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl dark:bg-slate-800/40">
                  {searchQuery
                    ? `Không tìm thấy task nào khớp với từ khóa "${searchQuery}".`
                    : 'Chưa có task vận hành nào trong ngày.'}
                </div>
              ) : (
                monitoredTasks.map((task) => {
                  const isVerified = task.status === 'verified';
                  const isRejected = task.status === 'rejected';
                  const isCompleted = task.status === 'completed';
                  const isWorking = task.status === 'working';
                  const isLate = task.status === 'late';
                  const isSelected = selectedTaskIds.includes(task.id);

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleOpenEvaluationModal(task)}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 text-xs cursor-pointer transition shadow-sm ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 bg-slate-50/80 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectTask(task.id);
                          }}
                          className="mt-0.5 p-0.5 text-slate-400 hover:text-blue-600 transition shrink-0"
                          title="Chọn task để duyệt hàng loạt"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition">
                              {task.taskName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              Ca {task.shift.toUpperCase()} ({task.plannedStart} - {task.plannedEnd})
                            </span>
                            {task.proofPhotos && task.proofPhotos.length > 0 && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                📸 Có {task.proofPhotos.length} ảnh minh chứng
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                            <span>
                              Phụ trách: <strong className="text-slate-800 dark:text-slate-100">{task.teacherName}</strong> ({task.teacherId})
                            </span>
                            <span>• Ngày: <strong>{task.date}</strong></span>
                          </div>

                          {task.note && (
                            <div className="text-[11px] text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                              <strong>Báo cáo GVQN:</strong> "{task.note}"
                            </div>
                          )}

                          {task.evaluationCriteria && (
                            <div
                              className={`text-[11px] p-2 rounded-xl font-medium ${
                                isRejected
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              }`}
                            >
                              <strong>Quản lý đánh giá:</strong> {isVerified ? 'ĐÃ ĐẠT' : `CHƯA TỐT (-${task.deductedPoints || 2}đ KPI)`} - Tiêu chí: {task.evaluationCriteria}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center" onClick={(e) => e.stopPropagation()}>
                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                              : isCompleted
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                              : isWorking
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                              : isLate
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>ĐÃ DUYỆT ĐẠT</span>
                            </>
                          ) : isRejected ? (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>CHƯA TỐT</span>
                            </>
                          ) : isCompleted ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-blue-600" />
                              <span>GV BÁO HOÀN THÀNH</span>
                            </>
                          ) : (
                            <span>{task.status.toUpperCase()}</span>
                          )}
                        </span>

                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => handleOpenEvaluationModal(task)}
                          className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 font-bold text-xs shadow-sm transition"
                          title="Bấm để xem chi tiết báo cáo, ảnh minh chứng & duyệt đánh giá"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Chi tiết & Duyệt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkTaskAchieved(task.id, task.taskName, task.teacherName)}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 font-bold text-xs shadow-sm transition"
                          title="Nhanh: Đánh dấu Đạt"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Đạt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkTaskUnsatisfactory(task.id, task.taskName, task.teacherName)}
                          className="flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 font-bold text-xs shadow-sm transition"
                          title="Nhanh: Đánh dấu Chưa Đạt"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Chưa Đạt</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Top KPI Ranking & Special Student Radar */}
        <div className="space-y-6">
          {/* Top 5 KPI Ranking */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Top KPI Hôm nay
              </h3>
              <button
                onClick={() => setActiveModule('kpi')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Xem tất cả
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {topKPIs.map((kpi, idx) => (
                <div
                  key={kpi.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 font-extrabold text-[10px] text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{kpi.teacherName}</div>
                      <div className="text-[10px] text-slate-400">Workload Index: {kpi.workloadIndex}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-blue-600">{kpi.totalScore} Đ</div>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Hạng {kpi.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Student Care Alert Card */}
          <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm dark:border-purple-950 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <MessageSquareHeart className="h-4 w-4 text-purple-600" />
              Học sinh Cần Theo dõi Tâm lý / Sức khỏe
            </h3>

            <div className="mt-3 space-y-2">
              {specialStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-xl border border-purple-100 bg-white p-3 text-xs dark:border-purple-900 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{student.fullName} ({student.className})</span>
                    <span className="text-[10px] text-purple-600">{student.roomName}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{student.note}</p>
                  <div className="mt-2 text-[10px] font-semibold text-slate-400">
                    GV phụ trách: {student.teacherName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work Evaluation Modal */}
      <WorkEvaluationModal
        isOpen={!!evaluationItem}
        onClose={() => setEvaluationItem(null)}
        item={evaluationItem}
        onEvaluate={handleExecuteEvaluation}
      />

      {/* Batch Rejection Modal (Duyệt hàng loạt Chưa Tốt & Trừ điểm KPI) */}
      <Modal
        isOpen={isBatchRejectModalOpen}
        onClose={() => setIsBatchRejectModalOpen(false)}
        title={`Duyệt Hàng Loạt: Đánh Giá CHƯA TỐT cho ${selectedTaskIds.length} Nhiệm vụ`}
      >
        <form onSubmit={handleBatchRejectSubmit} className="space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3.5 rounded-2xl text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-rose-900 dark:text-rose-200 text-sm">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Cảnh báo đánh giá hàng loạt:</span>
            </div>
            <p>
              Bạn đang chuẩn bị đánh dấu <strong>CHƯA TỐT</strong> cho <strong>{selectedTaskIds.length}</strong> nhiệm vụ ca trực được chọn. Hệ thống sẽ lập tức cập nhật trạng thái, trừ điểm KPI và gửi thông báo tới các GVQN liên quan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nhóm Tiêu chí Vi phạm / Chưa đạt:
            </label>
            <select
              value={batchCriteriaKey}
              onChange={(e) => {
                const key = e.target.value as any;
                setBatchCriteriaKey(key);
                if (key === 'operation') setBatchCriteriaLabel('Vận hành ca trực & Điểm danh KTX');
                if (key === 'quality') setBatchCriteriaLabel('Chất lượng thực thi nhiệm vụ ca trực');
                if (key === 'studentCare') setBatchCriteriaLabel('Chăm sóc & Quản lý học sinh');
                if (key === 'discipline') setBatchCriteriaLabel('Kỷ luật & Báo cáo bàn giao ca');
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="operation">1. Vận hành ca trực & Điểm danh KTX</option>
              <option value="quality">2. Chất lượng thực thi nhiệm vụ ca trực</option>
              <option value="studentCare">3. Chăm sóc & Quản lý học sinh</option>
              <option value="discipline">4. Kỷ luật & Báo cáo bàn giao ca</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mức Trừ Điểm KPI Hàng Loạt:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setBatchDeductedPoints(pts)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    batchDeductedPoints === pts
                      ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  -{pts} Điểm
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung nhận xét & Lý do chưa đạt (Áp dụng chung):
            </label>
            <textarea
              required
              rows={3}
              value={batchReason}
              onChange={(e) => setBatchReason(e.target.value)}
              placeholder="Nhập chi tiết lý do chưa đạt để gửi thông báo cho các GVQN..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsBatchRejectModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition flex items-center gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              <span>Xác Nhận Đánh Giá CHƯA TỐT ({selectedTaskIds.length})</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
