
import React, { useState, useEffect } from 'react';
import { 
  LogIn, LogOut, Clock, Calendar, MapPin, History, CheckCircle2, XCircle, FileText, Download, FileSpreadsheet
} from 'lucide-react';
import { Employee, Role } from '../types';

interface AttendanceSystemProps {
  currentUser: Employee;
  employees: Employee[];
}

const AttendanceSystem: React.FC<AttendanceSystemProps> = ({ currentUser, employees }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.DEPT_MANAGER;
  
  // Persistence for individual user attendance
  const [records, setRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem(`takween_attendance_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [
      { date: '2024-05-25', in: '08:30 ص', out: '04:30 م', status: 'PRESENT', delayMinutes: 0 },
      { date: '2024-05-24', in: '08:45 ص', out: '04:15 م', status: 'LATE', delayMinutes: 15 }
    ];
  });

  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const status = localStorage.getItem(`takween_status_${currentUser.id}`);
    return status === 'IN';
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(`takween_attendance_${currentUser.id}`, JSON.stringify(records));
    localStorage.setItem(`takween_status_${currentUser.id}`, isCheckedIn ? 'IN' : 'OUT');
  }, [records, isCheckedIn, currentUser.id]);

  const handleToggleAttendance = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    // Simple delay logic: after 8:30 AM is LATE
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > 8 || (hour === 8 && minute > 30);
    const delayMinutes = isLate ? (hour * 60 + minute) - (8 * 60 + 30) : 0;

    if (!isCheckedIn) {
      setIsCheckedIn(true);
      const newRecord = { 
        date: dateStr, 
        in: timeStr, 
        out: '-', 
        status: isLate ? 'LATE' : 'PRESENT',
        delayMinutes: delayMinutes
      };
      setRecords([newRecord, ...records]);
    } else {
      setIsCheckedIn(false);
      const updatedRecords = [...records];
      if (updatedRecords.length > 0) {
        updatedRecords[0].out = timeStr;
        setRecords(updatedRecords);
      }
    }
  };

  const exportMonthlyPayrollReport = () => {
    // In a real app, this would fetch data for ALL employees for the current month.
    // For this demo, we'll simulate a report for all employees using mock data.
    
    let csvContent = "\ufeff"; // BOM for Excel/Google Sheets RTL support
    csvContent += "اسم الموظف,القسم,أيام الحضور,أيام التأخير,إجمالي دقائق التأخير,معدل التأخير (دقيقة/يوم),الإجازات المستهلكة,ملاحظات\n";
    
    employees.forEach(emp => {
      // Mock data for each employee's month
      const attendanceDays = Math.floor(Math.random() * 5) + 20;
      const lateDays = Math.floor(Math.random() * 8);
      const totalDelay = lateDays * (Math.floor(Math.random() * 20) + 5);
      const avgDelay = attendanceDays > 0 ? (totalDelay / attendanceDays).toFixed(1) : 0;
      const leaves = Math.floor(Math.random() * 3);
      const dept = emp.departmentId;

      csvContent += `${emp.name},${dept},${attendanceDays},${lateDays},${totalDelay},${avgDelay},${leaves},-\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_الرواتب_تكوين_${new Date().getMonth() + 1}_2024.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">نظام الحضور والرواتب</h2>
          <p className="text-slate-500">أهلاً {currentUser.name}، يمكنك تسجيل حضورك واستخراج تقارير الرواتب.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={exportMonthlyPayrollReport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} /> تصدير كشف الرواتب (CSV)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full border-8 border-slate-50 flex flex-col items-center justify-center mb-8 relative">
              <p className="text-4xl font-bold text-slate-800 tabular-nums">
                {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">توقيت الشركة</div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <MapPin size={14} /> <span>الموقع: المقر الرئيسي - المنامة</span>
              </div>
              <button onClick={handleToggleAttendance} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isCheckedIn ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                {isCheckedIn ? <LogOut size={24} /> : <LogIn size={24} />}
                {isCheckedIn ? 'تسجيل الانصراف' : 'تسجيل الحضور'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" /> سجل الحضور الأخير
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-slate-50">
                    <th className="pb-4 font-bold">التاريخ</th>
                    <th className="pb-4 font-bold">الحضور</th>
                    <th className="pb-4 font-bold">الانصراف</th>
                    <th className="pb-4 font-bold">تأخير (دقيقة)</th>
                    <th className="pb-4 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((row, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-700">{row.date}</td>
                      <td className="py-4 text-sm text-slate-500">{row.in}</td>
                      <td className="py-4 text-sm text-slate-500">{row.out}</td>
                      <td className="py-4 text-sm font-bold text-rose-500">{row.delayMinutes || 0}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {row.status === 'PRESENT' ? 'حاضر' : 'تأخير'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" /> ملخص الشهر
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">أيام العمل</span>
                <span className="font-bold">22 يوم</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">أيام الحضور</span>
                <span className="font-bold text-emerald-600">{records.length} يوم</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">مرات التأخير</span>
                <span className="font-bold text-amber-600">{records.filter(r => r.status === 'LATE').length} مرات</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold mb-6">جاهزية الراتب</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">إجمالي التأخير</p>
                   <p className="text-xl font-bold">{records.reduce((acc, r) => acc + (r.delayMinutes || 0), 0)} دقيقة</p>
                </div>
                <Clock size={32} className="text-blue-400" />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">يتم حساب الراتب تلقائياً بناءً على هذه الأرقام في التقرير المستخرج.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;
