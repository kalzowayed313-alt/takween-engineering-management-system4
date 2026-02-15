
import React, { useState, useMemo } from 'react';
import { Search, Archive, Users, Clock, Check, ShieldCheck, Building2, UserPlus, X, Briefcase } from 'lucide-react';
import { DEPARTMENTS } from '../constants';
import { Role, Employee } from '../types';

interface EmployeeDirectoryProps {
  employees: Employee[];
  pendingEmployees: Employee[];
  currentUser: Employee;
  onEmployeeClick: (emp: Employee) => void;
  onApprove: (id: string, role: Role, deptId: string) => void;
  onAccessDeny: () => void;
}

const RoleLabel: Record<Role, { label: string, color: string }> = {
  [Role.ADMIN]: { label: 'مدير نظام', color: 'bg-rose-100 text-rose-700' },
  [Role.DEPT_MANAGER]: { label: 'مدير قسم', color: 'bg-indigo-100 text-indigo-700' },
  [Role.TEAM_LEADER]: { label: 'قائد فريق', color: 'bg-blue-100 text-blue-700' },
  [Role.EMPLOYEE]: { label: 'موظف', color: 'bg-slate-100 text-slate-700' }
};

const EmployeeCard: React.FC<{ employee: Employee, onClick: () => void }> = ({ employee, onClick }) => {
  const dept = DEPARTMENTS.find(d => d.id === employee.departmentId);
  
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff`;
  };

  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-900 rounded-3xl border shadow-sm hover:shadow-2xl transition-all p-6 group cursor-pointer active:scale-95 border-b-4 border-transparent hover:border-blue-600">
      <div className="flex items-start justify-between mb-4">
        <img 
          src={employee.avatar} 
          onError={handleImgError}
          alt="" 
          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm" 
        />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RoleLabel[employee.role].color}`}>
          {RoleLabel[employee.role].label}
        </span>
      </div>
      <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">{employee.name}</h3>
      <p className="text-[10px] text-slate-400 font-bold mb-4">{dept?.name}</p>
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100">
        <p className="text-[9px] text-slate-400 font-bold uppercase">KPI</p>
        <p className="font-bold text-slate-700 dark:text-slate-300">{employee.kpi}%</p>
      </div>
    </div>
  );
};

const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ employees, pendingEmployees, currentUser, onEmployeeClick, onApprove, onAccessDeny }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');
  const [approvalData, setApprovalData] = useState<Record<string, { role: Role, dept: string }>>({});

  const isAdmin = currentUser.role === Role.ADMIN;

  const handleApprove = (id: string) => {
    const data = approvalData[id] || { role: Role.EMPLOYEE, dept: DEPARTMENTS[0].id };
    onApprove(id, data.role, data.dept);
  };

  const updateApprovalData = (id: string, field: 'role' | 'dept', value: string) => {
    setApprovalData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { role: Role.EMPLOYEE, dept: DEPARTMENTS[0].id }),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">دليل الكادر البشري</h2>
          <p className="text-slate-500">إدارة الطاقم الهندسي وطلبات الانضمام الجديدة</p>
        </div>
        {isAdmin && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('ACTIVE')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Users size={14}/> النشطون</button>
            <button onClick={() => setActiveTab('PENDING')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'PENDING' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              <Clock size={14}/> الطلبات 
              {pendingEmployees.length > 0 && <span className="bg-rose-500 text-white text-[9px] px-1.5 rounded-full">{pendingEmployees.length}</span>}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'ACTIVE' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {employees.map(emp => <EmployeeCard key={emp.id} employee={emp} onClick={() => onEmployeeClick(emp)} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEmployees.length > 0 ? pendingEmployees.map(emp => {
            const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&color=fff`;
            };
            return (
              <div key={emp.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4">
                  <img src={emp.avatar} onError={handleImgError} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white">{emp.name}</h4>
                    <p className="text-xs text-blue-600 font-bold">{emp.email}</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 max-w-xl w-full">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">تحديد القسم</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold dark:text-white"
                      value={approvalData[emp.id]?.dept || DEPARTMENTS[0].id}
                      onChange={e => updateApprovalData(emp.id, 'dept', e.target.value)}
                    >
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">تحديد الرتبة</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold dark:text-white"
                      value={approvalData[emp.id]?.role || Role.EMPLOYEE}
                      onChange={e => updateApprovalData(emp.id, 'role', e.target.value as Role)}
                    >
                      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => handleApprove(emp.id)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2">
                  <ShieldCheck size={16} /> اعتماد الانضمام
                </button>
              </div>
            );
          }) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50">
              <Clock size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">لا توجد طلبات معلقة حالياً</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
