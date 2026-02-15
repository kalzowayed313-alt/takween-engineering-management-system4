
import React, { useState, useRef } from 'react';
import { Employee, Role, KpiRule } from '../types';
import { DEPARTMENTS } from '../constants';
import { 
  User, Bell, Save, CheckCircle2, Shield, Palette, 
  Briefcase, Globe, Moon, Sun, Camera, Lock, Key, Award, Cpu,
  X, Target, Plus, Trash2, ListChecks, Upload, ShieldCheck, 
  Smartphone, History, ChevronLeft, MapPin, CalendarDays, Building2
} from 'lucide-react';

interface SettingsPageProps {
  currentUser: Employee;
  onUpdateUser: (data: Partial<Employee>) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  kpiRules: KpiRule[];
  setKpiRules: React.Dispatch<React.SetStateAction<KpiRule[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser, isDarkMode, setIsDarkMode, kpiRules, setKpiRules }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'appearance' | 'kpi'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [specialization, setSpecialization] = useState('مهندس تصميم داخلي أول');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  
  const [newRule, setNewRule] = useState({ title: '', category: 'عام', points: 20, hours: 2 });
  const isAdmin = currentUser.role === Role.ADMIN;
  const userDept = DEPARTMENTS.find(d => d.id === currentUser.departmentId);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      onUpdateUser({ avatar: imageUrl });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    onUpdateUser({ name, avatar });
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const addKpiRule = () => {
    if (!newRule.title.trim()) return;
    const rule: KpiRule = {
      id: `rule-${Date.now()}`,
      title: newRule.title,
      category: newRule.category,
      defaultPoints: newRule.points,
      defaultHours: newRule.hours
    };
    setKpiRules([...kpiRules, rule]);
    setNewRule({ title: '', category: 'عام', points: 20, hours: 2 });
  };

  const deleteKpiRule = (id: string) => {
    setKpiRules(kpiRules.filter(r => r.id !== id));
  };

  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 w-full text-right transition-all duration-300 border-l-4 ${
        activeTab === id 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-600 font-bold' 
        : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
            <CheckCircle2 size={20} />
            <span className="font-bold text-base">تم تحديث الإعدادات بنجاح!</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">إعدادات النظام</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">تحكم في هويتك المهنية وتفضيلات بيئة عملك في شركة تكوين</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Award size={16} className="text-amber-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">مستوى الأداء: {currentUser.kpi > 90 ? 'خبير (Elite)' : 'متقدم (Senior)'}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        <aside className="w-full md:w-72 bg-slate-50/50 dark:bg-slate-950/50 border-l border-slate-100 dark:border-slate-800 pt-8 shrink-0">
          <div className="px-6 mb-8 text-center">
            <div className="relative inline-block group">
              <img src={avatar} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white dark:border-slate-800 shadow-xl mx-auto mb-4 transition-transform group-hover:scale-105" alt="" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -left-1 p-2.5 bg-blue-600 text-white rounded-xl shadow-xl hover:bg-blue-700 transition-all transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                title="تغيير الصورة الشخصية"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white leading-tight">{currentUser.name}</h3>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{currentUser.role}</p>
          </div>
          
          <nav className="space-y-1">
            <TabButton id="profile" icon={User} label="الملف الشخصي" />
            <TabButton id="professional" icon={Briefcase} label="المعلومات المهنية" />
            <TabButton id="security" icon={Shield} label="الأمان والخصوصية" />
            <TabButton id="appearance" icon={Palette} label="المظهر والأداء" />
            {isAdmin && <TabButton id="kpi" icon={Target} label="سياسة الـ KPI" />}
          </nav>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
          
          {/* 1. الملف الشخصي */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><User size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">المعلومات الأساسية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 mr-1">الاسم الكامل (للمراسلات الرسمية)</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 mr-1">البريد الإلكتروني المهني</label>
                  <div className="relative">
                    <input type="email" defaultValue={currentUser.email} disabled className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. المعلومات المهنية (New Implementation) */}
          {activeTab === 'professional' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Briefcase size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">الهوية المهنية والمنصب</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">القسم الحالي</label>
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: userDept?.color + '20' }}>
                      <Building2 size={24} style={{ color: userDept?.color }} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200">{userDept?.name}</p>
                       <p className="text-[10px] font-bold text-slate-400">تواصل مع المدير العام لتغيير القسم</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">تاريخ الانضمام للشركة</label>
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-blue-600"><CalendarDays size={24} /></div>
                    <div>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{currentUser.joinedDate}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">سجل الخدمة الموثق</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">التخصص الهندسي الدقيق</label>
                  <input 
                    type="text" 
                    value={specialization} 
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    placeholder="مثلاً: مهندس معماري - تصميم واجهات"
                  />
                  <p className="text-[10px] text-slate-400 font-medium px-2">هذا التخصص يظهر لزملائك في دليل الموظفين وعند إسناد المهام الذكي.</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. الأمان والخصوصية (New Implementation) */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl"><ShieldCheck size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">إعدادات الحماية والأمان</h3>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                  <Key size={18} className="text-rose-500" /> تغيير كلمة المرور
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase">الكلمة الحالية</label>
                     <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase">الكلمة الجديدة</label>
                     <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase">تأكيد الكلمة</label>
                     <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" />
                   </div>
                </div>
                <button className="px-8 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-rose-700 transition-all">تحديث كلمة السر</button>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-blue-600"><Smartphone size={28} /></div>
                   <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white">المصادقة الثنائية (2FA)</p>
                      <p className="text-xs text-slate-400 font-medium">أضف طبقة حماية إضافية لحسابك المهني في تكوين</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase">غير مفعل</span>
                   <button className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative transition-colors"><div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm"></div></button>
                </div>
              </div>
            </div>
          )}

          {/* 4. الـ KPI (للمدراء فقط) */}
          {activeTab === 'kpi' && isAdmin && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
                <Target size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">إدارة معايير قياس الأداء</h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
                 <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2"><Plus size={18} className="text-blue-600" /> تعريف قالب مهمة جديد</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">اسم المهمة</label>
                      <input type="text" placeholder="مراجعة مخطط إنشائي" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold" value={newRule.title} onChange={e => setNewRule({...newRule, title: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">النقاط (KPI Points)</label>
                      <input type="number" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black" value={newRule.points} onChange={e => setNewRule({...newRule, points: parseInt(e.target.value)})} />
                    </div>
                 </div>
                 <button onClick={addKpiRule} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">إضافة للسياسة</button>
              </div>
            </div>
          )}

          {/* 5. المظهر */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
                <Palette size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">المظهر واللغة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">نمط العرض</label>
                  <div className="flex gap-4">
                    <button onClick={() => setIsDarkMode(false)} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${!isDarkMode ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                      <Sun size={24} className={!isDarkMode ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-xs font-black ${!isDarkMode ? 'text-blue-600' : 'text-slate-500'}`}>الوضع النهاري</span>
                    </button>
                    <button onClick={() => setIsDarkMode(true)} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${isDarkMode ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                      <Moon size={24} className={isDarkMode ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-xs font-black ${isDarkMode ? 'text-blue-600' : 'text-slate-500'}`}>الوضع الليلي</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`bg-blue-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 ${isSaving ? 'animate-pulse' : ''}`}
            >
              <Save size={24} /> 
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
