
import React, { useState } from 'react';
import { X, Mail, Calendar, Target, Clock, CheckCircle2, AlertCircle, BrainCircuit, Sparkles, TrendingUp, ShieldAlert, Archive, UserCog, Save, History, Lock, Building2, ChevronLeft, Flag, Trash2 } from 'lucide-react';
import { Employee, Task, TaskStatus, Role } from '../../types';
import { DEPARTMENTS } from '../../constants';
import { analyzePerformance } from '../../services/geminiService';
import ConfirmationModal from './ConfirmationModal';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  tasks: Task[];
  currentUser: Employee;
  onUpdateEmployee: (id: string, data: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ 
  isOpen, employee, onClose, tasks, currentUser, onUpdateEmployee, onDeleteEmployee, onPermanentDelete 
}) => {
  if (!isOpen || !employee) return null;

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(employee.role);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(employee.departmentId);
  const [targetKpi, setTargetKpi] = useState<number>(employee.kpiTarget || 80);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const empTasks = tasks.filter(t => t.assignedTo === employee.id);
  const dept = DEPARTMENTS.find(d => d.id === employee.departmentId);

  const isAdmin = currentUser.role === Role.ADMIN;
  const isSelf = currentUser.id === employee.id;
  const isManager = currentUser.role === Role.ADMIN || currentUser.role === Role.DEPT_MANAGER;
  
  const isArchived = employee.status === 'PENDING';

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&color=fff`;
  };

  const handleGetAiReport = async () => {
    setIsLoadingAi(true);
    const report = await analyzePerformance(employee, empTasks);
    setAiReport(report);
    setIsLoadingAi(false);
  };

  const handleSaveChanges = () => {
    onUpdateEmployee(employee.id, { 
      role: selectedRole,
      departmentId: selectedDeptId,
      kpiTarget: targetKpi
    });
    setIsEditMode(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in fade-in duration-300">
          
          {/* Header Profile */}
          <div className={`relative h-48 bg-gradient-to-r ${isArchived ? 'from-slate-600 to-slate-800' : 'from-blue-600 to-indigo-700'}`}>
            <button 
              onClick={onClose} 
              className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors z-20"
            >
              <X size={20} />
            </button>
            
            <div className="absolute -bottom-12 right-10 flex items-end gap-6">
              <div className="relative">
                <img 
                  src={employee.avatar} 
                  onError={handleImgError}
                  className={`w-32 h-32 rounded-3xl object-cover border-8 border-white dark:border-slate-800 shadow-xl ${isArchived ? 'grayscale' : ''}`} 
                  alt="" 
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-4 border-white dark:border-slate-800 rounded-full ${isArchived ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
              </div>
              <div className="pb-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">{employee.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${isArchived ? 'bg-slate-100 text-slate-500' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'}`}>
                    {isArchived ? 'حساب معطل' : employee.role}
                  </span>
                  <span className="text-sm font-bold text-slate-400">{dept?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Right Column: Stats & Management */}
              <div className="space-y-8">
                {/* Management Tools (Manager/Admin Only & Not Self) */}
                {isManager && !isSelf && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserCog size={14} /> إدارة شؤون وأهداف الموظف
                    </h3>
                    
                    <div className="space-y-3">
                      {!isEditMode ? (
                        <button 
                          onClick={() => setIsEditMode(true)}
                          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-2"><Flag size={16} className="text-blue-500" /> تعديل المستهدفات والرتبة</div>
                          <ChevronLeft size={14} className="opacity-30" />
                        </button>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-4 animate-in fade-in duration-200">
                          {isAdmin && (
                            <>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">الرتبة الوظيفية</label>
                                <select 
                                  value={selectedRole}
                                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                >
                                  {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">القسم الهندسي</label>
                                <select 
                                  value={selectedDeptId}
                                  onChange={(e) => setSelectedDeptId(e.target.value)}
                                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                >
                                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                              </div>
                            </>
                          )}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase">الهدف المستهدف (KPI Target %)</label>
                            <input 
                              type="number" 
                              value={targetKpi}
                              onChange={e => setTargetKpi(parseInt(e.target.value))}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={handleSaveChanges} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1"><Save size={12} /> اعتماد التغيير</button>
                            <button onClick={() => setIsEditMode(false)} className="px-3 bg-slate-100 dark:bg-slate-700 text-slate-500 py-2 rounded-lg text-[10px] font-black">إلغاء</button>
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => setIsConfirmingArchive(true)}
                            className="w-full flex items-center gap-2 p-4 bg-amber-50 text-amber-600 rounded-2xl text-xs font-bold border border-amber-100 hover:bg-amber-600 hover:text-white transition-all active:scale-95"
                          >
                            <Archive size={16} /> {isArchived ? 'تنشيط الحساب' : 'تعطيل الحساب / أرشفة'}
                          </button>
                          
                          <button 
                            onClick={() => setIsConfirmingDelete(true)}
                            className="w-full flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                          >
                            <Trash2 size={16} /> حذف نهائي من النظام
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">مؤشرات الأداء مقابل الأهداف</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Target size={18} /></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">KPI الحالي</span>
                      </div>
                      <span className="text-lg font-black text-emerald-600">{employee.kpi}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Flag size={18} /></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">المستهدف</span>
                      </div>
                      <span className="text-lg font-black text-blue-600">{employee.kpiTarget || 80}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Column: Tasks & Timeline */}
              <div className="lg:col-span-2 space-y-10">
                {!isArchived && (
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <Sparkles className="text-amber-300 animate-pulse" size={28} />
                          <div>
                            <h4 className="text-lg font-black">تحليل أداء Gemini AI</h4>
                            <p className="text-indigo-100 text-xs font-medium">مراجعة المسار المهني للموظف ذكياً</p>
                          </div>
                        </div>
                        {!aiReport ? (
                          <button 
                            onClick={handleGetAiReport}
                            disabled={isLoadingAi}
                            className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:scale-105 transition-all"
                          >
                            {isLoadingAi ? 'جاري التحليل...' : 'بدء التحليل الفوري'}
                          </button>
                        ) : (
                          <button onClick={() => setAiReport(null)} className="text-xs font-bold text-white/50 hover:text-white underline">إخفاء التقرير</button>
                        )}
                     </div>
                     {aiReport && (
                       <div className="mt-6 p-6 bg-white/10 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{aiReport}</p>
                       </div>
                     )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white">أرشيف المهام والنتائج</h3>
                     <span className="text-xs font-bold text-slate-400">إجمالي {empTasks.length} سجلات</span>
                  </div>
                  <div className="space-y-4">
                    {empTasks.length > 0 ? empTasks.slice(0, 8).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${
                            task.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{task.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{task.dueDate} • نقاط KPI: {task.kpiPoints}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    )) : (
                      <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                        <AlertCircle size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                        <p className="text-xs text-slate-400 font-bold">لا توجد سجلات تاريخية متاحة حالياً</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة تأكيد الأرشفة */}
      <ConfirmationModal 
        isOpen={isConfirmingArchive}
        onClose={() => setIsConfirmingArchive(false)}
        onConfirm={() => {
          onDeleteEmployee(employee.id);
          onClose();
        }}
        title={isArchived ? "إعادة تنشيط الحساب؟" : "هل أنت متأكد من تعطيل حساب الموظف؟"}
        message={isArchived 
          ? `سيتم إعادة تفعيل صلاحيات المهندس ${employee.name} للدخول للنظام.` 
          : `سيتم نقل حساب المهندس ${employee.name} إلى الأرشيف وسيتم سحب كافة صلاحيات الدخول منه.`
        }
        confirmLabel={isArchived ? "تنشيط الآن" : "تأكيد الأرشفة"}
        variant={isArchived ? "warning" : "danger"}
      />

      {/* نافذة تأكيد الحذف النهائي */}
      <ConfirmationModal 
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          if (onPermanentDelete) onPermanentDelete(employee.id);
          onClose();
        }}
        title="حذف نهائي من النظام؟"
        message={`تحذير خطير: سيتم مسح كافة بيانات المهندس ${employee.name} من قاعدة البيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه وسيفقد الموظف قدرته على الدخول للأبد.`}
        confirmLabel="حذف الموظف نهائياً"
        variant="danger"
      />
    </>
  );
};
export default EmployeeDetailModal;
