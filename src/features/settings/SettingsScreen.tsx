import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Award,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { BOPSStore } from '../../services/storage';

export const SettingsScreen: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu hệ thống về trạng thái ban đầu không?')) {
      BOPSStore.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Settings className="h-4 w-4" />
          <span>System Settings</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
          Cấu hình Quy định Vận hành & Trọng số KPI
        </h2>
      </div>

      <div className="max-w-3xl space-y-6 text-xs">
        {/* Shift Time Window Config */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Khung giờ Các Ca trực Nội trú
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Ca Sáng (Morning)</span>
              <span className="text-slate-500">06:00 - 11:30</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Ca Trưa (Lunch)</span>
              <span className="text-slate-500">11:30 - 14:00</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Ca Chiều (Afternoon)</span>
              <span className="text-slate-500 font-semibold text-blue-600 dark:text-blue-400">16:00 - 18:45</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-800">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Ca Tối (Evening)</span>
              <span className="text-slate-500 font-semibold text-blue-600 dark:text-blue-400">19:15 - 22:30</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl dark:bg-slate-800 col-span-2">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Ca Đêm (Night Shift)</span>
              <span className="text-slate-500">22:30 - 06:00 (Hôm sau) • Được miễn ca sáng/trưa hôm sau</span>
            </div>
          </div>
        </div>

        {/* KPI Weighting Config */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            Cấu hình Trọng số KPI (Tổng 100%)
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span>A. Vận hành cốt lõi (Core Operation)</span>
              <span className="font-bold text-blue-600">50%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span>B. Chất lượng & Nền nếp (Quality)</span>
              <span className="font-bold text-emerald-600">20%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span>C. Chăm sóc Học sinh 1-1 (Student Care)</span>
              <span className="font-bold text-purple-600">15%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span>D. Đóng góp & Trực thay (Contribution)</span>
              <span className="font-bold text-indigo-600">10%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span>E. Chấp hành Kỷ luật (Discipline)</span>
              <span className="font-bold text-rose-600">5%</span>
            </div>
          </div>
        </div>

        {/* System Reset */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-950 dark:bg-slate-900 space-y-3">
          <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">
            Khôi phục Dữ liệu Mẫu Ban đầu
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Khôi phục toàn bộ danh sách 23 giáo viên, danh sách học sinh ưu tiên, phòng KTX và các nhiệm vụ checklist về trạng thái mặc định.
          </p>
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white shadow hover:bg-rose-700"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục Dữ liệu Ban đầu
          </button>
        </div>
      </div>
    </div>
  );
};
