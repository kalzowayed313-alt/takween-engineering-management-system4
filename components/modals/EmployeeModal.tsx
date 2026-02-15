
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Employee, Role } from '../../types';
import { DEPARTMENTS } from '../../constants';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (emp: Employee) => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.EMPLOYEE,
    departmentId: DEPARTMENTS[0].id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Added missing status property as required by Employee interface
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      ...formData,
      avatar: `https://picsum.photos/seed/${Date.now()}/200`,
      kpi: 100,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };
    onAdd(newEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">إضافة موظف جديد</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              placeholder="مثال: م. عبد الله خالد"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <input 
              required
              type="email" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              placeholder="email@takween.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">القسم</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
                value={formData.departmentId}
                onChange={e => setFormData({...formData, departmentId: e.target.value})}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">الدور الوظيفي</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as Role})}
              >
                {Object.values(Role).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              إضافة للشركة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
