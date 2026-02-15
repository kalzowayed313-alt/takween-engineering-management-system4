
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Users, HardHat, CloudSun, Image as ImageIcon, Plus, Send, X, ShieldCheck, Construction, Calendar, User, Info, Maximize2, PlayCircle, Film, Loader2, Cloud, Check } from 'lucide-react';
import { Project, SiteReport, Employee } from '../types';
import { driveService } from '../services/driveService';

interface SiteReportsProps {
  projects: Project[];
  currentUser: Employee;
  employees: Employee[];
}

const SiteReports: React.FC<SiteReportsProps> = ({ projects, currentUser, employees }) => {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    projectId: projects[0]?.id || '',
    workerCount: 0,
    equipment: '',
    notes: '',
    images: [] as string[]
  });

  const handleCaptureMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      // FIX: Explicitly cast to File[] to avoid 'unknown' type errors
      const files = Array.from(e.target.files) as File[];
      const uploadedUrls: string[] = [];

      for (const file of files) {
        try {
          const result = await driveService.uploadFile(file);
          const type = file.type.startsWith('video') ? 'video' : 'image';
          uploadedUrls.push(`${type}|${result.url}`);
        } catch (err) {
          // FIX: Added 'file.name' which is now correctly typed
          alert(`فشل رفع الوسائط للملف: ${file.name}`);
        }
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: SiteReport = {
      id: `report-${Date.now()}`,
      projectId: formData.projectId,
      authorId: currentUser.id,
      date: new Date().toLocaleDateString('ar-SA'),
      weather: 'مشمس - 32°',
      workerCount: formData.workerCount,
      equipmentActive: formData.equipment.split(','),
      notes: formData.notes,
      images: formData.images
    };
    setReports([newReport, ...reports]);
    setIsCreating(false);
    setFormData({ projectId: projects[0]?.id || '', workerCount: 0, equipment: '', notes: '', images: [] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">تقارير الميدان اليومية</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">توثيق حي ومباشر لسير الأعمال على Google Drive</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Camera size={18} /> تسجيل تقرير ميداني
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-10 animate-in zoom-in duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المشروع</label>
                <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-2xl font-bold" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">وصف تقدم العمل</label>
                <textarea rows={5} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-[2rem] font-medium" placeholder="ما الذي تم إنجازه؟" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">التوثيق البصري (إلى Drive)</label>
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-4 border-dashed rounded-[3rem] p-12 text-center cursor-pointer transition-all ${uploading ? 'bg-blue-50 animate-uploading' : 'hover:border-blue-500 hover:bg-blue-50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleCaptureMedia} className="hidden" multiple accept="image/*,video/*" capture="environment" />
                  <div className="flex flex-col items-center gap-4">
                    {uploading ? (
                      <Loader2 size={48} className="animate-spin text-blue-600" />
                    ) : (
                      <Camera size={48} className="text-slate-300" />
                    )}
                    <p className="text-sm font-black text-slate-600">التقط صوراً حية من الموقع</p>
                    {uploading && <p className="text-[10px] font-black text-blue-600 animate-pulse">جاري الأرشفة السحابية...</p>}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((mediaStr, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg">
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <Check className="text-emerald-600" size={24} />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-[8px] font-black text-center py-1 uppercase">Archived</div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={uploading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-blue-700 disabled:opacity-50">
                <Send size={24} className="rotate-180" /> إرسال التقرير المؤرشف
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed rounded-[3rem] text-slate-300">
           <Construction size={64} className="mx-auto mb-4" />
           <p className="font-black">لا توجد تقارير ميدانية اليوم</p>
        </div>
      )}
    </div>
  );
};

export default SiteReports;
