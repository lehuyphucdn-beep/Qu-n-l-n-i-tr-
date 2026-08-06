import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  MessageSquareHeart,
  AlertTriangle,
  Building2,
  Phone,
  User,
  Calendar,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { BOPSStore, subscribeToStore } from '../../services/storage';
import { Student, Interaction1on1 } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [interactions, setInteractions] = useState<Interaction1on1[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialOnly, setFilterSpecialOnly] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add Student state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    BOPSStore.updateStudent(editingStudent);
    setEditingStudent(null);
    if (selectedStudent && selectedStudent.id === editingStudent.id) {
      setSelectedStudent(editingStudent);
    }
  };

  // Delete Student state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      BOPSStore.deleteStudent(studentToDelete.id);
      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }
      setStudentToDelete(null);
    }
  };
  const [newStudentData, setNewStudentData] = useState({
    fullName: '',
    studentCode: '',
    className: '10A1',
    roomName: 'A-201',
    building: 'Tòa A - Nam',
    gender: 'nam' as 'nam' | 'nu',
    parentPhone: '',
    specialCare: false,
    note: '',
  });

  useEffect(() => {
    const loadData = () => {
      setStudents(BOPSStore.getStudents());
      setInteractions(BOPSStore.getInteractions());
    };

    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return unsubscribe;
  }, []);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.fullName || !newStudentData.studentCode) return;

    BOPSStore.addStudent({
      fullName: newStudentData.fullName,
      studentCode: newStudentData.studentCode,
      birthday: '2008-05-15',
      className: newStudentData.className,
      roomId: 'rm-101',
      roomName: newStudentData.roomName,
      teacherId: 'usr-101',
      teacherName: 'Nguyễn Văn An',
      gender: newStudentData.gender,
      parentName: 'Phụ huynh HS',
      parentPhone: newStudentData.parentPhone || '0901 234 567',
      status: 'active',
      specialCare: newStudentData.specialCare,
      specialLabels: newStudentData.specialCare ? ['health_issue'] : [],
      note: newStudentData.note,
      interactionCountThisMonth: 0,
    });

    setIsAddModalOpen(false);
    setNewStudentData({
      fullName: '',
      studentCode: '',
      className: '10A1',
      roomName: 'A-201',
      building: 'Tòa A - Nam',
      gender: 'nam',
      parentPhone: '',
      specialCare: false,
      note: '',
    });
  };

  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterSpecialOnly) {
      return matchesQuery && s.specialCare;
    }
    return matchesQuery;
  });

  const getStudentTimeline = (studentId: string) => {
    return interactions.filter((i) => i.studentId === studentId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <GraduationCap className="h-4 w-4" />
            <span>Hồ sơ Học sinh Nội trú</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Danh sách Học sinh & Theo dõi Ưu tiên (Special Care)
          </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Học Sinh Mới</span>
          </button>

          <button
            onClick={() => setFilterSpecialOnly(!filterSpecialOnly)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              filterSpecialOnly
                ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {filterSpecialOnly ? 'Đang lọc: Ưu tiên' : 'Học sinh Cần theo dõi'}
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, mã HS, phòng..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3.5">Mã HS & Họ tên</th>
              <th className="p-3.5">Lớp & Phòng</th>
              <th className="p-3.5">GV Phụ trách</th>
              <th className="p-3.5">Phụ huynh & SĐT</th>
              <th className="p-3.5">Diện Theo dõi</th>
              <th className="p-3.5">Tương tác Cuối</th>
              <th className="p-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map((student) => {
              const timeline = getStudentTimeline(student.id);
              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/50"
                >
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{student.studentCode}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{student.className}</div>
                    <div className="text-[10px] text-slate-500">{student.roomName}</div>
                  </td>

                  <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {student.teacherName}
                  </td>

                  <td className="p-3.5">
                    <div className="text-slate-800 dark:text-slate-200">{student.parentName}</div>
                    <div className="text-[10px] text-slate-400">{student.parentPhone}</div>
                  </td>

                  <td className="p-3.5">
                    {student.specialCare ? (
                      <div className="flex flex-wrap gap-1">
                        {student.specialLabels.map((lbl) => (
                          <span
                            key={lbl}
                            className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          >
                            {lbl.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Bình thường</span>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-500">
                    {student.lastInteractionDate || 'Chưa tương tác'}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300"
                      >
                        Hồ sơ
                      </button>
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Chỉnh sửa hồ sơ"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Student Profile Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.fullName || ''}
        subtitle={`${selectedStudent?.studentCode} • Lớp ${selectedStudent?.className} • ${selectedStudent?.roomName}`}
        maxWidth="3xl"
      >
        {selectedStudent && (
          <div className="space-y-6 text-xs">
            {/* Info Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <span className="text-slate-400 block text-[10px]">Phụ huynh</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedStudent.parentName} ({selectedStudent.parentPhone})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Giáo viên phụ trách</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedStudent.teacherName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Lượt tương tác tháng</span>
                <span className="font-bold text-purple-600">
                  {selectedStudent.interactionCountThisMonth} Lượt
                </span>
              </div>
            </div>

            {selectedStudent.note && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 dark:border-purple-950 dark:bg-slate-800">
                <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">
                  Ghi chú ưu tiên theo dõi tâm lý / sức khỏe:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedStudent.note}</p>
              </div>
            )}

            {/* Permanent Interaction Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                <MessageSquareHeart className="h-4 w-4 text-purple-600" />
                Lịch sử Tương tác 1-1 (Timeline Chăm sóc)
              </h4>

              <div className="space-y-3">
                {getStudentTimeline(selectedStudent.id).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-400 dark:border-slate-800">
                    Chưa có nhật ký tương tác 1-1 nào cho học sinh này.
                  </div>
                ) : (
                  getStudentTimeline(selectedStudent.id).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <span className="font-bold text-purple-700 dark:text-purple-400">
                          {item.topic}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.interactionDate} ({item.startTime} - {item.endTime})
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong>Nội dung:</strong> {item.summary}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Quan sát:</strong> {item.observation}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Hướng hỗ trợ:</strong> {item.supportPlan}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span>Người thực hiện: {item.teacherName}</span>
                        <span>Địa điểm: {item.location}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Học Sinh Nội Trú Mới"
      >
        <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mã Học sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: HS1025"
                value={newStudentData.studentCode}
                onChange={(e) => setNewStudentData({ ...newStudentData, studentCode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trần Thị B"
                value={newStudentData.fullName}
                onChange={(e) => setNewStudentData({ ...newStudentData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lớp</label>
              <input
                type="text"
                value={newStudentData.className}
                onChange={(e) => setNewStudentData({ ...newStudentData, className: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng KTX</label>
              <input
                type="text"
                value={newStudentData.roomName}
                onChange={(e) => setNewStudentData({ ...newStudentData, roomName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tòa</label>
              <select
                value={newStudentData.building}
                onChange={(e) => setNewStudentData({ ...newStudentData, building: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="Tòa A - Nam">Tòa A - Nam</option>
                <option value="Tòa B - Nữ">Tòa B - Nữ</option>
                <option value="Tòa C - Quốc tế">Tòa C - Quốc tế</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giới tính</label>
              <select
                value={newStudentData.gender}
                onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value as 'nam' | 'nu' })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SĐT Phụ huynh</label>
              <input
                type="tel"
                placeholder="09xx xxx xxx"
                value={newStudentData.parentPhone}
                onChange={(e) => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="specialCare"
              checked={newStudentData.specialCare}
              onChange={(e) => setNewStudentData({ ...newStudentData, specialCare: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="specialCare" className="font-bold text-slate-700 dark:text-slate-300">
              Đưa vào danh sách cần Theo Dõi Đặc Biệt (Special Care)
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú lưu ý</label>
            <textarea
              rows={2}
              placeholder="VD: Cần lưu ý dị ứng hải sản, tâm lý hay căng thẳng..."
              value={newStudentData.note}
              onChange={(e) => setNewStudentData({ ...newStudentData, note: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
            >
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Chỉnh Sửa Hồ Sơ Học Sinh"
      >
        {editingStudent && (
          <form onSubmit={handleEditStudentSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Học sinh
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.studentCode}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lớp</label>
                <input
                  type="text"
                  value={editingStudent.className}
                  onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng KTX</label>
                <input
                  type="text"
                  value={editingStudent.roomName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roomName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tòa</label>
                <select
                  value={editingStudent.building}
                  onChange={(e) => setEditingStudent({ ...editingStudent, building: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Tòa A - Nam">Tòa A - Nam</option>
                  <option value="Tòa B - Nữ">Tòa B - Nữ</option>
                  <option value="Tòa C - Quốc tế">Tòa C - Quốc tế</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Phụ huynh</label>
                <input
                  type="text"
                  value={editingStudent.parentName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SĐT Phụ huynh</label>
                <input
                  type="tel"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editSpecialCare"
                checked={editingStudent.specialCare}
                onChange={(e) => setEditingStudent({ ...editingStudent, specialCare: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="editSpecialCare" className="font-bold text-slate-700 dark:text-slate-300">
                Theo Dõi Đặc Biệt (Special Care)
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú / Lưu ý tâm lý, sức khỏe</label>
              <textarea
                rows={2}
                value={editingStudent.note || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, note: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteStudent(editingStudent);
                  setEditingStudent(null);
                }}
                className="rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300 px-3 py-2 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900 transition flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa Hồ Sơ Học Sinh</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                >
                  Cập Nhật
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Delete Student Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
        title="Xác nhận xóa hồ sơ học sinh"
        itemName={studentToDelete ? `Học sinh ${studentToDelete.fullName} (${studentToDelete.studentCode})` : ''}
      />
    </div>
  );
};
