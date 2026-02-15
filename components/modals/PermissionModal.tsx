
import React from 'react';
import { ShieldAlert, X, Lock, ShieldOff } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole?: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-[0_0_50px_rgba(225,29,72,0.2)] overflow-hidden relative animate-in zoom-in duration-300 border border-rose-100 dark:border-rose-900/30">
        
        <div className="p-8 text-center space-y-6">
          {/* Icon Section */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-rose-50 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mx-auto border-2 border-rose-100 dark:border-rose-800">
              <ShieldOff size={48} className="text-rose-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-2 rounded-xl shadow-lg">
              <Lock size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">ليست لديك الصلاحيات للدخول</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm px-4">
              عذراً، هذا القسم مخصص للإدارة العليا فقط. لا تملك رتبتك الوظيفية الحالية إذن الوصول لهذه البيانات الحساسة.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الإجراء المطلوب</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "إذا كنت تعتقد أن هذا الخطأ، يرجى مراجعة المدير العام لتحديث مستوى صلاحياتك في النظام."
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-xl shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            فهمت ذلك
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default PermissionModal;
