
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Users, BarChart3, 
  Settings, LogOut, Moon, Sun, Briefcase, Calendar, 
  Clock, History, Bell, Search, Menu, Construction,
  Archive, PlusCircle
} from 'lucide-react';

import { Task, Employee, Department, Project, Sprint, LeaveRequest, Role } from './types';
import { DEPARTMENTS, MOCK_EMPLOYEES, MOCK_TASKS, MOCK_PROJECTS, MOCK_SPRINTS, INITIAL_KPI_RULES } from './constants';

import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import EmployeeDirectory from './components/EmployeeDirectory';
import KPIAnalytics from './components/KPIAnalytics';
import ProjectsList from './components/ProjectsList';
import AttendanceSystem from './components/AttendanceSystem';
import LeaveRequests from './components/LeaveRequests';
import SettingsPage from './components/SettingsPage';
import SprintManager from './components/SprintManager';
import SiteReports from './components/SiteReports';
import ArchivePage from './components/ArchivePage';
import Login from './components/Login';

import TaskModal from './components/modals/TaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';
import EmployeeDetailModal from './components/modals/EmployeeDetailModal';
import PermissionModal from './components/modals/PermissionModal';

const App: React.FC = () => {
  // تحميل البيانات من LocalStorage أو استخدام البيانات الافتراضية
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('takween_employees');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('takween_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('takween_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const saved = localStorage.getItem('takween_sprints');
    return saved ? JSON.parse(saved) : MOCK_SPRINTS;
  });

  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [kpiRules, setKpiRules] = useState(INITIAL_KPI_RULES);
  
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('takween_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [preselectedProjectId, setPreselectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // حفظ البيانات تلقائياً عند أي تغيير
  useEffect(() => {
    localStorage.setItem('takween_employees', JSON.stringify(employees));
    localStorage.setItem('takween_tasks', JSON.stringify(tasks));
    localStorage.setItem('takween_projects', JSON.stringify(projects));
    localStorage.setItem('takween_sprints', JSON.stringify(sprints));
    if (currentUser) {
      localStorage.setItem('takween_session', JSON.stringify(currentUser));
    }
  }, [employees, tasks, projects, sprints, currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (user: Employee) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('takween_session');
  };

  const handleRegister = (name: string, email: string, password: string) => {
    const newUser: Employee = {
      id: `emp-${Date.now()}`,
      name, email, password,
      role: Role.EMPLOYEE,
      departmentId: 'arch',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`,
      kpi: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    setEmployees(prev => [...prev, newUser]);
    return newUser;
  };

  const openTaskModalWithProject = (projectId: string) => {
    setPreselectedProjectId(projectId);
    setIsTaskModalOpen(true);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} employees={employees} onRegister={handleRegister} />;
  }

  const isManager = currentUser.role === Role.ADMIN || currentUser.role === Role.DEPT_MANAGER || currentUser.role === Role.TEAM_LEADER;

  return (
    <Router>
      <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed right-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 transition-all duration-300 z-50 flex flex-col`}>
          <div className="p-6 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">T</div>
              <h1 className="font-black text-xl tracking-tighter">تكوين</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem to="/" icon={LayoutDashboard} label="لوحة التحكم" isOpen={isSidebarOpen} />
            <SidebarItem to="/tasks" icon={CheckSquare} label="المهام" isOpen={isSidebarOpen} />
            <SidebarItem to="/projects" icon={Briefcase} label="المشاريع" isOpen={isSidebarOpen} />
            <SidebarItem to="/sprints" icon={Calendar} label="السبرنتات" isOpen={isSidebarOpen} />
            <SidebarItem to="/analytics" icon={BarChart3} label="التحليلات" isOpen={isSidebarOpen} />
            <SidebarItem to="/employees" icon={Users} label="الموظفين" isOpen={isSidebarOpen} />
            <SidebarItem to="/attendance" icon={Clock} label="الحضور" isOpen={isSidebarOpen} />
            <SidebarItem to="/leaves" icon={History} label="الإجازات" isOpen={isSidebarOpen} />
            <SidebarItem to="/site-reports" icon={Construction} label="تقارير الموقع" isOpen={isSidebarOpen} />
            <SidebarItem to="/archive" icon={Archive} label="الأرشيف" isOpen={isSidebarOpen} />
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <SidebarItem to="/settings" icon={Settings} label="الإعدادات" isOpen={isSidebarOpen} />
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm">
              <LogOut size={20} /> <span className={!isSidebarOpen ? 'hidden' : ''}>خروج</span>
            </button>
          </div>
        </aside>

        <main className={`flex-1 ${isSidebarOpen ? 'mr-64' : 'mr-20'} p-8 transition-all duration-300`}>
          <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full max-w-xl">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="ابحث هنا..." className="bg-transparent border-none outline-none w-full text-sm font-medium" />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-3 pr-4 border-r dark:border-slate-800">
                <div className="text-left ml-3">
                  <p className="text-sm font-black dark:text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{currentUser.role}</p>
                </div>
                <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover shadow-md" alt="" />
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} employees={employees} departments={departments} projects={projects} onTaskClick={setSelectedTask} />} />
            <Route path="/tasks" element={<KanbanBoard tasks={tasks} setTasks={setTasks} onTaskClick={setSelectedTask} currentUser={currentUser} employees={employees} />} />
            <Route path="/projects" element={<ProjectsList projects={projects} tasks={tasks} employees={employees} setProjects={setProjects} setTasks={setTasks} currentUser={currentUser} onAccessDeny={() => setIsPermissionModalOpen(true)} openTaskModalWithProject={openTaskModalWithProject} />} />
            <Route path="/sprints" element={<SprintManager projects={projects} sprints={sprints} setSprints={setSprints} currentUser={currentUser} />} />
            <Route path="/analytics" element={<KPIAnalytics employees={employees} tasks={tasks} departments={departments} onUpdateDepartments={setDepartments} />} />
            <Route path="/employees" element={<EmployeeDirectory employees={employees.filter(e => e.status === 'ACTIVE')} pendingEmployees={employees.filter(e => e.status === 'PENDING')} currentUser={currentUser} onEmployeeClick={setSelectedEmployee} onApprove={(id, role, dept) => setEmployees(prev => prev.map(e => e.id === id ? {...e, role, departmentId: dept, status: 'ACTIVE'} : e))} onAccessDeny={() => setIsPermissionModalOpen(true)} />} />
            <Route path="/attendance" element={<AttendanceSystem currentUser={currentUser} employees={employees} />} />
            <Route path="/leaves" element={<LeaveRequests currentUser={currentUser} employees={employees} requests={leaveRequests} setRequests={setLeaveRequests} onAddRequest={(req) => setLeaveRequests(prev => [req, ...prev])} />} />
            <Route path="/site-reports" element={<SiteReports projects={projects} currentUser={currentUser} employees={employees} />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/settings" element={<SettingsPage currentUser={currentUser} onUpdateUser={(data) => setCurrentUser(prev => prev ? {...prev, ...data} : null)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} kpiRules={kpiRules} setKpiRules={setKpiRules} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => { setIsTaskModalOpen(false); setPreselectedProjectId(null); }} 
          onAdd={(task) => setTasks(prev => [task, ...prev])} 
          employees={employees} 
          projects={projects} 
          kpiRules={kpiRules} 
          initialProjectId={preselectedProjectId}
        />
        <TaskDetailModal isOpen={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={(updated) => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))} onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))} employees={employees} projects={projects} currentUser={currentUser} />
        <EmployeeDetailModal isOpen={!!selectedEmployee} employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} tasks={tasks} currentUser={currentUser} onUpdateEmployee={(id, data) => setEmployees(prev => prev.map(e => e.id === id ? {...e, ...data} : e))} onDeleteEmployee={(id) => setEmployees(prev => prev.map(e => e.id === id ? {...e, status: e.status === 'ACTIVE' ? 'PENDING' : 'ACTIVE'} : e))} onPermanentDelete={(id) => setEmployees(prev => prev.filter(e => e.id !== id))} />
        <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} />

        {isManager && (
          <button onClick={() => { setPreselectedProjectId(null); setIsTaskModalOpen(true); }} className="fixed bottom-8 left-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40 group">
            <PlusCircle size={32} />
          </button>
        )}
      </div>
    </Router>
  );
};

const SidebarItem = ({ to, icon: Icon, label, isOpen }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <Icon size={20} /> <span className={`font-bold text-sm ${!isOpen && 'hidden'}`}>{label}</span>
    </Link>
  );
};

export default App;
