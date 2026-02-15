
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد الحذف',
  cancelLabel = 'إلغاء',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        
        <div className="p-8 text-center space-y-6">
          {/* Icon Section */}
          <div className="relative inline-block">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${isDanger ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
            <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border-2 ${isDanger ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-600' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800 text-amber-600'}`}>
              <AlertTriangle size={40} />
            </div>
          </div>

          <div className="space-y-2 px-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 text-white rounded-2xl font-black text-xs shadow-xl transition-all active:scale-95 ${isDanger ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none'}`}
            >
              {confirmLabel}
            </button>
          </div>
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

export default ConfirmationModal;
