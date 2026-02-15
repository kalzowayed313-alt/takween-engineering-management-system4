
import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, ChevronRight, ChevronLeft, Clock, Zap, Target, History, Search, Filter, 
  Briefcase, ChevronDown, Activity, Users, Download, FileCode, FileText, 
  Image as ImageIcon, FileStack, CheckCircle2, Star, Share2, ExternalLink, 
  ArrowDownToLine, HardHat, LayoutList, Loader2, Check, Eye
} from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';

interface ArchiveFile {
  id: string;
  name: string;
  type: 'blueprint' | 'report' | 'image' | 'video';
  size: string;
  url: string;
  uploadedBy: string;
  mimeType?: string;
}

interface ArchiveTaskBrief {
  id: string;
  title: string;
  points: number;
  status: 'COMPLETED' | 'REVIEWED';
}

interface WeeklyArchive {
  weekNumber: number;
  kpiRate: number;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  topDept: string;
  bahrainTime: string;
  projectId: string;
  topPerformer?: { name: string; avatar: string };
  tasks: ArchiveTaskBrief[];
  files: ArchiveFile[];
}

interface MonthlyArchive {
  id: string;
  monthName: string;
  monthValue: number;
  year: number;
  avgKpi: number;
  totalTasks: number;
  weeks: WeeklyArchive[];
}

const ArchivePage: React.FC = () => {
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<number | null>(null);

  const archives: MonthlyArchive[] = useMemo(() => [
    {
      id: '2024-05',
      monthName: 'مايو',
      monthValue: 5,
      year: 2024,
      avgKpi: 92,
      totalTasks: 145,
      weeks: [
        { 
          weekNumber: 4, 
          kpiRate: 95, 
          completionRate: 98, 
          totalTasks: 38, 
          completedTasks: 37, 
          topDept: 'قسم المعماري', 
          bahrainTime: 'GMT+3 (11:45)', 
          projectId: 'proj-1',
          topPerformer: { name: 'م. أحمد محمود', avatar: 'https://ui-avatars.com/api/?name=أحمد+محمود&background=random' },
          tasks: [
            { id: 't1', title: 'اعتماد المخطط الفني النهائي للدور الأرضي', points: 100, status: 'COMPLETED' },
            { id: 't2', title: 'تسليم تقرير التربة النهائي', points: 50, status: 'COMPLETED' },
            { id: 't3', title: 'مراجعة عينات الرخام الواجهات', points: 30, status: 'REVIEWED' }
          ],
          files: [
            { id: 'f1', name: 'Ground_Floor_Final_V2.dwg', type: 'blueprint', size: '12.4 MB', url: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/file-code.svg', uploadedBy: 'أحمد محمود', mimeType: 'image/svg+xml' },
            { id: 'f2', name: 'Soil_Analysis_Report.pdf', type: 'report', size: '2.1 MB', url: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/file-text.svg', uploadedBy: 'سارة خالد', mimeType: 'application/pdf' }
          ]
        }
      ]
    }
  ], []);

  /**
   * تحويل آمن للبيانات الثنائية لضمان عدم تلف الـ PDF
   */
  const convertToBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    return await response.blob();
  };

  const handleDownloadFile = async (file: ArchiveFile) => {
    if (file.url === '#') {
      alert("عذراً، هذا الملف تجريبي وغير متاح للتحميل الفعلي حالياً.");
      return;
    }
    setDownloadingId(file.id);
    
    try {
      let url = file.url;
      let cleanup = false;

      if (file.url.startsWith('data:')) {
        const blob = await convertToBlob(file.url);
        url = URL.createObjectURL(blob);
        cleanup = true;
      }

      const link = document.createElement('a');
      link.href = url;
      // ضمان امتداد PDF
      const finalName = file.name.toLowerCase().endsWith('.pdf') || file.type !== 'report' 
        ? file.name 
        : `${file.name}.pdf`;
        
      link.setAttribute('download', finalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (cleanup) {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (e) {
      console.error("Archive download error", e);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewFile = async (file: ArchiveFile) => {
    try {
      let url = file.url;
      if (file.url.startsWith('data:')) {
        const blob = await convertToBlob(file.url);
        url = URL.createObjectURL(blob);
      }
      
      window.open(url, '_blank');
    } catch (error) {
      console.error("Preview failed:", error);
    }
  };

  const handleDownloadAll = async (week: WeeklyArchive) => {
    if (week.files.length === 0) return;
    setIsZipping(week.weekNumber);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const link = document.createElement('a');
    link.href = 'data:application/zip;base64,'; 
    link.setAttribute('download', `Takween_Archive_W${week.weekNumber}_${week.projectId}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setIsZipping(null);
  };

  const filteredArchives = useMemo(() => {
    return archives.filter(month => {
      const yearMatch = filterYear === 'all' || month.year.toString() === filterYear;
      const monthMatch = filterMonth === 'all' || month.monthValue.toString() === filterMonth;
      return yearMatch && monthMatch;
    });
  }, [archives, filterYear, filterMonth]);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => 
      prev.includes(weekNum) ? prev.filter(w => w !== weekNum) : [...prev, weekNum]
    );
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'blueprint': return <FileCode className="text-amber-500" />;
      case 'report': return <FileText className="text-blue-500" />;
      case 'image': return <ImageIcon className="text-emerald-500" />;
      default: return <FileStack className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20"><History size={24} /></div>
             <h2 className="text-3xl font-black text-slate-800 dark:text-white mr-2">أرشيف تكوين الرقمي</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">مستودع المخططات الهندسية والتقارير الأسبوعية المعتمدة</p>
        </div>
        
        {selectedMonthId && (
          <button 
            onClick={() => { setSelectedMonthId(null); setExpandedWeeks([]); }}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700"
          >
            <ChevronRight size={18} /> العودة للفهرس الزمني
          </button>
        )}
      </div>

      {!selectedMonthId && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <Filter size={18} />
            <span className="text-xs font-black uppercase tracking-widest">تصفية السجلات</span>
          </div>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
            <option value="all">كل السنوات</option><option value="2024">2024</option><option value="2023">2023</option>
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
            <option value="all">كل الأشهر</option>
            <option value="5">مايو</option>
            <option value="4">أبريل</option>
          </select>
        </div>
      )}

      {!selectedMonthId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArchives.map(month => (
            <div 
              key={month.id}
              onClick={() => setSelectedMonthId(month.id)}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="p-4 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl shadow-blue-500/20"><CalendarDays size={28} /></div>
                   <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{month.year}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{month.monthName}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">إحصائيات الإنجاز المسجلة</p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">متوسط KPI</p>
                      <p className="text-2xl font-black text-emerald-600">{month.avgKpi}%</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-center group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">المهام</p>
                      <p className="text-2xl font-black text-blue-600">{month.totalTasks}</p>
                   </div>
                </div>
                <div className="mt-auto flex items-center justify-between text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors">
                   <span className="uppercase tracking-widest">تصفح الأسابيع</span>
                   <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden mb-12">
             <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
             <div className="relative z-10">
                <h3 className="text-4xl font-black mb-3 text-white">سجلات {archives.find(m => m.id === selectedMonthId)?.monthName} {archives.find(m => m.id === selectedMonthId)?.year}</h3>
                <div className="flex flex-wrap gap-4 mt-6">
                   <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                      <Target className="text-emerald-400" size={20} />
                      <span className="text-sm font-black">كفاءة تشغيلية: {archives.find(m => m.id === selectedMonthId)?.avgKpi}%</span>
                   </div>
                   <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
                      <Clock className="text-blue-400" size={20} />
                      <span className="text-sm font-black">نظام التوقيت: البحرين (AST)</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            {archives.find(m => m.id === selectedMonthId)?.weeks.map(week => {
              const isExpanded = expandedWeeks.includes(week.weekNumber);
              const project = MOCK_PROJECTS.find(p => p.id === week.projectId);

              return (
                <div key={week.weekNumber} className={`bg-white dark:bg-slate-900 border transition-all duration-500 rounded-[2.5rem] overflow-hidden ${isExpanded ? 'border-blue-200 dark:border-blue-900 shadow-2xl scale-[1.01]' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
                  <div onClick={() => toggleWeek(week.weekNumber)} className={`flex items-center justify-between p-8 cursor-pointer group ${isExpanded ? 'bg-blue-50/20 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {week.weekNumber}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white">الأسبوع {week.weekNumber}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">مشروع: {project?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="hidden lg:flex items-center gap-4">
                          <div className="text-center px-4 border-l border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] font-black text-slate-400 uppercase">ملفات أرشفة</p>
                             <p className="text-sm font-black text-blue-600 tabular-nums">{week.files.length}</p>
                          </div>
                          <div className="text-center px-4">
                             <p className="text-[10px] font-black text-slate-400 uppercase">مهام مكتملة</p>
                             <p className="text-sm font-black text-emerald-600 tabular-nums">{week.completedTasks}</p>
                          </div>
                       </div>
                       <div className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><ChevronDown size={20} /></div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-7 space-y-8">
                           <div className="flex items-center justify-between">
                              <h5 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                                 <LayoutList size={20} className="text-blue-600" /> نبذة عن إنجازات الأسبوع
                              </h5>
                              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-lg">إجمالي {week.tasks.length} مهام رئيسية</span>
                           </div>
                           <div className="space-y-4">
                              {week.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all group">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><CheckCircle2 size={20} /></div>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{task.title}</span>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">+{task.points} KPI</span>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="lg:col-span-5 space-y-8">
                           <div className="flex items-center justify-between">
                              <h5 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                                 <FileStack size={20} className="text-blue-600" /> مستودع الملفات المؤرشفة
                              </h5>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDownloadAll(week); }}
                                disabled={isZipping === week.weekNumber}
                                className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {isZipping === week.weekNumber ? (
                                   <Loader2 size={12} className="animate-spin text-blue-600" />
                                 ) : (
                                   <Download size={12} />
                                 )}
                                 {isZipping === week.weekNumber ? 'جاري التحضير...' : 'تحميل الكل (ZIP)'}
                              </button>
                           </div>
                           <div className="space-y-4">
                              {week.files.map(file => (
                                <div key={file.id} className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all group">
                                   <div className="flex items-center gap-4 min-w-0">
                                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">{getFileIcon(file.type)}</div>
                                      <div className="min-w-0">
                                         <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[150px]">{file.name}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{file.size} • بواسطة {file.uploadedBy}</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handlePreviewFile(file); }}
                                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                                        title="معاينة"
                                      >
                                         <Eye size={18} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDownloadFile(file); }}
                                        disabled={downloadingId === file.id}
                                        className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:rotate-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                         {downloadingId === file.id ? (
                                           <Loader2 size={18} className="animate-spin" />
                                         ) : (
                                           <ArrowDownToLine size={18} />
                                         )}
                                      </button>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
