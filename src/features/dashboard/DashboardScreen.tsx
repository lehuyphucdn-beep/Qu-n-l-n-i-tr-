import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Building2,
  MessageSquareHeart,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  UserX,
  ArrowRight,
  HeartPulse,
  AlertCircle,
  FileWarning,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BOPSStore, subscribeToStore } from '../../services/storage';
import { Student, KPIRecord, User } from '../../types';

interface DashboardScreenProps {
  setActiveModule?: (mod: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveModule }) => {
  const [tasks, setTasks] = useState(BOPSStore.getTasks());
  const [rooms, setRooms] = useState(BOPSStore.getRooms());
  const [kpis, setKPIs] = useState<KPIRecord[]>(BOPSStore.getKPIs());
  const [students, setStudents] = useState<Student[]>(BOPSStore.getStudents());
  const [users, setUsers] = useState<User[]>(BOPSStore.getUsers());

  useEffect(() => {
    const loadData = () => {
      setTasks(BOPSStore.getTasks());
      setRooms(BOPSStore.getRooms());
      setKPIs(BOPSStore.getKPIs());
      setStudents(BOPSStore.getStudents());
      setUsers(BOPSStore.getUsers());
    };

    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return unsubscribe;
  }, []);

  // Filter Special Care Students
  const specialCareStudents = students.filter((s) => s.specialCare);

  // Filter Low Performance / At-Risk Teachers (Score < 85 or rank 'Cần cải thiện')
  const lowPerformanceKPIs = kpis.filter(
    (k) => k.totalScore < 85 || k.rank.toLowerCase().includes('cần cải thiện') || k.rank.toLowerCase().includes('yếu')
  );

  // Data for Charts
  const shiftCompletionData = [
    { shift: 'Ca Sáng', completed: 96, late: 4 },
    { shift: 'Ca Trưa', completed: 92, late: 8 },
    { shift: 'Ca Chiều', completed: 98, late: 2 },
    { shift: 'Ca Tối', completed: 95, late: 5 },
    { shift: 'Ca Đêm', completed: 100, late: 0 },
  ];

  const kpiTrendData = [
    { week: 'T1', avgScore: 88 },
    { week: 'T2', avgScore: 91 },
    { week: 'T3', avgScore: 94 },
    { week: 'T4', avgScore: 96 },
  ];

  const hygienePieData = [
    { name: 'Phòng Sạch đạt chuẩn', value: rooms.filter((r) => r.hygieneStatus === 'pass').length, color: '#10b981' },
    { name: 'Phòng Cần nhắc nhở', value: rooms.filter((r) => r.hygieneStatus === 'needs_correction').length, color: '#f59e0b' },
    { name: 'Phòng Kiện toàn gấp', value: rooms.filter((r) => r.hygieneStatus === 'critical').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <BarChart3 className="h-4 w-4" />
            <span>Executive Dashboard • Realtime Analytics</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Báo cáo Phân tích Vận hành & Xu hướng Hiệu suất Nội trú
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl w-fit">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Kỳ Đánh Giá: Tháng 07/2026</span>
        </div>
      </div>

      {/* WARNING ALERTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ALERT 1: Special Care Students Warning */}
        <div className="rounded-3xl border border-purple-200 bg-purple-50/60 p-5 shadow-sm dark:border-purple-950 dark:bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-200/80 pb-3 dark:border-purple-900">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/30">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>Cảnh Báo Học Sinh Cần Quan Tâm Đặc Biệt</span>
                  <span className="rounded-full bg-purple-200 px-2 py-0.5 text-[11px] font-extrabold text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                    {specialCareStudents.length} HS
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Học sinh có vấn đề về sức khỏe, tâm lý hoặc sinh hoạt cần theo dõi sát
                </p>
              </div>
            </div>

            {setActiveModule && (
              <button
                onClick={() => setActiveModule('students')}
                className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline dark:text-purple-300"
              >
                <span>Xem danh sách</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {specialCareStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Hiện không có học sinh nào thuộc diện cảnh báo đặc biệt.
              </div>
            ) : (
              specialCareStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-purple-100 bg-white p-3.5 text-xs shadow-sm dark:border-purple-900/50 dark:bg-slate-800/90"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
                        {student.fullName}
                      </span>
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        {student.studentCode}
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {student.className} • Phòng {student.roomName}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-600 dark:text-slate-300 bg-purple-50/50 dark:bg-slate-900/50 p-2 rounded-xl text-[11px]">
                    <strong>Ghi chú theo dõi:</strong> {student.note || 'Cần chú ý diễn biến sức khỏe & tâm lý sinh hoạt ca tối.'}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>GVQN Phụ trách: <strong className="text-slate-700 dark:text-slate-300">{student.teacherName}</strong></span>
                    <span className="text-purple-600 font-bold">Trạng thái: Đang theo dõi sát</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ALERT 2: Low Performance / At-Risk Teachers Warning */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm dark:border-rose-950 dark:bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-3 dark:border-rose-900">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/30">
                <FileWarning className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>Cảnh Báo GVQN Hiệu Suất Đang Kém / Dưới Chuẩn</span>
                  <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[11px] font-extrabold text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                    {lowPerformanceKPIs.length} GV
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Giáo viên có tổng điểm KPI dưới 85 hoặc vi phạm tiến độ ca trực
                </p>
              </div>
            </div>

            {setActiveModule && (
              <button
                onClick={() => setActiveModule('kpi')}
                className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline dark:text-rose-300"
              >
                <span>Chi tiết KPI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {lowPerformanceKPIs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tất cả Giáo viên Quản nhiệm đều đạt hiệu suất chuẩn (≥85 điểm) trong kỳ này.
              </div>
            ) : (
              lowPerformanceKPIs.map((kpi) => {
                const teacherObj = users.find((u) => u.id === kpi.teacherId);
                return (
                  <div
                    key={kpi.id}
                    className="rounded-2xl border border-rose-200 bg-white p-3.5 text-xs shadow-sm dark:border-rose-900/50 dark:bg-slate-800/90"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                          {kpi.teacherName}
                        </span>
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {teacherObj?.teacherCode || 'GVQN'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-rose-600 text-sm">{kpi.totalScore} / 100 Đ</span>
                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {kpi.rank}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 bg-rose-50/60 dark:bg-slate-900/50 p-2 rounded-xl text-[11px] text-rose-900 dark:text-rose-300">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span>Chỉ số cốt lõi: Operational score {kpi.coreOperationalScore}/50, Penalty -{kpi.penaltyPoints}đ</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                        * Lý do cảnh báo: Bỏ sót/trễ checklist ca trực kiểm tra hành chính tối, cần nhắc nhở kỷ luật ca làm việc.
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Phân công: {teacherObj?.building || 'KTX'}</span>
                      <span className="text-rose-600 font-bold">Khuyến nghị: Nhắc nhở & Giám sát 1-1</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Shift Completion Rate */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Tỉ lệ Hoàn thành Task theo Ca trực (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftCompletionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="shift" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="completed" fill="#2563eb" radius={[6, 6, 0, 0]} name="Hoàn thành (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: KPI Score Trend */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Xu hướng Điểm KPI Trung bình (4 Tuần gần nhất)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={3} name="Điểm trung bình" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Room Hygiene Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
            Phân bổ Tình trạng Vệ sinh Phòng KTX
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hygienePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {hygienePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

