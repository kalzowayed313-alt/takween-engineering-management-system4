
import React, { useState, useEffect, useRef } from 'react';
import { LogIn, UserPlus, Mail, ShieldCheck, KeyRound, Sparkles, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Employee, Role } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
  onRegister: (name: string, email: string, password: string) => Employee;
}

type LoginStep = 'INITIAL' | 'PASSWORD_CHECK' | 'SIGNUP_FORM' | 'PENDING';

const Login: React.FC<LoginProps> = ({ onLogin, employees, onRegister }) => {
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setStep('PASSWORD_CHECK');
    } else {
      setError('هذا البريد غير مسجل، يمكنك الضغط على "ليس لديك حساب" بالأسفل لإنشاء واحد جديد.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.password === password) {
      if (user.status === 'PENDING') {
        setStep('PENDING');
      } else {
        onLogin(user);
      }
    } else {
      setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      return;
    }
    const emailExists = employees.some(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setError('هذا البريد مسجل بالفعل في النظام.');
      return;
    }
    
    setError('');
    onRegister(name, email, password);
    setStep('PENDING');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/10 p-3 ring-8 ring-white/5">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem]">
            
            {step === 'INITIAL' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white mb-2 shadow-xl shadow-blue-500/20">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">بوابة مهندسي تكوين</h2>
                  <p className="text-xs text-slate-500 mt-1">سجل دخولك للوصول للمشاريع والمهام</p>
                </div>
                
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-black text-slate-400 mr-4 uppercase">البريد الإلكتروني المهني</label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="email" 
                        placeholder="example@takween.com" 
                        className="w-full pr-14 pl-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-right"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  {error && <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>}
                  
                  <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    <LogIn size={20} /> متابعة
                  </button>
                  
                  <div className="pt-4 flex flex-col items-center gap-2">
                    <p className="text-xs font-bold text-slate-400">ليس لديك حساب؟</p>
                    <button 
                      type="button" 
                      onClick={() => { setError(''); setStep('SIGNUP_FORM'); }}
                      className="text-blue-600 font-black text-sm hover:underline hover:scale-105 transition-transform"
                    >
                      اضغط هنا لتقديم طلب انضمام
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'PASSWORD_CHECK' && (
              <div className="space-y-8 animate-in zoom-in duration-500 text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-blue-100 dark:border-blue-800 shadow-inner">
                  <Lock size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">كلمة المرور</h2>
                  <p className="text-xs text-slate-500 mt-1">{email}</p>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="relative">
                    <KeyRound className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="w-full pr-14 pl-14 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-center" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>}
                  
                  <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[1.8rem] font-black shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3">
                    <LogIn size={20} /> دخول للنظام
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setStep('INITIAL'); setPassword(''); }} 
                    className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    العودة للخلف
                  </button>
                </form>
              </div>
            )}

            {step === 'SIGNUP_FORM' && (
              <div className="space-y-6 animate-in zoom-in duration-500 text-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">انضم لعائلة تكوين</h2>
                  <p className="text-xs text-slate-500 mt-1">املأ بياناتك وسيتم تفعيل حسابك من قبل المدير</p>
                </div>
                
                <form onSubmit={handleSignupSubmit} className="space-y-4 text-right">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">الاسم الكامل (مع اللقب الهندسي)</label>
                    <div className="relative">
                      <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pr-14 pl-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-right dark:text-white" placeholder="م. عبدالله محمد" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pr-14 pl-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-right dark:text-white" placeholder="email@takween.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">كلمة المرور</label>
                      <div className="relative">
                        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-center dark:text-white" placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase">تأكيد الكلمة</label>
                      <div className="relative">
                        <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-center dark:text-white" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-[10px] text-rose-500 font-bold text-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>}
                  
                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2">
                    <UserPlus size={20} /> إرسال طلب الانضمام
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setError(''); setStep('INITIAL'); }} 
                    className="w-full text-[10px] font-bold text-slate-400 hover:text-blue-600 py-2"
                  >
                    لديك حساب بالفعل؟ عد لتسجيل الدخول
                  </button>
                </form>
              </div>
            )}

            {step === 'PENDING' && (
              <div className="text-center space-y-8 animate-in zoom-in duration-500 py-10">
                <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto border-4 border-amber-100 dark:border-amber-900/30 relative shadow-inner">
                   <ShieldCheck size={48} className="text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-3 px-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">طلبك قيد المراجعة</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    شكراً لانضمامك لـ "تكوين". سيقوم المدير العام بمراجعة بياناتك وتعيين قسمك وتفعيل حسابك خلال وقت قصير.
                  </p>
                </div>
                <button 
                  onClick={() => { setStep('INITIAL'); setError(''); setName(''); setPassword(''); setConfirmPassword(''); }} 
                  className="text-xs font-black text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-xl transition-all"
                >
                  العودة لشاشة الدخول الرئيسية
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
