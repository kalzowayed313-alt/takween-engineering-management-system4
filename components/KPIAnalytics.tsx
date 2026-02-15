
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Line, ComposedChart
} from 'recharts';
import { 
  TrendingUp, Target, BrainCircuit, Sparkles, 
  BarChart3, Activity, Zap, Users, Building2, 
  ArrowUpRight, ArrowDownRight, Award, RefreshCw, Save, Check, CheckCircle2, Flag
} from 'lucide-react';
import { Task, Employee, TaskStatus, Department } from '../types';
import { analyzePerformance } from '../services/geminiService';

interface KPIAnalyticsProps {
  employees: Employee[];
  tasks: Task[];
  departments: Department[];
  onUpdateDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
}

const KPIAnalytics: React.FC<KPIAnalyticsProps> = ({ employees, tasks, departments, onUpdateDepartments }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'targets'>('overview');
  const [mounted, setMounted] = useState(false);
  
  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialTargets: Record<string, number> = {};
    departments.forEach(d => {
      initialTargets[d.id] = d.kpiTarget || 80;
    });
    setLocalTargets(initialTargets);
  }, [departments]);

  const companyStats = useMemo(() => {
    if (!employees.length) return { avgKpi: 0, productivityRate: 0, totalEmployees: 0, activeTasks: 0 };
    const avgKpi = employees.reduce((acc, e) => acc + e.kpi, 0) / employees.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const productivityRate = (completedTasks / (tasks.length || 1)) * 100;
    
    return {
      avgKpi: Math.round(avgKpi),
      productivityRate: Math.round(productivityRate),
      totalEmployees: employees.length,
      activeTasks: tasks.filter(t => t.status !== TaskStatus.COMPLETED).length
    };
  }, [employees, tasks]);

  const departmentPerformanceData = useMemo(() => {
    return departments.map(dept => {
      const deptEmps = employees.filter(e => e.departmentId === dept.id);
      const actual = deptEmps.length > 0 ? deptEmps.reduce((acc, e) => acc + e.kpi, 0) / deptEmps.length : 0;
      const target = dept.kpiTarget || 80;
      return {
        name: dept.name.replace('قسم ', ''),
        الفعلي: Math.round(actual),
        المستهدف: target,
        gap: Math.round(actual - target)
      };
    });
  }, [employees, departments]);

  const selectedEmployee = useMemo(() => employees.find(e => e.id === selectedEmpId) || employees[0], [selectedEmpId, employees]);
  const empTasks = useMemo(() => tasks.filter(t => t.assignedTo === selectedEmpId), [selectedEmpId, tasks]);

  const handleAiAnalysis = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    const analysis = await analyzePerformance(selectedEmployee, empTasks);
    setAiReport(analysis);
    setIsLoading(false);
  };

  const handleTargetChange = (deptId: string, val: number) => {
    setLocalTargets(prev => ({ ...prev, [deptId]: val }));
    setSaveSuccess(false);
  };

  const handleSaveAllTargets = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    onUpdateDepartments(prev => prev.map(d => ({
      ...d,
      kpiTarget: localTargets[d.id] || d.kpiTarget
    })));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  if (!employees.length) return <div className="p-20 text-center text-slate-400">لا توجد بيانات موظفين لعرضها.</div>;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit mx-auto border border-slate-200 dark:border-slate-800 shadow-sm">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500'}`}
        >
          <BarChart3 size={16} /> نظرة عامة
        </button>
        <button 
          onClick={() => setActiveTab('targets')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'targets' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500'}`}
        >
          <Target size={16} /> مراقبة الأهداف
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><Target size={24} /></div>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold"><ArrowUpRight size={14}/> 2.4%</div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">متوسط KPI الشركة</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{companyStats.avgKpi}%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><Zap size={24} /></div>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold"><ArrowUpRight size={14}/> 12%</div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">معدل الإنجاز الكلي</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{companyStats.productivityRate}%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><Users size={24} /></div>
                <div className="text-[10px] font-bold text-slate-400">نشط الآن</div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">إجمالي الكادر</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{companyStats.totalEmployees}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl"><Activity size={24} /></div>
                <div className="flex items-center gap-1 text-rose-500 text-[10px] font-bold"><ArrowDownRight size={14}/> 4.1%</div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">مهام قيد العمل</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{companyStats.activeTasks}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-w-0">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><TrendingUp size={20} className="text-blue-600" /> تحليل الفجوة في أداء الأقسام</h3>
                 <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div><span className="text-[10px] font-black text-slate-400 uppercase">الفعلي</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div><span className="text-[10px] font-black text-slate-400 uppercase">المستهدف</span></div>
                 </div>
               </div>
               <div className="h-[300px] min-h-[300px] min-w-0">
                 {mounted && (
                   <ResponsiveContainer width="100%" height="100%" debounce={100}>
                     <ComposedChart data={departmentPerformanceData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                       <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                       <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                       <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                       <Bar dataKey="الفعلي" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                       <Line type="monotone" dataKey="المستهدف" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e'}} />
                     </ComposedChart>
                   </ResponsiveContainer>
                 )}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 mb-8"><Award size={20} className="text-amber-500" /> الموظفين المتميزين (تجاوز الأهداف)</h3>
              <div className="space-y-4">
                {employees.filter(e => e.kpi >= (e.kpiTarget || 80)).sort((a,b) => b.kpi - a.kpi).slice(0, 5).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{departments.find(d => d.id === emp.departmentId)?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-emerald-600">{emp.kpi}%</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">الهدف: {emp.kpiTarget}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl animate-in zoom-in duration-300">
           <div className="flex justify-between items-start mb-10">
             <div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white">إدارة مستهدفات الأداء</h3>
               <p className="text-slate-500 font-medium">تحديد الأهداف الشهرية لكل قسم ومتابعة التقدم المحرز</p>
             </div>
             <button 
                onClick={handleSaveAllTargets}
                disabled={isSaving}
                className={`px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center gap-3 active:scale-95 ${
                  saveSuccess 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-70`}
             >
               {isSaving ? <RefreshCw className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
               {isSaving ? 'جاري الحفظ...' : saveSuccess ? 'تم الحفظ بنجاح' : 'حفظ كافة المستهدفات'}
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {departments.map(dept => {
               const deptEmps = employees.filter(e => e.departmentId === dept.id);
               const avgActual = deptEmps.reduce((acc, e) => acc + e.kpi, 0) / (deptEmps.length || 1);
               const currentVal = localTargets[dept.id] || dept.kpiTarget || 80;
               const progress = Math.min(100, Math.round((avgActual / currentVal) * 100));
               
               return (
                 <div key={dept.id} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm"><Building2 size={20} style={{color: dept.color}} /></div>
                          <span className="font-black text-slate-800 dark:text-white">{dept.name}</span>
                       </div>
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${progress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                         {progress}% من المستهدف
                       </span>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                         <div className="flex justify-between items-end">
                           <label className="text-[10px] font-bold text-slate-400 uppercase">المستهدف الحالي (KPI)</label>
                           <span className="text-xs font-black text-blue-600">{currentVal}%</span>
                         </div>
                         <input 
                            type="range" 
                            min="50" 
                            max="100" 
                            value={currentVal} 
                            onChange={(e) => handleTargetChange(dept.id, parseInt(e.target.value))}
                            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                         />
                       </div>

                       <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">أداء الموظفين في القسم</p>
                          <div className="space-y-2">
                             {deptEmps.slice(0, 3).map(e => (
                               <div key={e.id} className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-slate-600 dark:text-slate-300">{e.name}</span>
                                  <span className={`font-black ${e.kpi >= currentVal ? 'text-emerald-500' : 'text-rose-500'}`}>{e.kpi}%</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {selectedEmployee && activeTab === 'overview' && (
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">فحص أداء الكفاءات الفردية</h2>
              <p className="text-slate-500 font-medium">مقارنة أداء المهندس الفعلي مقابل الأهداف الشخصية الموكلة إليه</p>
            </div>
            
            <select 
              value={selectedEmpId} 
              onChange={(e) => { setSelectedEmpId(e.target.value); setAiReport(null); }}
              className="min-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-200 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <div className="relative inline-block mb-6">
                  <img src={selectedEmployee.avatar} className="w-28 h-28 rounded-[2.5rem] ring-4 ring-blue-50 dark:ring-blue-900/30 shadow-xl object-cover mx-auto" alt="" />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900"><CheckCircle2 size={18} /></div>
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">{selectedEmployee.name}</h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-400">الهدف المخطط</span>
                      <span className="font-black text-slate-800 dark:text-white">{selectedEmployee.kpiTarget}%</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <span className="font-black text-blue-600">الأداء الحالي</span>
                      <span className="font-black text-blue-700 dark:text-blue-400">{selectedEmployee.kpi}%</span>
                   </div>
                   <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedEmployee.kpi >= (selectedEmployee.kpiTarget || 80) ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-rose-500 text-white shadow-rose-200 shadow-lg'}`}>
                      {selectedEmployee.kpi >= (selectedEmployee.kpiTarget || 80) ? 'هدف محقق بنجاح' : 'تحت المراجعة والتحسين'}
                   </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20"><BrainCircuit size={28} className="text-blue-400 animate-pulse" /></div>
                    <div>
                      <h3 className="text-xl font-black">التحليل التنبؤي لـ Gemini</h3>
                      <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-1">مدعوم بـ Google AI Engine</p>
                    </div>
                  </div>
                  {!aiReport && (
                    <button onClick={handleAiAnalysis} disabled={isLoading} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2">
                      {isLoading ? <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> : <Sparkles size={16} />}
                      بدء تحليل الإنجاز
                    </button>
                  )}
                </div>

                {aiReport ? (
                  <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 animate-in zoom-in duration-500">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-blue-50/90 text-right">{aiReport}</p>
                    <button onClick={() => setAiReport(null)} className="mt-4 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest">إغلاق التقرير</button>
                  </div>
                ) : !isLoading && (
                  <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 cursor-pointer" onClick={handleAiAnalysis}>
                    <p className="text-xs text-white/40 font-bold italic">نقر لتوليد تقرير ذكي عن كيفية وصول {selectedEmployee.name} لأهدافه القادمة.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIAnalytics;
