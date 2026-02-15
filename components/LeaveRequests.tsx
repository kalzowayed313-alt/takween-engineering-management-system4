
import React, { useState, useRef } from 'react';
import { LeaveRequest, Employee, Role } from '../types';
import { Check, X, Clock, Edit2, Save, Calendar, FileText, Plus, Upload, Image as ImageIcon, AlertCircle, ExternalLink, Send, Download } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface LeaveRequestsProps {
  currentUser: Employee;
  employees: Employee[];
  requests: LeaveRequest[];
  setRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  onAddRequest: (req: LeaveRequest) => void;
  onNotify?: (title: string, msg: string) => void;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({ currentUser, employees, requests, setRequests, onAddRequest, onNotify }) => {
  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.DEPT_MANAGER;
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    setIsProcessing(id);
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    
    // إرسال إشعار بريدي للموظف
    const emp = employees.find(e => e.id === request.employeeId);
    if (emp) {
      try {
        const res = await notificationService.notifyLeaveStatus(emp, { ...request, status });
        if (onNotify) onNotify(res.title, res.message);
      } catch (err) {
        console.error("Failed to send leave status email:", err);
      }
    }
    setIsProcessing(null);
  };

  const handleSaveEdit = (updated: LeaveRequest) => {
    setRequests(prev => prev.map(req => req.id === updated.id ? updated : req));
    setEditingRequest(null);
  };

  const handleNewRequestSubmit = (formData: any) => {
    const newRequest: LeaveRequest = {
      id: `l-${Date.now()}`,
      employeeId: currentUser.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      attachmentUrl: formData.attachmentUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    onAddRequest(newRequest);
    setIsNewRequestModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">إدارة طلبات الإجازة</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">نظام المتابعة الإداري لضبط الحضور والغياب الموثق</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsNewRequestModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> طلب إجازة جديد
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">اسم المهندس</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">نوع الطلب</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">فترة الغياب</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">المستندات</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">حالة الطلب</th>
                {isAdmin && <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">إجراءات إدارية</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {requests.map(req => {
                const emp = employees.find(e => e.id === req.employeeId);
                const isProcessingThis = isProcessing === req.id;
                
                return (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={emp?.avatar} className="w-12 h-12 rounded-[1.2rem] border-2 border-white dark:border-slate-700 shadow-sm object-cover" alt="" />
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{emp?.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl ${
                        req.type === 'SICK' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' : 
                        req.type === 'ANNUAL' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
                        'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                      }`}>
                        {req.type === 'ANNUAL' ? 'سنوية' : req.type === 'SICK' ? 'مرضية' : 'طارئة'}
                      </span>
                    </td>
                    <td className="p-6 text-xs text-slate-500 font-bold tabular-nums">{req.startDate} ← {req.endDate}</td>
                    <td className="p-6 text-center">
                      {req.attachmentUrl ? (
                        <div className="flex items-center justify-center gap-2">
                          <a 
                            href={req.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl hover:shadow-lg transition-all"
                            title="معاينة"
                          >
                            <ImageIcon size={14} />
                          </a>
                          <a 
                            href={req.attachmentUrl} 
                            download={`عذر_طبي_${emp?.name}_${req.startDate}.png`}
                            className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl hover:shadow-lg transition-all"
                            title="تنزيل"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300">لا يوجد مرفق</span>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 w-fit ${
                        req.status === 'PENDING' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                        'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                      }`}>
                        {req.status === 'PENDING' ? 'قيد المراجعة' : req.status === 'APPROVED' ? 'تم القبول' : 'تم الرفض'}
                        {isProcessingThis && <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-6 text-left">
                        <div className="flex items-center gap-2">
                          {req.status === 'PENDING' && (
                            <>
                              <button 
                                disabled={isProcessingThis}
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 disabled:opacity-50"
                                title="قبول وإرسال بريد"
                              >
                                {isProcessingThis ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
                              </button>
                              <button 
                                disabled={isProcessingThis}
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-none active:scale-95 disabled:opacity-50"
                                title="رفض وإرسال بريد"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setEditingRequest(req)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Clock size={48} className="text-slate-100 dark:text-slate-800" />
                       <p className="text-sm text-slate-400 font-bold italic uppercase tracking-widest">لا توجد طلبات إجازة مسجلة في السجل الحالي</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRequest && (
        <EditLeaveModal 
          request={editingRequest} 
          onClose={() => setEditingRequest(null)} 
          onSave={handleSaveEdit}
          employees={employees}
        />
      )}

      {isNewRequestModalOpen && (
        <NewLeaveRequestModal 
          onClose={() => setIsNewRequestModalOpen(false)} 
          onSubmit={handleNewRequestSubmit}
        />
      )}
    </div>
  );
};

interface EditLeaveModalProps {
  request: LeaveRequest;
  onClose: () => void;
  onSave: (updated: LeaveRequest) => void;
  employees: Employee[];
}

const EditLeaveModal: React.FC<EditLeaveModalProps> = ({ request, onClose, onSave, employees }) => {
  const [formData, setFormData] = useState<LeaveRequest>({ ...request });
  const emp = employees.find(e => e.id === request.employeeId);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <img src={emp?.avatar} className="w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md object-cover" alt="" />
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">مراجعة طلب إجازة</h3>
              <p className="text-xs font-bold text-slate-400">{emp?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">نوع الإجازة</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm dark:text-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="ANNUAL">إجازة سنوية</option>
                <option value="SICK">إجازة مرضية</option>
                <option value="EMERGENCY">إجازة طارئة</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الحالة الإدارية</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm dark:text-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="PENDING">قيد المراجعة</option>
                <option value="APPROVED">مقبول</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">سبب الطلب / ملاحظات الموظف</label>
            <div className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-medium leading-relaxed dark:text-slate-300">
              {formData.reason}
            </div>
          </div>

          {formData.attachmentUrl && (
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">المرفق الطبي (العذر)</label>
               <div className="flex gap-2">
                 <a 
                   href={formData.attachmentUrl} 
                   target="_blank" 
                   rel="noreferrer" 
                   className="flex-1 flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl group transition-all hover:shadow-lg"
                 >
                   <div className="flex items-center gap-3">
                     <ImageIcon className="text-emerald-600" size={20} />
                     <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">معاينة العذر</span>
                   </div>
                   <ExternalLink size={14} className="text-emerald-400 group-hover:scale-125 transition-transform" />
                 </a>
                 <a 
                   href={formData.attachmentUrl} 
                   download={`عذر_${emp?.name}.png`}
                   className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl text-blue-600 hover:shadow-lg transition-all"
                   title="تنزيل للكمبيوتر"
                 >
                   <Download size={20} />
                 </a>
               </div>
            </div>
          )}

          <button 
            onClick={() => onSave(formData)}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save size={20} /> اعتماد التحديثات
          </button>
        </div>
      </div>
    </div>
  );
};

const NewLeaveRequestModal: React.FC<{ onClose: () => void, onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    type: 'ANNUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    attachmentUrl: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, attachmentUrl: URL.createObjectURL(file) });
    }
  };

  const isSickLeave = formData.type === 'SICK';
  const canSubmit = !isSickLeave || (isSickLeave && formData.attachmentUrl !== '');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black">تقديم طلب إجازة جديد</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">يرجى استيفاء البيانات والمرفقات المطلوبة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">نوع الإجازة المطلوب</label>
            <div className="grid grid-cols-3 gap-3">
               {['ANNUAL', 'SICK', 'EMERGENCY'].map(type => (
                 <button 
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`py-3 px-4 rounded-2xl text-[11px] font-black transition-all border-2 ${
                    formData.type === type 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30' 
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                 >
                   {type === 'ANNUAL' ? 'سنوية' : type === 'SICK' ? 'مرضية' : 'طارئة'}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">تاريخ البدء</label>
              <input 
                type="date" 
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">تاريخ الانتهاء</label>
              <input 
                type="date" 
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mr-1">السبب / الملاحظات الفنية</label>
            <textarea 
              rows={3}
              placeholder="يرجى توضيح سبب الإجازة باختصار..."
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium leading-relaxed dark:text-white"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-blue-600" /> إرفاق العذر الطبي {isSickLeave && <span className="text-rose-500 font-black">(إلزامي)</span>}
              </label>
              {isSickLeave && !formData.attachmentUrl && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 animate-pulse">
                  <AlertCircle size={12} /> يرجى رفع الصورة للمتابعة
                </div>
              )}
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all group relative overflow-hidden ${
                formData.attachmentUrl 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                : isSickLeave 
                  ? 'border-rose-200 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/5 hover:border-rose-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,.pdf" 
              />
              
              {formData.attachmentUrl ? (
                <div className="flex flex-col items-center gap-2">
                   <div className="relative">
                      <img src={formData.attachmentUrl} className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-xl" alt="Preview" />
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                        <Check size={14} />
                      </div>
                   </div>
                   <p className="text-xs font-black text-emerald-600 mt-2">تم إرفاق العذر بنجاح</p>
                   <button type="button" className="text-[10px] font-bold text-slate-400 underline">تغيير الصورة</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl transition-colors ${isSickLeave ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'}`}>
                    <Upload size={28} />
                  </div>
                  <p className={`text-sm font-black ${isSickLeave ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>انقر هنا لرفع صورة التقرير الطبي</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">PNG, JPG أو PDF (بحد أقصى 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <button 
            disabled={!canSubmit}
            onClick={() => onSubmit(formData)}
            className={`w-full py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              canSubmit 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {formData.attachmentUrl ? <Save size={20} /> : <FileText size={20} />}
            إرسال الطلب للمراجعة
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
