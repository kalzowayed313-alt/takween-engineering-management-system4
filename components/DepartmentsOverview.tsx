
import React, { useMemo } from 'react';
import { Building2, Users, CheckCircle2, AlertCircle, Trophy, ArrowRight, Zap } from 'lucide-react';
import { DEPARTMENTS } from '../constants';
import { Employee, Task, TaskStatus } from '../types';
/* Fixed: Ensured useNavigate is imported from react-router-dom correctly */
import { useNavigate } from 'react-router-dom';

interface DepartmentsOverviewProps {
  employees: Employee[];
  tasks: Task[];
}

const DepartmentsOverview: React.FC<DepartmentsOverviewProps> = ({ employees, tasks }) => {
  const navigate = useNavigate();

  const departmentData = useMemo(() => {
    const data = DEPARTMENTS.map(dept => {
      const deptEmployees = employees.filter(e => e.departmentId === dept.id);
      const deptTasks = tasks.filter(t => t.departmentId === dept.id);
      const remainingTasks = deptTasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
      
      const avgKpi = deptEmployees.length > 0 
        ? (deptEmployees.reduce((acc, emp) => acc + emp.kpi, 0) / deptEmployees.length)
        : 0;

      return {
        ...dept,
        staffCount: deptEmployees.length,
        totalTasks: deptTasks.length,
        remainingTasks,
        avgKpi: parseFloat(avgKpi.toFixed(1))
      };
    });

    // Find the department with the highest KPI
    const maxKpi = Math.max(...data.map(d => d.avgKpi));
    return data.map(d => ({
      ...d,
      isTopPerformer: d.avgKpi === maxKpi && maxKpi > 0
    }));
  }, [employees, tasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">هيكل الأقسام والأداء</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">تحليل تشغيلي متقدم لتوزيع القوى العاملة والمهام المتبقية</p>
        </div>
        <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <Zap size={20} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">أقسام نشطة: {DEPARTMENTS.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentData.map(dept => (
          <div 
            key={dept.id}
            className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 transition-all duration-300 p-8 flex flex-col group relative overflow-hidden ${
              dept.isTopPerformer 
              ? 'border-blue-600 shadow-2xl shadow-blue-100 dark:shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/10' 
              : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
            }`}
          >
            {dept.isTopPerformer && (
              <div className="absolute top-0 left-0 bg-blue-600 text-white px-6 py-2 rounded-br-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Trophy size={14} /> القسم المتميز
              </div>
            )}

            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white group-hover:scale-110 transition-transform`}>
                <Building2 size={32} style={{ color: dept.color }} />
              </div>
              {dept.isTopPerformer && (
                <div className="animate-bounce">
                  <Trophy size={40} className="text-amber-500 drop-shadow-lg" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{dept.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">إحصائيات القسم التشغيلية</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Users size={14} />
                  <span className="text-[10px] font-bold uppercase">الموظفين</span>
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-white">{dept.staffCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase">مهام متبقية</span>
                </div>
                <p className="text-xl font-black text-rose-600">{dept.remainingTasks}</p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">متوسط أداء القسم (KPI)</span>
                <span className={`text-sm font-black ${dept.isTopPerformer ? 'text-blue-600' : 'text-slate-800 dark:text-white'}`}>
                  {dept.avgKpi}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${dept.isTopPerformer ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-300'}`} 
                  style={{ width: `${dept.avgKpi}%` }}
                ></div>
              </div>

              <button 
                onClick={() => navigate('/analytics')}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                  dept.isTopPerformer 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                عرض التحليلات التفصيلية <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-black mb-2">كيف يتم احتساب القسم المتميز؟</h3>
            <p className="text-slate-400 max-w-xl leading-relaxed">
              يتم احتساب التميز بناءً على متوسط إنتاجية موظفي القسم (KPI) خلال الدورة الحالية. الأقسام التي تظهر الكأس هي الأعلى إنجازاً للمهام المعقدة في الوقت المحدد.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">المهام المكتملة كلياً</p>
              <p className="text-3xl font-black text-emerald-400">
                {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsOverview;
