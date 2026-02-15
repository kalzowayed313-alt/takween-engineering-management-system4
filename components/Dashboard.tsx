
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, ComposedChart, Line
} from 'recharts';
import { 
  Users, CheckSquare, TrendingUp, Calendar, Building2, Clock, ArrowLeft, 
  Trophy, Star, Sparkles, Award, AlertCircle, Zap, BrainCircuit, ArrowUpRight, 
  ChevronLeft, Timer, RefreshCw, X, BarChart3
} from 'lucide-react';
import { Task, Employee, TaskStatus, TaskPriority, Department, Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const MiniSparkline = ({ data, color }: { data: any[], color: string }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  return (
    <div className="h-10 w-20 opacity-50 min-h-[40px] min-w-0">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart data={data}>
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend, sparkData, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group relative overflow-hidden"
  >
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <MiniSparkline data={sparkData} color={color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#10b981' : '#f59e0b'} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
        {trend && (
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <ArrowUpRight size={10} className={trend < 0 ? 'rotate-90' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white tabular-nums">{value}</p>
    </div>
  </div>
);

interface DashboardProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, employees, departments, onTaskClick, projects }) => {
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ننتظر قليلاً حتى تنتهي الأنميشن الخاصة بالدخول لتجنب مشاكل Recharts
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const mockSparkData = [{ value: 400 }, { value: 300 }, { value: 500 }, { value: 450 }, { value: 600 }, { value: 550 }, { value: 700 }];

  const companyStats = useMemo(() => {
    const total = tasks.length || 1;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const overdue = tasks.filter(t => t.status !== TaskStatus.COMPLETED && new Date(t.dueDate) < new Date()).length;
    const productivity = Math.round((completed / total) * 100);
    return { productivity, overdue, total, completed };
  }, [tasks]);

  const loadBalanceData = useMemo(() => {
    return departments.map(dept => {
      const deptTasks = tasks.filter(t => t.departmentId === dept.id).length;
      const deptEmps = employees.filter(e => e.departmentId === dept.id).length;
      const loadFactor = deptEmps > 0 ? (deptTasks / deptEmps).toFixed(1) : 0;
      return {
        name: dept.name.split(' ')[1] || dept.name,
        tasks: deptTasks,
        staff: deptEmps,
        load: parseFloat(loadFactor as string) * 10 
      };
    });
  }, [tasks, employees, departments]);

  const criticalTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== TaskStatus.COMPLETED)
      .sort((a, b) => (a.priority === TaskPriority.HIGH ? -1 : 1))
      .slice(0, 4);
  }, [tasks]);

  const generateAiInsight = async () => {
    setIsAiLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `حلل بيانات الشركة الهندسية باختصار: الإنتاجية ${companyStats.productivity}%, المهام ${companyStats.total}, الموظفين ${employees.length}.`,
      });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("الوضع التشغيلي مستقر حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Zap size={20} fill="currentColor" /></div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">نظرة عامة على الإنجاز</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">متابعة الأداء الحي للمشاريع والموظفين</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={generateAiInsight} disabled={isAiLoading} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all shadow-sm">
            {isAiLoading ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={18} />} تحليل Gemini
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-4">
            <Sparkles className="shrink-0" />
            <p className="text-sm font-bold leading-relaxed">{aiInsight}</p>
            <button onClick={() => setAiInsight(null)} className="mr-auto opacity-60"><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="الإنتاجية الكلية" value={`${companyStats.productivity}%`} icon={TrendingUp} color="bg-blue-600" trend={2.4} sparkData={mockSparkData} onClick={() => navigate('/analytics')} />
        <StatCard label="الموظفين" value={employees.length} icon={Users} color="bg-indigo-600" sparkData={mockSparkData} onClick={() => navigate('/employees')} />
        <StatCard label="مهام عاجلة" value={criticalTasks.length} icon={AlertCircle} color="bg-rose-500" sparkData={mockSparkData} onClick={() => navigate('/tasks')} />
        <StatCard label="أقسام الشركة" value={departments.length} icon={Building2} color="bg-emerald-600" sparkData={mockSparkData} onClick={() => navigate('/analytics')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-8">
            <BarChart3 className="text-blue-600" size={22} /> توازن عبء العمل الهندسي
          </h3>
          <div className="h-[350px] w-full min-h-[350px] min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <ComposedChart data={loadBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                  <Line type="monotone" dataKey="load" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} /> أولويات تستوجب التدخل
            </h3>
            <div className="space-y-4">
              {criticalTasks.map(task => (
                <div key={task.id} onClick={() => onTaskClick(task)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                  <p className="text-sm font-bold group-hover:text-blue-400 transition-colors truncate">{task.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><Clock size={12} /> {task.dueDate}</span>
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">زخم المشاريع الهندسية</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">المشاريع النشطة والجديدة في المحفظة</p>
          </div>
          <Link to="/projects" className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">إدارة المحفظة</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {projects.slice(0, 3).map(proj => (
            <div key={proj.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-black text-slate-700 dark:text-slate-200">{proj.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{proj.client}</p>
                </div>
                <span className="text-2xl font-black text-blue-600 tabular-nums">{proj.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${proj.progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>تاريخ التسليم: {proj.deadline}</span>
                <div className="flex items-center gap-1 text-emerald-600">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div> نشط
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
