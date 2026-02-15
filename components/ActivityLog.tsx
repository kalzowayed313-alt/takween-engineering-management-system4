
import React from 'react';
import { Employee, Task } from '../types';
import { Clock, PlusCircle, CheckCircle, UserPlus, LogIn, ExternalLink } from 'lucide-react';

interface ActivityLogProps {
  employees: Employee[];
  tasks: Task[];
  onUserClick: (emp: Employee) => void;
  onTaskClick: (task: Task) => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ employees, tasks, onUserClick, onTaskClick }) => {
  // استخدام بيانات تجريبية مرتبطة بالواقع في النظام
  const activities = [
    { 
      id: '1', 
      userId: 'emp-1', 
      action: 'أنشأ مهمة جديدة', 
      targetName: 'تصميم واجهة المبنى الإداري', 
      targetId: 'task-1', 
      type: 'TASK', 
      time: 'منذ 5 دقائق' 
    },
    { 
      id: '2', 
      userId: 'emp-3', 
      action: 'سجل حضور', 
      targetName: 'المكتب الرئيسي', 
      targetId: null, 
      type: 'AUTH', 
      time: 'منذ ساعة' 
    },
    { 
      id: '3', 
      userId: 'emp-2', 
      action: 'اعتمد طلب إجازة', 
      targetName: 'م. عمر السيد', 
      targetId: 'emp-3', 
      type: 'ADMIN', 
      time: 'منذ ساعتين' 
    },
  ];

  const handleTargetClick = (act: any) => {
    if (act.type === 'TASK' && act.targetId) {
      const task = tasks.find(t => t.id === act.targetId);
      if (task) onTaskClick(task);
    } else if (act.type === 'ADMIN' && act.targetId) {
      const emp = employees.find(e => e.id === act.targetId);
      if (emp) onUserClick(emp);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800">سجل النشاطات الحي</h2>
          <p className="text-slate-500 font-medium">متابعة تفاعلية لكافة التحركات داخل شركة تكوين</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 animate-pulse">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          مباشر الآن
        </div>
      </div>

      <div className="relative space-y-6">
        <div className="absolute top-0 bottom-0 right-6 w-1 bg-gradient-to-b from-blue-100 via-slate-100 to-transparent"></div>
        
        {activities.map(act => {
          const user = employees.find(e => e.id === act.userId);
          return (
            <div key={act.id} className="relative pr-16 group">
              {/* Timeline Dot */}
              <div className="absolute right-4 top-6 w-5 h-5 rounded-full bg-white border-4 border-blue-600 z-10 transition-all group-hover:scale-125 shadow-sm"></div>
              
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group-hover:-translate-x-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => user && onUserClick(user)}
                      className="shrink-0 relative group/avatar"
                    >
                      <img src={user?.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-50 shadow-sm transition-transform group-hover/avatar:scale-105" alt="" />
                      <div className="absolute inset-0 bg-blue-600/20 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={14} className="text-white" />
                      </div>
                    </button>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <button 
                          onClick={() => user && onUserClick(user)}
                          className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                        >
                          {user?.name}
                        </button>
                        <span className="text-[10px] text-slate-400 font-bold">• {act.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {act.action} 
                        {act.targetName && (
                          <button 
                            onClick={() => handleTargetClick(act)}
                            className={`mr-1 font-bold transition-all px-2 py-0.5 rounded-lg ${
                              act.type === 'TASK' ? 'text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white' : 
                              act.type === 'ADMIN' ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white' : 
                              'text-slate-700'
                            }`}
                          >
                            "{act.targetName}"
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {act.type === 'TASK' && <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><PlusCircle size={18} /></div>}
                    {act.type === 'AUTH' && <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><LogIn size={18} /></div>}
                    {act.type === 'ADMIN' && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CheckCircle size={18} /></div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pr-16 py-4">
          <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
            تحميل المزيد من النشاطات...
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
