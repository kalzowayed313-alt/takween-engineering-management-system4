
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  X, CheckCircle, Upload, Trash2, Plus, Layout, 
  Building2, Loader2, Cloud, Check, Users, Calendar, 
  Target, Info, UserCheck, Briefcase
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Employee, Attachment, KpiRule } from '../../types';
import { DEPARTMENTS } from '../../constants';
import { driveService } from '../../services/driveService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  employees: Employee[];
  projects: any[];
  kpiRules: KpiRule[];
  initialProjectId?: string | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onAdd, employees, projects, kpiRules, initialProjectId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFilesCount, setUploadingFilesCount] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[], 
    projectId: projects[0]?.id || '',
    priority: TaskPriority.MEDIUM,
    dueDate: new Date().toISOString().split('T')[0],
    estimatedHours: 8,
    kpiPoints: 25
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        projectId: initialProjectId || projects[0]?.id || '',
        title: '',
        description: '',
        assignedTo: []
      }));
      setAttachments([]);
    }
  }, [isOpen, initialProjectId, projects]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      setUploadingFilesCount(prev => prev + files.length);
      
      for (const file of files) {
        try {
          const driveFile = await driveService.uploadFile(file);
          const newAtt: Attachment = {
            id: driveFile.id,
            name: driveFile.name,
            url: driveFile.url,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document',
            mimeType: file.type || 'application/octet-stream',
            provider: driveFile.provider,
            uploadedAt: new Date().toISOString()
          };
          setAttachments(prev => [...prev, newAtt]);
        } catch (err) {
          console.error("Upload failed:", err);
        } finally {
          setUploadingFilesCount(prev => Math.max(0, prev - 1));
        }
      }
    }
  };

  const handleEmployeeToggle = (empId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedTo.includes(empId);
      const newSelection = isSelected 
        ? prev.assignedTo.filter(id => id !== empId)
        : [...prev.assignedTo, empId];
      return { ...prev, assignedTo: newSelection };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadingFilesCount > 0) {
      alert("يرجى الانتظار حتى اكتمال رفع المخططات.");
      return;
    }

    if (!formData.title.trim()) {
      alert("يرجى إدخال عنوان المهمة.");
      return;
    }

    if (formData.assignedTo.length === 0) {
      alert("يرجى اختيار موظف واحد على الأقل.");
      return;
    }

    formData.assignedTo.forEach(empId => {
      const emp = employees.find(e => e.id === empId);
      const newTask: Task = {
        id: `task-${Date.now()}-${empId}`,
        title: formData.title,
        description: formData.description,
        status: TaskStatus.NEW,
        priority: formData.priority,
        assignedTo: empId,
        departmentId: emp?.departmentId || 'arch',
        projectId: formData.projectId,
        dueDate: formData.dueDate,
        estimatedHours: formData.estimatedHours,
        actualHours: 0,
        attachments: [...attachments],
        comments: [],
        kpiPoints: formData.kpiPoints,
        weight: 10
      };
      onAdd(newTask);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/10">
        
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl">
              <Plus size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">إسناد مهام هندسية</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">توزيع العمل وتحديد مستهدفات الأداء</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Info size={18} />
                  <h4 className="text-xs font-black uppercase tracking-widest">بيانات المهمة الأساسية</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">عنوان المهمة</label>
                    <input required type="text" placeholder="مثلاً: مراجعة المخططات الإنشائية" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">المشروع الهندسي</label>
                    <div className="relative">
                      <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none dark:text-white appearance-none cursor-pointer" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">وصف العمل والمتطلبات الفنية</label>
                  <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] font-medium outline-none focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white" placeholder="اكتب تفاصيل المهمة والنتائج المتوقعة..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Cloud size={18} />
                  <h4 className="text-xs font-black uppercase tracking-widest">المرفقات والمخططات (Google Drive)</h4>
                </div>
                <div onClick={() => uploadingFilesCount === 0 && fileInputRef.current?.click()} className={`border-4 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all group ${uploadingFilesCount > 0 ? 'bg-blue-50/50 border-blue-200' : 'border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50'}`}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-5 rounded-2xl transition-all ${uploadingFilesCount > 0 ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600'}`}>
                      {uploadingFilesCount > 0 ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <p className="text-sm font-black text-slate-600 dark:text-slate-300">اسحب المخططات هنا أو انقر للاختيار</p>
                  </div>
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <Cloud size={18} className="text-blue-500" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{att.name}</p>
                        </div>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest">اختيار الموظفين (إسناد متعدد)</h4>
                  </div>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                    محدد: {formData.assignedTo.length}
                  </span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 max-h-[350px] overflow-y-auto custom-scrollbar space-y-2">
                  {employees.map(emp => {
                    const isSelected = formData.assignedTo.includes(emp.id);
                    const empDept = DEPARTMENTS.find(d => d.id === emp.departmentId);
                    return (
                      <div 
                        key={emp.id} 
                        onClick={() => handleEmployeeToggle(emp.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 ${
                          isSelected ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md' : 'border-transparent hover:bg-white/50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <img src={emp.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                           <div className="text-right">
                              <p className={`text-xs font-black ${isSelected ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{emp.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{empDept?.name || 'بدون قسم'}</p>
                           </div>
                        </div>
                        {isSelected && <div className="bg-blue-600 text-white p-1 rounded-lg"><Check size={14} /></div>}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-emerald-400" />
                    <h4 className="text-sm font-black uppercase tracking-widest">إعدادات الإنجاز (KPI)</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الاستحقاق (Deadline)</label>
                    <div className="relative">
                       <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                       <input type="date" className="w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black outline-none focus:border-blue-500" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نقاط KPI</label>
                      <input type="number" className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-lg font-black text-emerald-400 outline-none focus:border-emerald-500" value={formData.kpiPoints} onChange={e => setFormData({...formData, kpiPoints: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الساعات المقدرة</label>
                      <input type="number" className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-lg font-black text-blue-400 outline-none focus:border-blue-500" value={formData.estimatedHours} onChange={e => setFormData({...formData, estimatedHours: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </div>
              </section>

              <button 
                type="submit" 
                disabled={uploadingFilesCount > 0} 
                className={`w-full py-6 rounded-[2.5rem] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  uploadingFilesCount > 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/40'
                }`}
              >
                 {uploadingFilesCount > 0 ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
                 {uploadingFilesCount > 0 ? "جاري رفع المخططات..." : `اعتماد الإسناد (${formData.assignedTo.length})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
