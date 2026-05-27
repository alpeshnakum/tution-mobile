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
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  className?: string;
  sectionName?: string;
}

export interface AttendanceData {
  records: AttendanceRecord[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
}

export interface ExamResult {
  _id: string;
  examTitle: string;
  subject: string;
  examDate: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  isPassed: boolean;
}

export interface Child {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
  error: string | null;
}
