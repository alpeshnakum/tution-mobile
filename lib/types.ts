export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'parent' | string;
  branchId: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  studentId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardData {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    classId?: string;
    className: string | null;
    rollNumber: string | null;
  };
  session: {
    id: string;
    name: string;
    displayName: string;
  };
  attendance: {
    month: string;
    percentage: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    totalDays: number;
  };
  fees: {
    totalExpected: number;
    totalConcession: number;
    totalPaid: number;
    totalDue: number;
  };
  recentResults: Array<{
    examTitle: string;
    subject: string;
    examDate: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    isPassed: boolean;
  }>;
  upcomingExams: Array<{
    id: string;
    title: string;
    subject: string;
    examDate: string;
    totalMarks: number;
    examType: string;
  }>;
}

export interface FeeInstallment {
  number: number;
  label: string;
  feeItems: Array<{ feeType: string; name: string; amount: number }>;
  installmentTotal: number;
  concessionAmount: number;
  netExpected: number;
  totalPaid: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  payments: Array<{
    receiptNumber: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
  }>;
}

export interface FeesData {
  student: { id: string; name: string; admissionNumber: string };
  session: { id: string; name: string; displayName: string; installmentType: string; installmentCount: number };
  advanceBalance: number;
  installments: FeeInstallment[];
  totals: { totalExpected: number; totalConcession: number; totalPaid: number; totalDue: number };
  paymentHistory: Array<{
    receiptNumber: string;
    installmentLabel: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
  }>;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string | null;
}

export interface AttendanceData {
  student: { id: string; name: string; admissionNumber: string };
  month: number;
  year: number;
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
  records: AttendanceRecord[];
}

export interface ExamResult {
  examId: string;
  examTitle: string;
  subject: string;
  examDate: string;
  examType: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  isPassed: boolean;
  isAbsent?: boolean;
  remarks?: string | null;
}

export interface Child {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
}

export interface LeaveRequest {
  _id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewNotes?: string | null;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
  error: string | null;
}

export interface HomeworkItem {
  _id: string;
  classId: string;
  sectionId?: string;
  branchId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks?: number;
  isGraded: boolean;
  status: string;
}

export interface TimetablePeriod {
  periodNumber: number;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
}

export interface TimetableDay {
  _id: string | null;
  day: string;
  periods: TimetablePeriod[];
}

export interface ExamSubject {
  subjectName: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
}

export interface ExamScheduleItem {
  id: string;
  title: string;
  examType: string;
  isMultiSubject: boolean;
  examDate: string | null;
  startTime: string | null;
  duration: number | null;
  subjectName: string | null;
  totalMarks: number | null;
  passingMarks: number | null;
  subjects: ExamSubject[];
}

export interface ExamsData {
  exams: ExamScheduleItem[];
  session: { id: string; displayName: string };
}

export interface FeeBreakdownItem {
  feeHeadName: string;
  amount: number;
}

export interface ReceiptData {
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: string;
  installmentLabel: string;
  bankName?: string | null;
  chequeNumber?: string | null;
  remarks?: string | null;
  feeBreakdown: FeeBreakdownItem[];
  installmentTotal: number;
  concessionAmount: number;
  previousDue: number;
  advanceApplied: number;
  netPayable: number;
  amountPaid: number;
  dueAmount: number;
  student: { name: string; admissionNumber: string };
  session: { name: string; displayName: string };
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'fee_reminder' | 'exam_notice' | 'attendance_alert' | 'result_published' | 'announcement' | 'promotion';
  status: 'pending' | 'sent' | 'read' | 'failed';
  createdAt: string;
  readAt?: string | null;
}

export interface NotificationsData {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'parents';
  priority: 'normal' | 'important' | 'urgent';
  publishedByName: string;
  createdAt: string;
  expiresAt?: string | null;
}

export interface ChildInfo {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classId: string;
  sectionId?: string;
  rollNumber?: string | null;
  branchId: string;
  status: string;
  relation?: string | null;
  isPrimary: boolean;
}
