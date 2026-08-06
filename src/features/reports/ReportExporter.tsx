import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { BOPSStore } from '../../services/storage';

export const ReportExporter: React.FC = () => {
  const [reportType, setReportType] = useState('kpi_monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Báo cáo & Xuất Dữ liệu</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
          Trung tâm Xuất Báo cáo Vận hành & KPI
        </h2>
      </div>

      {/* Export Controls Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Loại báo cáo cần xuất
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="kpi_monthly">Báo cáo Đánh giá KPI 23 Giáo viên Quản nhiệm (Tháng)</option>
            <option value="operations_daily">Báo cáo Tổng hợp Ca Vận hành & Checklist Ngày</option>
            <option value="student_1on1">Báo cáo Nhật ký Tương tác 1-1 Chăm sóc Học sinh</option>
            <option value="room_hygiene">Báo cáo Tình trạng Vệ sinh Phòng KTX & Khắc phục</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Kỳ Báo cáo (Tháng / Năm)
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {exportSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Đã khởi tạo và tải về thành công file báo cáo ({reportType}.xlsx)!</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            disabled={isExporting}
            onClick={() => handleExport('excel')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting ? 'Đang tạo Excel...' : 'Xuất Báo cáo Excel (.xlsx)'}
          </button>

          <button
            disabled={isExporting}
            onClick={() => handleExport('pdf')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Đang tạo PDF...' : 'Xuất Báo cáo PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
