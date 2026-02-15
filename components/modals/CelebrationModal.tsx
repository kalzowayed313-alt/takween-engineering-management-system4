
import React from 'react';
import { Trophy, X, Star, Sparkles, Heart, Users, Award } from 'lucide-react';
import { Employee, Department } from '../../types';
import { DEPARTMENTS } from '../../constants';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner?: Employee;
  topDepartment?: any; // تم تمرير بيانات القسم الفائز
  mode: 'EMPLOYEE' | 'DEPARTMENT';
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, winner, topDepartment, mode }) => {
  if (!isOpen) return null;

  const isEmployeeMode = mode === 'EMPLOYEE' && winner;
  const isDeptMode = mode === 'DEPARTMENT' && topDepartment;
  const dept = isEmployeeMode ? DEPARTMENTS.find(d => d.id === winner.departmentId) : topDepartment;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
      {/* Confetti Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => (
          <div 
            key={i} 
            className="absolute animate-bounce opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              color: i % 2 === 0 ? '#fbbf24' : (isDeptMode ? '#10b981' : '#60a5fa')
            }}
          >
            {i % 3 === 0 ? <Star size={20} /> : <Sparkles size={16} />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden relative animate-in zoom-in fade-in duration-500 text-center p-10 border border-white/20">
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <X size={24} />
        </button>

        {/* Golden Trophy Section */}
        <div className="relative mb-8 pt-4">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl animate-pulse ${isDeptMode ? 'bg-emerald-400/20' : 'bg-amber-400/20'}`}></div>
          <div className="relative animate-bounce duration-1000">
            {isDeptMode ? (
               <div className="relative inline-block">
                 <Award size={120} className="mx-auto text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                 <Users className="absolute -bottom-2 -right-2 text-emerald-600 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg" size={40} />
               </div>
            ) : (
               <Trophy size={120} className="mx-auto text-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            )}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
            {isDeptMode ? 'درع التميز للقسم الأفضل' : 'موظف الشهر المتميز'}
          </h2>
          
          <div className="flex flex-col items-center gap-4 py-6">
             {isEmployeeMode && (
               <>
                 <div className="relative">
                   <img src={winner.avatar} className="w-28 h-28 rounded-3xl object-cover ring-4 ring-amber-400 shadow-2xl" alt="" />
                   <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg">
                     <Star size={18} fill="currentColor" />
                   </div>
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-slate-800 dark:text-white">{winner.name}</p>
                   <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{dept?.name}</p>
                 </div>
               </>
             )}

             {isDeptMode && (
               <div className="space-y-2">
                 <h3 className="text-3xl font-black text-emerald-600">{dept?.name}</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">متوسط الأداء: {topDepartment.avgKpi}%</p>
               </div>
             )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity ${isDeptMode ? 'from-emerald-400/5' : 'from-amber-400/5'}`}></div>
             <p className="text-xl font-black text-slate-800 dark:text-white leading-relaxed">
               {isDeptMode 
                 ? "فريق واحد، هدف واحد. شكراً لجهودكم الجماعية العظيمة" 
                 : "شكراً لك ونقدر جهودك العظيمة"}
             </p>
             <div className="flex items-center justify-center gap-2 mt-4 text-rose-500">
               <Heart size={20} fill="currentColor" className="animate-pulse" />
               <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                 {isDeptMode ? 'فخورون بهذا القسم المبدع' : 'فخورون بوجودك معنا في تكوين'}
               </span>
             </div>
          </div>

          <button 
            onClick={onClose}
            className={`w-full mt-8 py-5 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isDeptMode ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'
            }`}
          >
            نواصل الإبداع معاً
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
