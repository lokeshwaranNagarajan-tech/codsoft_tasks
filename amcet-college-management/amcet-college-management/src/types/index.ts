export type UserRole = 'PRIMARY_ADMIN' | 'SECONDARY_ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  collegeId: string;
  name: string;
  dob: string | Date;
  role: UserRole;
  createdAt: string | Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  _count?: {
    students?: number;
    faculties?: number;
    subjects?: number;
  };
}

export interface Faculty {
  id: string;
  userId: string;
  user: User;
  departmentId: string;
  department: Department;
  designation: string;
  isHOD: boolean;
  createdAt: string | Date;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  registerNo: string;
  departmentId: string;
  department: Department;
  year: number;
  semester: number;
  section: string;
  createdAt: string | Date;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  departmentId: string;
  department?: Department;
}

export interface SubjectAssignment {
  id: string;
  facultyId: string;
  faculty?: Faculty;
  subjectId: string;
  subject?: Subject;
  academicYear: string;
}

export interface ClassAdvisor {
  id: string;
  facultyId: string;
  faculty?: Faculty;
  departmentId: string;
  department?: Department;
  year: number;
  section: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  student?: Student;
  subjectId: string;
  subject?: Subject;
  facultyId?: string | null;
  date: string | Date;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
}

export interface Exam {
  id: string;
  name: string;
  semester: number;
  academicYear: string;
  createdAt?: string | Date;
}

export interface Mark {
  id: string;
  studentId: string;
  student?: Student;
  subjectId: string;
  subject?: Subject;
  examId: string;
  exam?: Exam;
  marks: number;
}

export interface Fee {
  id: string;
  studentId: string;
  student?: Student;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PAID' | 'PENDING' | 'PARTIAL';
  paymentDate?: string | Date | null;
}

export interface TimetableSlot {
  id: string;
  departmentId: string;
  department?: Department;
  semester: number;
  section: string;
  day: string;
  period: number;
  subjectId: string;
  subject?: Subject;
  facultyId: string;
  faculty?: Faculty;
}
