import {
  User,
  Student,
  Room,
  Position,
  ScheduleAssignment,
  TaskInstance,
  Interaction1on1,
  KPIRecord,
  NotificationItem,
  AuditLog,
  DepartmentSettings,
  TaskStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_ROOMS,
  INITIAL_POSITIONS,
  INITIAL_SCHEDULE_ASSIGNMENTS,
  INITIAL_TASK_INSTANCES,
  INITIAL_INTERACTIONS,
  INITIAL_KPIS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'bops_users_v1',
  STUDENTS: 'bops_students_v1',
  ROOMS: 'bops_rooms_v1',
  POSITIONS: 'bops_positions_v1',
  SCHEDULES: 'bops_schedules_v1',
  TASKS: 'bops_tasks_v1',
  INTERACTIONS: 'bops_interactions_v1',
  KPIS: 'bops_kpis_v1',
  NOTIFICATIONS: 'bops_notifications_v1',
  AUDIT_LOGS: 'bops_audit_logs_v1',
  SETTINGS: 'bops_settings_v1',
  CURRENT_USER_ID: 'bops_current_user_id_v1',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers() {
  listeners.forEach((fn) => fn());
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Data Store initialization
export const BOPSStore = {
  // Current User
  getCurrentUser(): User {
    const users = BOPSStore.getUsers();
    const currentId = getFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'u-gv-001');
    const user = users.find((u) => u.id === currentId);
    return user || users[0];
  },

  setCurrentUser(userId: string): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // Users
  getUsers(): User[] {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    // Ensure manager name and workloadIndex are up-to-date
    let updated = false;
    const sanitized = users.map((u) => {
      let userObj = { ...u };
      if (userObj.workloadIndex !== 1.0) {
        userObj.workloadIndex = 1.0;
        updated = true;
      }
      if (userObj.role === 'teacher') {
        if (!userObj.position || userObj.position === 'Giáo viên Quản nhiệm') {
          userObj.position = 'Giáo viên Quản nhiệm DomB';
          updated = true;
        } else if (userObj.position.includes('KTX')) {
          userObj.position = userObj.position
            .replace(/KTX\s+[A-E]/g, 'DomB')
            .replace(/KTX\s+DomB/g, 'DomB')
            .replace(/KTX/g, 'DomB');
          updated = true;
        }
        if (userObj.assignedBuilding !== 'DomB') {
          userObj.assignedBuilding = 'DomB';
          updated = true;
        }
      }
      if (userObj.id === 'u-mgr-01' || userObj.role === 'manager') {
        if (userObj.fullName !== 'Thầy Lê Huy Phúc') {
          updated = true;
          userObj.fullName = 'Thầy Lê Huy Phúc';
          userObj.email = 'phuclh18@fpt.edu.vn';
          userObj.username = 'phuclh';
          userObj.password = 'Lê Huy Phúc';
        }
      }
      return userObj;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.USERS, sanitized);
    }
    return sanitized;
  },

  saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  },

  addUser(userData: Omit<User, 'id'> & { id?: string }): User {
    const users = BOPSStore.getUsers();
    const newUser: User = {
      ...userData,
      id: userData.id || `u-gv-${String(users.length + 1).padStart(3, '0')}`,
    };
    users.push(newUser);
    BOPSStore.saveUsers(users);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Teacher',
      'ADD_TEACHER',
      `Tạo tài khoản Giáo viên Quản nhiệm mới: ${newUser.fullName} (${newUser.teacherCode})`
    );

    return newUser;
  },

  updateUser(updated: User): void {
    const users = BOPSStore.getUsers().map((u) => (u.id === updated.id ? updated : u));
    BOPSStore.saveUsers(users);
  },

  deleteUser(userId: string): void {
    const users = BOPSStore.getUsers().filter((u) => u.id !== userId);
    BOPSStore.saveUsers(users);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Teacher',
      'DELETE_TEACHER',
      `Xóa tài khoản Giáo viên ID: ${userId}`
    );
  },

  // Students
  getStudents(): Student[] {
    return getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  saveStudents(students: Student[]): void {
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
  },

  addStudent(studentData: Omit<Student, 'id'> & { id?: string }): Student {
    const students = BOPSStore.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: studentData.id || `st-${Date.now()}`,
    };
    students.unshift(newStudent);
    BOPSStore.saveStudents(students);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Student',
      'ADD_STUDENT',
      `Thêm học sinh nội trú mới: ${newStudent.fullName} (${newStudent.studentCode})`
    );

    return newStudent;
  },

  updateStudent(student: Student): void {
    const students = BOPSStore.getStudents().map((s) => (s.id === student.id ? student : s));
    BOPSStore.saveStudents(students);
    BOPSStore.addAuditLog(
      BOPSStore.getCurrentUser().id,
      BOPSStore.getCurrentUser().fullName,
      BOPSStore.getCurrentUser().role,
      'Student',
      'UPDATE_STUDENT',
      `Cập nhật hồ sơ học sinh ${student.fullName} (${student.studentCode})`
    );
  },

  deleteStudent(studentId: string): void {
    const students = BOPSStore.getStudents().filter((s) => s.id !== studentId);
    BOPSStore.saveStudents(students);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Student',
      'DELETE_STUDENT',
      `Xóa hồ sơ học sinh ID: ${studentId}`
    );
  },

  // Positions
  getPositions(): Position[] {
    return getFromStorage<Position[]>(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS);
  },

  savePositions(positions: Position[]): void {
    saveToStorage(STORAGE_KEYS.POSITIONS, positions);
  },

  // Rooms
  getRooms(): Room[] {
    return getFromStorage<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  },

  saveRooms(rooms: Room[]): void {
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
  },

  addRoom(roomData: Omit<Room, 'id'> & { id?: string }): Room {
    const rooms = BOPSStore.getRooms();
    const newRoom: Room = {
      ...roomData,
      id: roomData.id || `room-${Date.now()}`,
    };
    rooms.push(newRoom);
    BOPSStore.saveRooms(rooms);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Room',
      'ADD_ROOM',
      `Khai báo phòng KTX mới: ${newRoom.roomName} (${newRoom.building})`
    );

    return newRoom;
  },

  updateRoom(room: Room): void {
    const rooms = BOPSStore.getRooms().map((r) => (r.id === room.id ? room : r));
    BOPSStore.saveRooms(rooms);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Room',
      'UPDATE_ROOM',
      `Cập nhật phòng KTX ${room.roomName}`
    );
  },

  deleteRoom(roomId: string): void {
    const rooms = BOPSStore.getRooms().filter((r) => r.id !== roomId);
    BOPSStore.saveRooms(rooms);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Room',
      'DELETE_ROOM',
      `Xóa phòng KTX ID: ${roomId}`
    );
  },

  updateRoomHygiene(roomId: string, status: 'clean' | 'dirty', hygieneStatus: 'pass' | 'needs_correction' | 'critical', note?: string): void {
    const rooms = BOPSStore.getRooms().map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          status,
          hygieneStatus,
          lastInspectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          correctionNote: note,
        };
      }
      return r;
    });
    BOPSStore.saveRooms(rooms);
  },

  // Schedules
  getSchedules(): ScheduleAssignment[] {
    return getFromStorage<ScheduleAssignment[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULE_ASSIGNMENTS);
  },

  saveSchedules(schedules: ScheduleAssignment[]): void {
    saveToStorage(STORAGE_KEYS.SCHEDULES, schedules);
  },

  addSchedule(data: Omit<ScheduleAssignment, 'id'> & { id?: string }): ScheduleAssignment {
    const schedules = BOPSStore.getSchedules();
    const newSchedule: ScheduleAssignment = {
      ...data,
      id: data.id || `sched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    schedules.unshift(newSchedule);
    BOPSStore.saveSchedules(schedules);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Schedule',
      'ADD_SCHEDULE',
      `Phân công ca trực mới ngày ${newSchedule.date} cho GV ${newSchedule.teacherName}`
    );

    return newSchedule;
  },

  updateSchedule(schedule: ScheduleAssignment): void {
    const schedules = BOPSStore.getSchedules().map((s) => (s.id === schedule.id ? schedule : s));
    BOPSStore.saveSchedules(schedules);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Schedule',
      'UPDATE_SCHEDULE',
      `Cập nhật ca trực ID: ${schedule.id} ngày ${schedule.date}`
    );
  },

  deleteSchedule(scheduleId: string): void {
    const schedules = BOPSStore.getSchedules().filter((s) => s.id !== scheduleId);
    BOPSStore.saveSchedules(schedules);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Schedule',
      'DELETE_SCHEDULE',
      `Xóa ca trực ID: ${scheduleId}`
    );
  },

  // Tasks
  getTasks(): TaskInstance[] {
    const tasks = getFromStorage<TaskInstance[]>(STORAGE_KEYS.TASKS, INITIAL_TASK_INSTANCES);
    return tasks.map((t) => {
      let updated = t;
      if (t.taskName === 'Kiểm tra hành chính & Bàn giao ca tối') {
        updated = { ...updated, taskName: 'Kiểm tra hành chính - Điểm danh tối & Bàn giao ca tối' };
      }
      if (t.title === 'Kiểm tra hành chính & Bàn giao ca tối') {
        updated = { ...updated, title: 'Kiểm tra hành chính - Điểm danh tối & Bàn giao ca tối' };
      }
      return updated;
    });
  },

  saveTasks(tasks: TaskInstance[]): void {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  addTask(taskData: Omit<TaskInstance, 'id'> & { id?: string }): TaskInstance {
    const tasks = BOPSStore.getTasks();
    const newTask: TaskInstance = {
      ...taskData,
      id: taskData.id || `task-${Date.now()}`,
    };
    tasks.unshift(newTask);
    BOPSStore.saveTasks(tasks);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Task',
      'ADD_TASK',
      `Giao nhiệm vụ/Checklist mới: "${newTask.title || newTask.taskName}" cho GV ${newTask.teacherName}`
    );

    return newTask;
  },

  updateTask(updatedTask: TaskInstance): void {
    const tasks = BOPSStore.getTasks().map((t) => (t.id === updatedTask.id ? updatedTask : t));
    BOPSStore.saveTasks(tasks);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Task',
      'UPDATE_TASK',
      `Cập nhật thông tin nhiệm vụ "${updatedTask.title || updatedTask.taskName}"`
    );
  },

  deleteTask(taskId: string): void {
    const tasks = BOPSStore.getTasks().filter((t) => t.id !== taskId);
    BOPSStore.saveTasks(tasks);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Task',
      'DELETE_TASK',
      `Xóa nhiệm vụ ID: ${taskId}`
    );
  },

  updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    note?: string,
    photos?: string[]
  ): void {
    const tasks = BOPSStore.getTasks().map((t) => {
      if (t.id === taskId) {
        const nowTime = new Date().toTimeString().substring(0, 5);
        return {
          ...t,
          status,
          actualEnd: status === 'completed' ? nowTime : t.actualEnd,
          actualStart: status === 'working' && !t.actualStart ? nowTime : t.actualStart,
          note: note !== undefined ? note : t.note,
          proofPhotos: photos ? [...(t.proofPhotos || []), ...photos] : t.proofPhotos,
        };
      }
      return t;
    });
    BOPSStore.saveTasks(tasks);

    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Task',
      'UPDATE_TASK_STATUS',
      `Cập nhật trạng thái nhiệm vụ "${taskId}" sang ${status.toUpperCase()}`
    );

    // Recalculate KPI for affected teacher
    const affectedTask = tasks.find((t) => t.id === taskId);
    if (affectedTask) {
      BOPSStore.calculateKPIForTeacher(affectedTask.teacherId, affectedTask.date);
    }
  },

  verifyTask(taskId: string, verifiedBy: string, approved: boolean): void {
    const tasks = BOPSStore.getTasks().map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          verified: approved,
          verifiedBy,
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: approved ? ('verified' as TaskStatus) : t.status,
        };
      }
      return t;
    });
    BOPSStore.saveTasks(tasks);
  },

  evaluateWorkItem(params: {
    itemType: 'task' | 'schedule';
    itemId: string;
    managerName: string;
    evaluation: 'approved' | 'rejected';
    criteriaKey?: 'operation' | 'quality' | 'studentCare' | 'discipline';
    criteriaLabel?: string;
    deductedPoints?: number;
    reason?: string;
  }): void {
    const nowTime = new Date().toTimeString().substring(0, 5);
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let teacherId = '';
    let teacherName = '';
    let dateStr = new Date().toISOString().split('T')[0];
    let titleStr = '';

    if (params.itemType === 'task') {
      const tasks = BOPSStore.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === params.itemId);
      if (taskIndex >= 0) {
        const t = tasks[taskIndex];
        teacherId = t.teacherId;
        teacherName = t.teacherName;
        dateStr = t.date || dateStr;
        titleStr = t.title || t.taskName;

        tasks[taskIndex] = {
          ...t,
          status: params.evaluation === 'approved' ? 'verified' : 'rejected',
          verified: params.evaluation === 'approved',
          verifiedBy: params.managerName,
          verifiedAt: nowIso,
          evaluationCriteria: params.criteriaLabel,
          deductedPoints: params.evaluation === 'rejected' ? params.deductedPoints || 0 : 0,
          evaluationNote: params.reason || (params.evaluation === 'approved' ? 'Quản lý đã duyệt Hoàn thành' : 'Chưa tốt'),
        };
        BOPSStore.saveTasks(tasks);
      }
    } else if (params.itemType === 'schedule') {
      const schedules = BOPSStore.getSchedules();
      const schIndex = schedules.findIndex((s) => s.id === params.itemId);
      if (schIndex >= 0) {
        const s = schedules[schIndex];
        teacherId = s.teacherId;
        teacherName = s.teacherName;
        dateStr = s.date || dateStr;
        titleStr = `Ca trực ${s.positionName} (${s.date})`;

        schedules[schIndex] = {
          ...s,
          status: params.evaluation === 'approved' ? 'verified' : 'rejected',
          evaluationStatus: params.evaluation === 'approved' ? 'approved' : 'rejected',
          evaluationCriteria: params.criteriaLabel,
          deductedPoints: params.evaluation === 'rejected' ? params.deductedPoints || 0 : 0,
          evaluationNote: params.reason || (params.evaluation === 'approved' ? 'Quản lý đã duyệt Hoàn thành' : 'Chưa tốt'),
          evaluatedBy: params.managerName,
          evaluatedAt: nowIso,
        };
        BOPSStore.saveSchedules(schedules);
      }
    }

    if (teacherId) {
      // Recalculate KPI with explicit penalty if rejected
      const kpis = BOPSStore.getKPIs();
      let kpiIndex = kpis.findIndex((k) => k.teacherId === teacherId && k.date === dateStr);
      if (kpiIndex < 0) {
        kpiIndex = kpis.findIndex((k) => k.teacherId === teacherId);
      }

      if (params.evaluation === 'rejected' && params.deductedPoints) {
        const pts = params.deductedPoints || 2;
        const catKey = params.criteriaKey || 'operation';
        const label = params.criteriaLabel || 'Nhiệm vụ ca trực';

        if (kpiIndex >= 0) {
          const kpi = kpis[kpiIndex];
          let opScore = kpi.operationScore;
          let qScore = kpi.qualityScore;
          let careScore = kpi.studentCareScore;
          let discScore = kpi.disciplineScore;

          if (catKey === 'operation') opScore = Math.max(0, opScore - pts);
          else if (catKey === 'quality') qScore = Math.max(0, qScore - pts);
          else if (catKey === 'studentCare') careScore = Math.max(0, careScore - pts);
          else if (catKey === 'discipline') discScore = Math.max(0, discScore - pts);

          const newTotal = Math.max(0, Math.min(100, opScore + qScore + careScore + kpi.contributionScore + discScore));
          let rank: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
          if (newTotal >= 97 && discScore === 5) rank = 'A+';
          else if (newTotal >= 90) rank = 'A';
          else if (newTotal >= 80) rank = 'B';
          else if (newTotal >= 70) rank = 'C';
          else rank = 'D';

          const penalties = [...(kpi.penalties || [])];
          penalties.push({
            reason: `[${label}] ${params.reason || 'Đánh giá Chưa tốt ca trực/nhiệm vụ'}`,
            pointsDeducted: pts,
            time: nowTime,
          });

          kpis[kpiIndex] = {
            ...kpi,
            operationScore: opScore,
            qualityScore: qScore,
            studentCareScore: careScore,
            disciplineScore: discScore,
            totalScore: newTotal,
            rank,
            penalties,
          };
          BOPSStore.saveKPIs(kpis);
        }
      } else {
        BOPSStore.calculateKPIForTeacher(teacherId, dateStr);
      }

      // Send notification to teacher
      BOPSStore.addNotification({
        receiverId: teacherId,
        title: params.evaluation === 'approved' ? 'Phê duyệt ca trực/nhiệm vụ: Hoàn thành' : 'Đánh giá ca trực/nhiệm vụ: Chưa tốt',
        content:
          params.evaluation === 'approved'
            ? `Quản lý ${params.managerName} đã duyệt ca trực/nhiệm vụ "${titleStr}" của bạn đạt "Hoàn thành".`
            : `Quản lý ${params.managerName} đánh giá "${titleStr}" của bạn là "Chưa tốt". Trừ ${params.deductedPoints || 2} điểm KPI (${params.criteriaLabel || 'Tiêu chí'}). Lý do: ${params.reason || 'Chưa đạt yêu cầu'}`,
        type: 'kpi',
        priority: params.evaluation === 'approved' ? 'medium' : 'high',
      });

      // Audit Log
      const currentUser = BOPSStore.getCurrentUser();
      BOPSStore.addAuditLog(
        currentUser.id,
        currentUser.fullName,
        currentUser.role,
        'Evaluation',
        'EVALUATE_WORK_ITEM',
        `Đánh giá ca/nhiệm vụ "${titleStr}" của GV ${teacherName}: ${params.evaluation === 'approved' ? 'HOÀN THÀNH' : `CHƯA TỐT (-${params.deductedPoints || 2} điểm)`}`
      );
    }
  },

  // Interactions
  getInteractions(): Interaction1on1[] {
    return getFromStorage<Interaction1on1[]>(STORAGE_KEYS.INTERACTIONS, INITIAL_INTERACTIONS);
  },

  addInteraction(interactionData: Omit<Interaction1on1, 'id' | 'createdAt'>): Interaction1on1 {
    const interactions = BOPSStore.getInteractions();
    const newInteraction: Interaction1on1 = {
      ...interactionData,
      id: `inter-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    interactions.unshift(newInteraction);
    saveToStorage(STORAGE_KEYS.INTERACTIONS, interactions);

    // Update student's last interaction date and count
    const students = BOPSStore.getStudents().map((s) => {
      if (s.id === interactionData.studentId) {
        return {
          ...s,
          lastInteractionDate: interactionData.interactionDate,
          interactionCountThisMonth: s.interactionCountThisMonth + 1,
        };
      }
      return s;
    });
    BOPSStore.saveStudents(students);

    // Audit log
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Interaction',
      'ADD_INTERACTION_1ON1',
      `Nhập tương tác 1-1 với học sinh ${interactionData.studentName} (${interactionData.topic})`
    );

    // Recalculate KPI
    BOPSStore.calculateKPIForTeacher(interactionData.teacherId, interactionData.interactionDate);

    return newInteraction;
  },

  // KPIs
  getKPIs(): KPIRecord[] {
    return getFromStorage<KPIRecord[]>(STORAGE_KEYS.KPIS, INITIAL_KPIS);
  },

  saveKPIs(kpis: KPIRecord[]): void {
    saveToStorage(STORAGE_KEYS.KPIS, kpis);
  },

  calculateKPIForTeacher(teacherId: string, date: string): KPIRecord {
    const tasks = BOPSStore.getTasks().filter((t) => t.teacherId === teacherId && t.date === date);
    const users = BOPSStore.getUsers();
    const teacher = users.find((u) => u.id === teacherId);

    const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified');
    const lateTasks = tasks.filter((t) => t.status === 'late');

    // Operation Score (Max 50)
    let opScore = 50;
    if (tasks.length > 0) {
      const completionRatio = completedTasks.length / tasks.length;
      opScore = Math.round(completionRatio * 50);
    }

    // Quality Score (Max 20)
    let qScore = 20;
    if (lateTasks.length > 0) {
      qScore = Math.max(0, 20 - lateTasks.length * 3);
    }

    // Student Care Score (Max 15)
    // Check interactions this week
    const interactions = BOPSStore.getInteractions().filter((i) => i.teacherId === teacherId);
    let careScore = 15;
    if (interactions.length < 3) careScore = 10;
    if (interactions.length === 0) careScore = 5;

    // Contribution (Max 10)
    const contribScore = 9;

    // Discipline (Max 5)
    let discScore = 5;
    const penalties: { reason: string; pointsDeducted: number; time: string }[] = [];
    if (lateTasks.length > 0) {
      discScore -= lateTasks.length * 1;
      penalties.push({
        reason: `Có ${lateTasks.length} nhiệm vụ muộn giờ`,
        pointsDeducted: lateTasks.length * 1,
        time: new Date().toTimeString().substring(0, 5),
      });
    }

    const totalScore = Math.max(0, Math.min(100, opScore + qScore + careScore + contribScore + discScore));

    let rank: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
    if (totalScore >= 97 && discScore === 5) rank = 'A+';
    else if (totalScore >= 90) rank = 'A';
    else if (totalScore >= 80) rank = 'B';
    else if (totalScore >= 70) rank = 'C';
    else rank = 'D';

    const kpis = BOPSStore.getKPIs();
    const existingIndex = kpis.findIndex((k) => k.teacherId === teacherId && k.date === date);

    const record: KPIRecord = {
      id: existingIndex >= 0 ? kpis[existingIndex].id : `kpi-${teacherId}-${date}`,
      teacherId,
      teacherName: teacher?.fullName || 'Giáo viên',
      teacherCode: teacher?.teacherCode || 'GV',
      date,
      operationScore: opScore,
      qualityScore: qScore,
      studentCareScore: careScore,
      contributionScore: contribScore,
      disciplineScore: discScore,
      totalScore,
      rank,
      workloadIndex: teacher?.workloadIndex || 1.0,
      tasksCompleted: completedTasks.length,
      tasksTotal: tasks.length,
      interactionsCompletedThisWeek: interactions.length,
      penalties,
    };

    if (existingIndex >= 0) {
      kpis[existingIndex] = record;
    } else {
      kpis.push(record);
    }

    BOPSStore.saveKPIs(kpis);
    return record;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const list = BOPSStore.getNotifications();
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    list.unshift(item);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  markNotificationRead(id: string): void {
    const list = BOPSStore.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(userId: string, userName: string, userRole: 'manager' | 'teacher', module: string, operation: string, details: string): void {
    const logs = BOPSStore.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId,
      userName,
      userRole,
      module,
      operation,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    logs.unshift(newLog);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Settings
  getSettings(): DepartmentSettings {
    return getFromStorage<DepartmentSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: DepartmentSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    const currentUser = BOPSStore.getCurrentUser();
    BOPSStore.addAuditLog(
      currentUser.id,
      currentUser.fullName,
      currentUser.role,
      'Settings',
      'UPDATE_SETTINGS',
      'Cập nhật cấu hình quy định vận hành và công thức KPI hệ thống.'
    );
  },

  // Reset to initial state
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.POSITIONS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.INTERACTIONS);
    localStorage.removeItem(STORAGE_KEYS.KPIS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    notifySubscribers();
  },
};
