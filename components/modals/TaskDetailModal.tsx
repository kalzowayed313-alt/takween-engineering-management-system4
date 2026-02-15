
import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, CheckCircle, Paperclip, Save, 
  Layout, Zap, Info, Download, Eye, Loader2, Cloud, ExternalLink, 
  FileText, FileArchive, HardDrive, Maximize2, Minimize2, ChevronRight, AlertTriangle,
  Maximize, Globe
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Employee, Role, Attachment } from '../../types';
import ConfirmationModal from './ConfirmationModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  employees: Employee[];
  projects: any[];
  currentUser: Employee;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  isOpen, task, onClose, onUpdate, onDelete, employees, projects, currentUser 
}) => {
  const [formData, setFormData] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({ ...task, attachments: task.attachments || [] });
    }
  }, [task]);

  // تنظيف الروابط المؤقتة لمنع تسرب الذاكرة
  useEffect(() => {
    return () => {
      if (displayUrl && displayUrl.startsWith('blob:')) {
        URL.revokeObjectURL(displayUrl);
      }
    };
  }, [displayUrl]);

  if (!isOpen || !formData) return null;

  const isAdmin = currentUser.role === Role.ADMIN;

  /**
   * الحل السحري لعرض الـ PDF دون حظر Chrome:
   * نستخدم Google Docs Viewer كخادم وسيط لعرض الملفات السحابية
   */
  const getSafePreviewUrl = (file: Attachment) => {
    let url = file.url;

    // إذا كان الملف من Google Drive، نحوله لرابط معاينة مباشر
    if (url.includes('drive.google.com')) {
      if (url.includes('/view')) {
        url = url.replace(/\/view.*/, '/preview');
      }
    }

    // إذا كان ملف PDF خارجي (Cloud)، نغلفه بمحرك Google
    if (url.startsWith('http') && (file.type === 'pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  const base64ToBlob = (base64: string, type: string) => {
    try {
      const parts = base64.split(',');
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type });
    } catch (e) {
      return null;
    }
  };

  const handlePreview = (file: Attachment) => {
    if (file.provider === 'cloud') {
      setPreviewFile(file);
      setDisplayUrl(getSafePreviewUrl(file));
      return;
    }

    // للملفات المحلية (Base64)
    if (file.url.startsWith('data:')) {
      const isPdf = file.mimeType?.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const contentType = file.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg');
      const blob = base64ToBlob(file.url, contentType);
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        setDisplayUrl(url); 
        setPreviewFile(file);
      }
    }
  };

  const handleDownload = (file: Attachment) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const project = projects.find(p => p.id === formData.projectId);

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 border border-white/10 ${
          previewFile ? 'w-[98vw] h-[94vh]' : 'w-full max-w-6xl max-h-[94vh]'
        }`}>
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/30">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl shadow-lg ${
                formData.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-blue-600'
              } text-white`}>
                <Layout size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{formData.title}</h3>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{project?.name}</span>
                  <span className={`text-[10px] font-black uppercase ${formData.priority === TaskPriority.HIGH ? 'text-rose-500' : 'text-emerald-500'}`}>أولوية {formData.priority}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {previewFile && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(previewFile.url, '_blank')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <ExternalLink size={16} /> فتح الرابط الأصلي
                  </button>
                  <button 
                    onClick={() => handleDownload(previewFile)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    <Download size={16} /> تحميل
                  </button>
                </div>
              )}
              {isAdmin && (
                <button onClick={() => setIsConfirmingDelete(true)} className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20} /></button>
              )}
              <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={`overflow-y-auto custom-scrollbar p-8 space-y-10 transition-all ${previewFile ? 'w-[380px] border-l border-slate-100 dark:border-slate-800' : 'w-full'}`}>
              
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                     <Paperclip size={18} className="text-blue-500" />
                     <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">المرفقات والمخططات</h4>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {formData.attachments && formData.attachments.length > 0 ? (
                    formData.attachments.map((file) => (
                      <div 
                        key={file.id} 
                        onClick={() => handlePreview(file)}
                        className={`group p-4 bg-white dark:bg-slate-950 border-2 rounded-2xl transition-all duration-300 flex items-center justify-between cursor-pointer ${
                          previewFile?.id === file.id ? 'border-blue-600 bg-blue-50/10' : 'border-slate-100 dark:border-slate-800 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-3 rounded-xl ${file.provider === 'cloud' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                            {file.provider === 'cloud' ? <Cloud size={18} /> : <HardDrive size={18} />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-black text-slate-800 dark:text-white truncate">{file.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold mt-0.5">{file.provider === 'cloud' ? 'مرفوع سحابياً' : 'تخزين محلي'}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className={`text-slate-300 group-hover:text-blue-600 transition-all ${previewFile?.id === file.id ? 'rotate-90' : ''}`} />
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                       <FileArchive size={40} className="mx-auto text-slate-200 mb-3" />
                       <p className="text-[10px] text-slate-400 font-bold italic">لا توجد مرفقات لهذه المهمة</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><Info size={18} className="text-blue-500" /> الوصف الفني</h4>
                <div className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-medium leading-relaxed dark:text-slate-300">
                  {formData.description || 'لا يوجد وصف متاح.'}
                </div>
              </section>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                 <button 
                  onClick={() => onUpdate(formData)}
                  disabled={isSaving}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} /> حفظ التعديلات
                </button>
              </div>
            </div>

            {/* Preview Area */}
            {previewFile && (
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative flex flex-col animate-in slide-in-from-left duration-500">
                 <div className="absolute top-4 left-4 z-[160] flex gap-2">
                    <button 
                      onClick={() => setPreviewFile(null)}
                      className="p-3 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white rounded-xl shadow-2xl hover:bg-white transition-all border border-slate-200"
                    >
                       <Minimize2 size={20} />
                    </button>
                 </div>
                 
                 <div className="flex-1 w-full h-full p-4 relative">
                    {previewFile.type === 'pdf' || previewFile.name.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-full rounded-2xl bg-white shadow-2xl relative overflow-hidden">
                        {/* Fallback View while loading */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-center p-8 z-0">
                             <Globe size={48} className="text-blue-500 mb-4 animate-pulse" />
                             <h5 className="text-sm font-black text-slate-700">جاري معالجة المستند الآمن...</h5>
                             <p className="text-[10px] text-slate-400 mt-2">نحن نستخدم محرك عرض Google لضمان التوافقية الكاملة</p>
                        </div>
                        <iframe 
                          src={displayUrl || ''} 
                          className="w-full h-full border-none relative z-10"
                          title="Technical Preview"
                          key={displayUrl}
                        />
                      </div>
                    ) : previewFile.type === 'image' || previewFile.mimeType?.includes('image') ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-900 rounded-2xl overflow-hidden p-6">
                         <img 
                          src={displayUrl || previewFile.url} 
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                          alt="Blueprint Preview" 
                         />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                         <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl text-center">
                            <FileArchive size={64} className="mx-auto text-blue-600 mb-4" />
                            <h5 className="text-xl font-black text-slate-800 dark:text-white mb-2">{previewFile.name}</h5>
                            <button onClick={() => handleDownload(previewFile)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700">تحميل لمراجعة المحتوى</button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => { onDelete(formData.id); onClose(); }}
        title="حذف المهمة؟"
        message="سيتم مسح هذه المهمة وكافة مرفقاتها نهائياً من سجلات المشروع."
      />
    </>
  );
};

export default TaskDetailModal;
