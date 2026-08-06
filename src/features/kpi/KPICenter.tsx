import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Layers,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { BOPSStore, subscribeToStore } from '../../services/storage';
import { KPIRecord, User } from '../../types';

export const KPICenter: React.FC = () => {
  const [kpis, setKPIs] = useState<KPIRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(BOPSStore.getCurrentUser());
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');

  useEffect(() => {
    const loadData = () => {
      setCurrentUser(BOPSStore.getCurrentUser());
      setKPIs(BOPSStore.getKPIs());
    };

    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return unsubscribe;
  }, []);

  const sortedKPIs = [...kpis].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Award className="h-4 w-4" />
            <span>KPI Engine • Automated Performance</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Đánh giá Hiệu suất KPI & Bảng Xếp hạng
          </h2>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { id: 'day', label: 'Ngày' },
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'quarter', label: 'Quý' },
            { id: 'year', label: 'Năm' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                timeframe === tf.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 5 Category Rules Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-slate-900">
          <div className="font-bold text-blue-900 dark:text-blue-300">A. Vận hành</div>
          <div className="text-lg font-black text-blue-700">50 Đ</div>
          <div className="text-[10px] text-slate-500 mt-1">Nhiệm vụ cốt lõi, điểm danh, kiểm tra</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-slate-900">
          <div className="font-bold text-emerald-900 dark:text-emerald-300">B. Chất lượng</div>
          <div className="text-lg font-black text-emerald-700">20 Đ</div>
          <div className="text-[10px] text-slate-500 mt-1">Đúng giờ, vệ sinh phòng, báo cáo</div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3.5 dark:border-purple-900/40 dark:bg-slate-900">
          <div className="font-bold text-purple-900 dark:text-purple-300">C. Chăm sóc HS</div>
          <div className="text-lg font-black text-purple-700">15 Đ</div>
          <div className="text-[10px] text-slate-500 mt-1">3-5 Tương tác 1-1 / tuần</div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-slate-900">
          <div className="font-bold text-indigo-900 dark:text-indigo-300">D. Đóng góp</div>
          <div className="text-lg font-black text-indigo-700">10 Đ</div>
          <div className="text-[10px] text-slate-500 mt-1">Sự kiện, trực thay, hỗ trợ bộ phận</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 dark:border-rose-900/40 dark:bg-slate-900">
          <div className="font-bold text-rose-900 dark:text-rose-300">E. Kỷ luật</div>
          <div className="text-lg font-black text-rose-700">5 Đ</div>
          <div className="text-[10px] text-slate-500 mt-1">Trừ điểm nếu đi muộn / bỏ checklist</div>
        </div>
      </div>

      {/* KPI Rankings Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-4">Hạng</th>
              <th className="p-4">Giáo viên</th>
              <th className="p-4">Vận hành (50)</th>
              <th className="p-4">Chất lượng (20)</th>
              <th className="p-4">Chăm sóc (15)</th>
              <th className="p-4">Đóng góp (10)</th>
              <th className="p-4">Kỷ luật (5)</th>
              <th className="p-4 text-center">Workload Index</th>
              <th className="p-4 text-right">Tổng Điểm KPI</th>
              <th className="p-4 text-center">Xếp loại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedKPIs.map((kpi, idx) => (
              <tr
                key={kpi.id}
                className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/50"
              >
                <td className="p-4 font-black text-slate-900 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {idx + 1}
                  </span>
                </td>

                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-white">{kpi.teacherName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{kpi.teacherCode}</div>
                </td>

                <td className="p-4 font-semibold text-blue-600">{kpi.operationScore}</td>
                <td className="p-4 font-semibold text-emerald-600">{kpi.qualityScore}</td>
                <td className="p-4 font-semibold text-purple-600">{kpi.studentCareScore}</td>
                <td className="p-4 font-semibold text-indigo-600">{kpi.contributionScore}</td>
                <td className="p-4 font-semibold text-rose-600">{kpi.disciplineScore}</td>

                <td className="p-4 text-center font-extrabold text-slate-700 dark:text-slate-200">
                  {kpi.workloadIndex}
                </td>

                <td className="p-4 text-right font-black text-base text-blue-600">
                  {kpi.totalScore} Đ
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      kpi.rank === 'A+'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                        : kpi.rank === 'A'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    Hạng {kpi.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
