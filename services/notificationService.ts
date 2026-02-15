
import { GoogleGenAI } from "@google/genai";
import { Employee, Task, LeaveRequest } from "../types";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'LIVE';
  timestamp: string;
  read: boolean;
}

/**
 * خدمة الإشعارات والبريد الإلكتروني - شركة تكوين للهندسة
 * توفر واجهة برمجية متكاملة للتعامل مع البريد الصادر ونظام البث المباشر (WebSocket Simulation).
 */
export const notificationService = {
  
  // نظام بث الأحداث الحية (Simulated WebSocket)
  broadcast(event: string, payload: any) {
    const customEvent = new CustomEvent('takween_live_event', { 
      detail: { event, payload, timestamp: new Date().toISOString() } 
    });
    window.dispatchEvent(customEvent);
  },

  // الاشتراك في الأحداث الحية
  subscribe(callback: (detail: any) => void) {
    const handler = (e: any) => callback(e.detail);
    window.addEventListener('takween_live_event', handler);
    return () => window.removeEventListener('takween_live_event', handler);
  },

  // توليد محتوى بريد إلكتروني رسمي باستخدام Gemini
  async generateEmailContent(eventType: string, data: any): Promise<{ subject: string, body: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `قم بصياغة محتوى بريد إلكتروني رسمي ومهني جداً باللغة العربية لحدث في شركة هندسية: ${eventType}. 
        البيانات المتوفرة: ${JSON.stringify(data)}. 
        يجب أن يكون النص بلهجة واثقة ومشجعة.
        تنسيق المخرجات:
        الموضوع: [عنوان البريد]
        النص: [محتوى البريد]`,
        config: {
          systemInstruction: "أنت مدير التواصل الإداري في 'شركة تكوين للهندسة'. وظيفتك هي تحويل الأحداث الإدارية إلى رسائل بريدية مهنية ومؤثرة ترفع من معنويات الموظفين وتحافظ على الانضباط.",
        }
      });
      
      const text = response.text || "";
      const subject = text.match(/الموضوع:(.*)/)?.[1]?.trim() || "إشعار من الإدارة - شركة تكوين";
      const body = text.split(/النص:|المحتوى:/).pop()?.trim() || `تم تسجيل تحديث لحدث: ${eventType}. يرجى مراجعة المنصة.`;
      
      return { subject, body };
    } catch (error) {
      console.error("AI Email Generation failed:", error);
      return { 
        subject: "تحديث هام من شركة تكوين للهندسة", 
        body: `عزيزي الموظف، نود إخطارك بوقوع الحدث التالي: ${eventType}. يرجى التحقق من تفاصيل المهمة/الطلب عبر لوحة التحكم الخاصة بك.` 
      };
    }
  },

  // محاكاة إرسال البريد الإلكتروني
  async sendEmail(to: string, subject: string, body: string) {
    console.group(`%c [EMAIL SERVICE] OUTGOING MAIL`, 'color: #2563eb; font-weight: bold; font-size: 12px;');
    console.log(`%c TO: ${to}`, 'color: #1e293b; font-weight: bold;');
    console.log(`%c SUBJECT: ${subject}`, 'color: #2563eb;');
    console.groupEnd();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },

  // إرسال إشعار تعيين مهمة
  async notifyTaskAssignment(employee: Employee, task: Task) {
    // إرسال الإشعار الحي أولاً (Real-time)
    this.broadcast('TASK_ASSIGNED', { employee, task });

    const { subject, body } = await this.generateEmailContent('إسناد مهمة هندسية جديدة', { 
      employeeName: employee.name, 
      taskTitle: task.title, 
      dueDate: task.dueDate,
      priority: task.priority
    });
    await this.sendEmail(employee.email, subject, body);
    return { title: subject, message: `تم إرسال بريد تعيين مهمة "${task.title}" للمهندس ${employee.name}` };
  },

  // إشعار اقتراب موعد التسليم
  async notifyDeadlineApproaching(employee: Employee, task: Task) {
    this.broadcast('DEADLINE_ALERT', { employee, task });
    const { subject, body } = await this.generateEmailContent('تذكير بموعد تسليم نهائي قريب', { 
      employeeName: employee.name, 
      taskTitle: task.title, 
      dueDate: task.dueDate
    });
    await this.sendEmail(employee.email, subject, body);
    return { title: subject, message: `تذكير بريدي: موعد تسليم "${task.title}" اقترب.` };
  },

  // إرسال إشعار تحديث حالة طلب إجازة
  async notifyLeaveStatus(employee: Employee, request: LeaveRequest) {
    this.broadcast('LEAVE_STATUS_CHANGED', { employee, request });
    const statusText = request.status === 'APPROVED' ? 'تمت الموافقة عليه' : 'تم الاعتذار عن قبوله';
    const { subject, body } = await this.generateEmailContent('تحديث حالة طلب إجازة إداري', { 
      employeeName: employee.name, 
      status: statusText, 
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate
    });
    await this.sendEmail(employee.email, subject, body);
    return { title: subject, message: `تم إبلاغ ${employee.name} بقرار الإجازة بريدياً.` };
  }
};
