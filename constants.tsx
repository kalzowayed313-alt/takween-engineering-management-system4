
import { Role, Department, Employee, TaskStatus, TaskPriority, Task, Project, Sprint, KpiRule } from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'arch', name: 'قسم المعماري', color: '#2563eb', employeeCount: 8, kpiTarget: 85 },
  { id: 'struct', name: 'قسم الإنشائي', color: '#10b981', employeeCount: 7, kpiTarget: 80 },
  { id: 'interior', name: 'قسم التصميم الداخلي', color: '#ec4899', employeeCount: 6, kpiTarget: 90 },
  { id: 'market', name: 'قسم التسويق', color: '#8b5cf6', employeeCount: 5, kpiTarget: 75 },
  { id: 'hr', name: 'قسم الموارد البشرية', color: '#06b6d4', employeeCount: 4, kpiTarget: 95 },
  { id: 'acc', name: 'قسم المحاسبة', color: '#ef4444', employeeCount: 3, kpiTarget: 95 },
];

export const INITIAL_KPI_RULES: KpiRule[] = [
  { id: 'rule-1', title: 'مراجعة المخططات النهائية', category: 'تصميم', defaultPoints: 50, defaultHours: 4 },
  { id: 'rule-2', title: 'إعداد الحصر والكميات', category: 'هندسة', defaultPoints: 30, defaultHours: 8 },
  { id: 'rule-3', title: 'زيارة موقع ومعاينة', category: 'إشراف', defaultPoints: 40, defaultHours: 3 },
  { id: 'rule-4', title: 'تصميم واجهة 3D', category: 'معماري', defaultPoints: 100, defaultHours: 12 },
  { id: 'rule-5', title: 'تقرير مالي شهري', category: 'إدارة', defaultPoints: 20, defaultHours: 2 },
];

const getAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;

const generateEmployees = (): Employee[] => {
  const employees: Employee[] = [
    {
      id: 'emp-1',
      name: 'م. أحمد محمود',
      email: 'alzowayed.job@gmail.com',
      password: 'Takween@2026',
      role: Role.ADMIN,
      departmentId: 'arch',
      avatar: getAvatar('أحمد محمود'),
      kpi: 94,
      kpiTarget: 95,
      joinedDate: '2023-01-15',
      status: 'ACTIVE'
    },
    {
      id: 'emp-2',
      name: 'م. سارة خالد',
      email: 'sara@takween.com',
      password: '123',
      role: Role.DEPT_MANAGER,
      departmentId: 'interior',
      avatar: getAvatar('سارة خالد'),
      kpi: 88,
      kpiTarget: 90,
      joinedDate: '2023-03-10',
      status: 'ACTIVE'
    }
  ];

  const names = ['عمر', 'زينب', 'محمد', 'ليلى', 'خالد', 'فاطمة', 'ياسين', 'نور', 'يوسف', 'مريم'];
  const lastNames = ['السيد', 'منصور', 'كامل', 'جلال', 'باسم', 'راضي', 'حماد', 'عباس'];

  for (let i = 3; i <= 48; i++) {
    const deptIdx = Math.floor(Math.random() * DEPARTMENTS.length);
    const fullName = `م. ${names[i % names.length]} ${lastNames[i % lastNames.length]}`;
    employees.push({
      id: `emp-${i}`,
      name: fullName,
      email: `user${i}@takween.com`,
      password: '123',
      role: i < 10 ? Role.TEAM_LEADER : Role.EMPLOYEE,
      departmentId: DEPARTMENTS[deptIdx].id,
      avatar: getAvatar(fullName),
      kpi: Math.floor(Math.random() * 40) + 60,
      kpiTarget: 80,
      joinedDate: '2023-06-01',
      status: 'ACTIVE'
    });
  }
  return employees;
};

export const MOCK_EMPLOYEES = generateEmployees();

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'برج تكوين السكني', 
    client: 'شركة الإعمار العقارية', 
    budget: 5000000, 
    status: 'ACTIVE', 
    deadline: '2025-12-01', 
    managerId: 'emp-1', 
    departmentId: 'arch', 
    progress: 35,
    milestones: [
      { id: 'm1', label: 'تجهيز المخططات المبدئية', status: 'COMPLETED', date: '2024-01-10' },
      { id: 'm2', label: 'اعتماد التصاميم الإنشائية', status: 'COMPLETED', date: '2024-03-25' },
      { id: 'm3', label: 'بدء أعمال الأساسات', status: 'CURRENT', date: '2024-05-15' },
      { id: 'm4', label: 'الانتهاء من الهيكل الخرساني', status: 'PENDING', date: '2024-11-20' },
      { id: 'm5', label: 'التشطيبات النهائية والتسليم', status: 'PENDING', date: '2025-12-01' }
    ]
  },
  { 
    id: 'proj-2', 
    name: 'فيلا رويال - دبي', 
    client: 'الشيخ محمد بن راشد', 
    budget: 1200000, 
    status: 'ACTIVE', 
    deadline: '2024-10-15', 
    managerId: 'emp-2', 
    departmentId: 'interior', 
    progress: 60,
    milestones: [
      { id: 'm1', label: 'التصميم الداخلي والمود بورد', status: 'COMPLETED', date: '2023-11-05' },
      { id: 'm2', label: 'توريد المواد والمعدات', status: 'COMPLETED', date: '2024-02-15' },
      { id: 'm3', label: 'أعمال الديكور والأسقف', status: 'CURRENT', date: '2024-06-01' },
      { id: 'm4', label: 'تأثيث وتجهيز نهائي', status: 'PENDING', date: '2024-10-15' }
    ]
  },
  { 
    id: 'proj-3', 
    name: 'مجمع واحة العلوم', 
    client: 'جامعة البحرين', 
    budget: 8500000, 
    status: 'ACTIVE', 
    deadline: '2026-05-20', 
    managerId: 'emp-1', 
    departmentId: 'struct', 
    progress: 0,
    milestones: [
      { id: 'm1', label: 'توقيع العقد واستلام الموقع', status: 'CURRENT', date: '2024-05-20' },
      { id: 'm2', label: 'المخططات التنفيذية Shop Drawings', status: 'PENDING', date: '2024-08-15' },
      { id: 'm3', label: 'بدء أعمال الحفر', status: 'PENDING', date: '2024-10-01' }
    ]
  }
];

export const MOCK_SPRINTS: Sprint[] = [
  { id: 'spr-1', name: 'تصاميم الأساسات - المرحلة 1', startDate: '2024-05-01', endDate: '2024-05-30', status: 'ACTIVE', projectId: 'proj-1' },
  { id: 'spr-2', name: 'الديكور الداخلي - الجناح الملكي', startDate: '2024-06-01', endDate: '2024-06-15', status: 'PLANNED', projectId: 'proj-2' }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'تصميم واجهة المبنى الإداري',
    description: 'مراجعة المخططات النهائية لواجهة المبنى الرئيسي في مشروع برج تكوين.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignedTo: 'emp-1',
    departmentId: 'arch',
    projectId: 'proj-1',
    dueDate: '2024-05-30',
    estimatedHours: 20,
    actualHours: 5,
    comments: [],
    attachments: [],
    kpiPoints: 50,
    weight: 20
  }
];
