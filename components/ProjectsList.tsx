
import React, { useState, useMemo } from 'react';
import { Project, Task, Employee, TaskStatus, Role, TaskPriority, Milestone } from '../types';
import { 
  Briefcase, Calendar, DollarSign, ArrowRight, CheckCircle, X, 
  Building2, Plus, Save, Trash2, Cloud, 
  ArrowLeft, Milestone as MilestoneIcon, Activity,
  CheckCircle2
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';

const ProjectCard: React.FC<{ 
  project: Project, 
  projectTasks: Task[], 
  projectEmployees: Employee[],
  isLocked: boolean,
  onViewDetails: (proj: Project) => void,
  onAccessDeny: () => void
}> = ({ project, projectTasks, projectEmployees, isLocked, onViewDetails, onAccessDeny }) => {
  const progressPercent = useMemo(() => {
    if (projectTasks.length > 0) {
      const totalWeight = projectTasks.reduce((acc, t) => acc + (t.weight || 0), 0);
      const completedWeight = projectTasks
        .filter(t => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + (t.weight || 0), 0);
      return Math.round((completedWeight / totalWeight) * 100);
    }
    return project.progress || 0;
  }, [projectTasks, project.progress]);
  
  return (
    <div 
      onClick={() => isLocked ? onAccessDeny() : onViewDetails(project)}
      className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group flex flex-col h-full relative overflow-hidden cursor-pointer ${isLocked ? 'grayscale opacity-60' : 'hover:shadow-2xl hover:border-blue-200'}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Briefcase size={24} />
          </div>
          <div className="flex gap-2">
            {project.driveFolderUrl && <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg" title="مرتبط بـ Google Drive"><Cloud size={14} /></div>}
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
              project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {project.status === 'ACTIVE' ? 'نشط' : 'معلق'}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-black mb-1 text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{project.name}</h3>
        <p className="text-xs text-slate-400 font-bold mb-4 flex items-center gap-1"><Building2 size={12} /> {project.client}</p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter">
            <span className="text-slate-400">الإنجاز الفني</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">تاريخ التسليم</span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs font-black tabular-nums">{project.deadline}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">الميزانية</span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="text-xs font-black tabular-nums">{(project.budget/1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {projectEmployees.slice(0, 3).map(emp => (
              <img key={emp.id} src={emp.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" alt=""/>
            ))}
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black group-hover:bg-blue-600 transition-all shadow-lg">
             <ArrowRight size={16} /> إدارة المشروع
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectManagementView: React.FC<{
  project: Project,
  tasks: Task[],
  employees: Employee[],
  onBack: () => void,
  onAddTask: (projectId: string) => void,
  onUpdateProject: (proj: Project) => void
}> = ({ project, tasks, employees, onBack, onAddTask, onUpdateProject }) => {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(new Date().toISOString().split('T')[0]);

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = projectTasks.filter(t => t.status === TaskStatus.COMPLETED);
  const projectEmployees = employees.filter(e => projectTasks.some(t => t.assignedTo === e.id) || e.id === project.managerId);
  
  const progress = useMemo(() => {
    if (projectTasks.length > 0) {
      const totalWeight = projectTasks.reduce((acc, t) => acc + (t.weight || 0), 0);
      const completedWeight = projectTasks
        .filter(t => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + (t.weight || 0), 0);
      return Math.round((completedWeight / totalWeight) * 100);
    }
    return project.progress || 0;
  }, [projectTasks, project.progress]);

  const handleAddMilestone = () => {
    if (!newMilestoneLabel.trim()) return;
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      label: newMilestoneLabel,
      date: newMilestoneDate,
      status: 'PENDING'
    };
    onUpdateProject({
      ...project,
      milestones: [...(project.milestones || []), newM]
    });
    setNewMilestoneLabel('');
    setIsAddingMilestone(false);
  };

  const toggleMilestoneStatus = (mId: string) => {
    const updatedMilestones = (project.milestones || []).map(m => {
      if (m.id === mId) {
        const nextStatus: any = m.status === 'PENDING' ? 'CURRENT' : m.status === 'CURRENT' ? 'COMPLETED' : 'PENDING';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    onUpdateProject({ ...project, milestones: updatedMilestones });
  };

  const deleteMilestone = (mId: string) => {
    const updatedMilestones = (project.milestones || []).filter(m => m.id !== mId);
    onUpdateProject({ ...project, milestones: updatedMilestones });
  };

  const manager = employees.find(e => e.id === project.managerId);

  return (
    <div className="space-y-10 animate-in slide-in-from-left duration-500 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">{project.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1">
               <span className="flex items-center gap-1"><Building2 size={14} /> {project.client}</span>
               <span className="opacity-30">•</span>
               <span className="flex items-center gap-1"><Calendar size={14} /> التسليم: {project.deadline}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {project.driveFolderUrl && (
            <a href={project.driveFolderUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-black hover:shadow-lg transition-all border border-indigo-100 dark:border-indigo-800">
               <Cloud size={18} /> مجلد المخططات
            </a>
          )}
          <button 
            onClick={() => onAddTask(project.id)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
             <Plus size={18} /> إسناد عمل جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الإنجاز الفعلي</p>
                 <p className="text-3xl font-black text-blue-600 tabular-nums">{progress}%</p>
                 <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الميزانية المستهلكة</p>
                 <p className="text-3xl font-black text-emerald-600 tabular-nums">42%</p>
                 <p className="text-[10px] text-slate-400 font-bold mt-2 italic">ميزانية إجمالية: {project.budget.toLocaleString()} ريال</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">مهام قيد العمل</p>
                 <p className="text-3xl font-black text-amber-500 tabular-nums">{projectTasks.length - completedTasks.length}</p>
                 <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">من أصل {projectTasks.length} مهام</p>
              </div>
           </div>

           {/* Milestone Timeline */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <MilestoneIcon className="text-blue-600" size={22} /> الجدول الزمني للمشروع (Milestones)
                </h3>
                <button 
                  onClick={() => setIsAddingMilestone(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Plus size={14} /> إضافة مرحلة
                </button>
              </div>
              
              <div className="space-y-8 relative">
                <div className="absolute top-0 bottom-0 right-4 w-1 bg-slate-50 dark:bg-slate-800 rounded-full"></div>
                
                {isAddingMilestone && (
                  <div className="relative pr-12 animate-in slide-in-from-right duration-300">
                    <div className="absolute right-2 top-2 w-5 h-5 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900 z-10 shadow-sm"></div>
                    <div className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/20 space-y-4">
                       <input 
                         autoFocus
                         className="w-full bg-transparent border-b border-blue-200 outline-none font-bold text-sm dark:text-white" 
                         placeholder="اسم المرحلة (مثلاً: الانتهاء من الهيكل الخرساني)"
                         value={newMilestoneLabel}
                         onChange={e => setNewMilestoneLabel(e.target.value)}
                       />
                       <div className="flex items-center gap-4">
                         <input type="date" className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg text-[10px] font-bold outline-none border border-slate-200 dark:border-slate-700 dark:text-white" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} />
                         <button onClick={handleAddMilestone} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black">حفظ المرحلة</button>
                         <button onClick={() => setIsAddingMilestone(false)} className="text-slate-400 text-[10px] font-bold">إلغاء</button>
                       </div>
                    </div>
                  </div>
                )}

                {(project.milestones || []).length > 0 ? (
                  project.milestones?.map((m, i) => (
                    <div key={m.id} className="relative pr-12 group animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                       <div 
                         onClick={() => toggleMilestoneStatus(m.id)}
                         className={`absolute right-2.5 top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-sm cursor-pointer hover:scale-125 transition-transform ${
                         m.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : m.status === 'CURRENT' ? 'bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-slate-300 dark:bg-slate-700'
                       }`}></div>
                       
                       <div className={`p-6 rounded-2xl border transition-all relative ${
                         m.status === 'CURRENT' ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-blue-100/50' : 'bg-slate-50/30 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                       }`}>
                          <button 
                            onClick={() => deleteMilestone(m.id)}
                            className="absolute top-2 left-2 p-2 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleMilestoneStatus(m.id)}>
                             <div>
                               <h4 className={`text-sm font-black ${m.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                 {m.label}
                               </h4>
                               <div className="flex items-center gap-2 mt-1">
                                  {m.status === 'CURRENT' && <span className="text-[10px] font-bold text-blue-600">المرحلة الجارية الآن</span>}
                                  {m.status === 'COMPLETED' && <span className="text-[10px] font-bold text-emerald-600">تم الإنجاز بنجاح</span>}
                                  {m.status === 'PENDING' && <span className="text-[10px] font-bold text-slate-400">مرحلة قادمة</span>}
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 tabular-nums">{m.date}</p>
                               {m.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-emerald-500 mr-auto mt-1" />}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                ) : !isAddingMilestone && (
                  <div className="py-10 text-center text-slate-400 font-bold italic">لا توجد مراحل زمنية محددة لهذا المشروع بعد</div>
                )}
              </div>
           </div>
        </div>

        {/* Right Column: Manager & Team */}
        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 مدير المشروع
              </h3>
              <div className="flex items-center gap-4">
                 <img src={manager?.avatar} className="w-16 h-16 rounded-2xl border-2 border-white/20 object-cover shadow-2xl" alt="" />
                 <div>
                    <p className="text-lg font-black">{manager?.name}</p>
                    <p className="text-xs text-blue-400 font-bold">{manager?.email}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                 <span>الفريق الهندسي</span>
                 <span className="text-[10px] text-slate-400">نشط: {projectEmployees.length}</span>
              </h3>
              <div className="space-y-4">
                 {projectEmployees.map(emp => (
                   <div key={emp.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" />
                         <div className="text-right">
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">{emp.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{DEPARTMENTS.find(d => d.id === emp.departmentId)?.name}</p>
                         </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500 shadow-emerald-500/50 shadow-md' : 'bg-slate-300'}`}></div>
                   </div>
                 ))}
                 <button 
                  onClick={() => onAddTask(project.id)}
                  className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
                 >
                    + إضافة مهندس للفريق
                 </button>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                 <Activity size={18} className="text-emerald-500" /> الحالة الصحية للمشروع
              </h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-slate-400">جودة التصاميم</span>
                       <span className="text-emerald-600">ممتازة</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '90%' }}></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-slate-400">الالتزام بالوقت</span>
                       <span className="text-amber-500">متوسط</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500" style={{ width: '65%' }}></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const NewProjectModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (p: Project) => void,
  employees: Employee[] 
}> = ({ isOpen, onClose, onAdd, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    budget: 1000000,
    deadline: new Date().toISOString().split('T')[0],
    managerId: employees[0]?.id || '',
    departmentId: employees[0]?.departmentId || 'arch',
    driveFolderUrl: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `proj-${Date.now()}`,
      ...formData,
      status: 'ACTIVE',
      progress: 0,
      milestones: [
        { id: 'm1', label: 'بدء المشروع وتجهيز المخططات', status: 'CURRENT', date: new Date().toISOString().split('T')[0] }
      ]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in zoom-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-10 border border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-black text-slate-800 dark:text-white">إطلاق مشروع هندسي جديد</h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto custom-scrollbar px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">اسم المشروع</label>
              <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">رابط Google Drive للمشروع</label>
              <div className="relative">
                <Cloud className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input type="url" placeholder="https://drive.google.com/..." className="w-full pr-12 pl-4 py-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-xs font-bold outline-none dark:text-white" value={formData.driveFolderUrl} onChange={e => setFormData({...formData, driveFolderUrl: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">العميل</label>
              <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none dark:text-white" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">مدير المشروع المسؤول</label>
              <select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none dark:text-white">
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">الميزانية التقديرية</label>
                <input required type="number" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl text-sm font-bold dark:text-white" value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">موعد التسليم</label>
                <input required type="date" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl text-sm font-bold dark:text-white" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95">
             <CheckCircle size={20} /> إطلاق المشروع والأرشفة السحابية
          </button>
        </form>
      </div>
    </div>
  );
};

interface ProjectsListProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: Employee;
  onAccessDeny: () => void;
  openTaskModalWithProject: (projectId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, tasks, employees, setProjects, setTasks, currentUser, onAccessDeny, openTaskModalWithProject }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    setSelectedProject(updatedProj);
  };

  const handleAddProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
  };

  if (selectedProject) {
    return (
      <ProjectManagementView 
        project={selectedProject}
        tasks={tasks}
        employees={employees}
        onBack={() => setSelectedProject(null)}
        onAddTask={openTaskModalWithProject}
        onUpdateProject={handleUpdateProject}
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">محفظة المشاريع الهندسية</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">إدارة مركزية تربط التصاميم الإنشائية بمستودعات Google Drive</p>
        </div>
        {currentUser.role === Role.ADMIN && (
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>إطلاق مشروع جديد</span>
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => {
          const projectTasks = tasks.filter(t => t.projectId === p.id);
          const projectEmployees = employees.filter(e => projectTasks.some(t => t.assignedTo === e.id) || e.id === p.managerId);
          const isLocked = currentUser.role !== Role.ADMIN && p.departmentId !== currentUser.departmentId;

          return (
            <ProjectCard 
              key={p.id} 
              project={p} 
              projectTasks={projectTasks} 
              projectEmployees={projectEmployees} 
              isLocked={isLocked}
              onViewDetails={setSelectedProject}
              onAccessDeny={onAccessDeny}
            />
          );
        })}
      </div>

      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onAdd={handleAddProject}
        employees={employees}
      />
    </div>
  );
};

export default ProjectsList;
