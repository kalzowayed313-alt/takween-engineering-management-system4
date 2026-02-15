
export enum Role {
  ADMIN = 'ADMIN',
  DEPT_MANAGER = 'DEPT_MANAGER',
  TEAM_LEADER = 'TEAM_LEADER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum TaskStatus {
  NEW = 'جديد',
  IN_PROGRESS = 'قيد التنفيذ',
  REVIEW = 'قيد المراجعة',
  PENDING = 'معلق',
  COMPLETED = 'مكتمل'
}

export enum TaskPriority {
  LOW = 'منخفضة',
  MEDIUM = 'متوسطة',
  HIGH = 'عالية'
}

export interface Department {
  id: string;
  name: string;
  color: string;
  employeeCount: number;
  kpiTarget?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  departmentId: string;
  avatar: string;
  kpi: number;
  kpiTarget?: number;
  joinedDate: string;
  status: 'ACTIVE' | 'PENDING';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  mimeType?: string;
  provider: 'local' | 'cloud'; // التمييز بين الملف المرفوع والرابط السحابي
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  departmentId: string;
  projectId?: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  comments: any[];
  attachments: Attachment[];
  kpiPoints: number;
  weight: number; 
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  deadline: string;
  managerId: string;
  departmentId: string;
  progress: number;
  driveFolderUrl?: string; // رابط مجلد جوجل درايف الأساسي للمشروع
  milestones?: Milestone[];
}

export interface KpiRule {
  id: string;
  title: string;
  category: string;
  defaultPoints: number;
  defaultHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'ANNUAL' | 'SICK' | 'EMERGENCY';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface SprintExtension {
  id: string;
  oldEndDate: string;
  newEndDate: string;
  reason: string;
  extendedAt: string;
  extendedBy: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
  projectId: string;
  extensions?: SprintExtension[];
}

export interface SiteReport {
  id: string;
  projectId: string;
  authorId: string;
  date: string;
  weather: string;
  workerCount: number;
  equipmentActive: string[];
  notes: string;
  images: string[];
}
