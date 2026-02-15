
import React, { useState, useMemo } from 'react';
import { 
  Paperclip, MessageSquare, AlertCircle, Filter, FileCode, 
  Calendar, ChevronRight, Zap, MoreHorizontal, Plus, Eye, Users, Lock, Cloud
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskStatus, TaskPriority, Task, Employee, Role } from '../types';
import { DEPARTMENTS } from '../constants';
import { notificationService } from '../services/notificationService';

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (task: Task) => void;
  currentUser: Employee;
  employees: Employee[];
}

const STATUS_LABELS: Record<TaskStatus, { color: string, label: string, borderColor: string, iconColor: string }> = {
  [TaskStatus.NEW]: { color: 'bg-slate-500', label: 'جديد', borderColor: 'border-slate-200', iconColor: 'text-slate-500' },
  [TaskStatus.IN_PROGRESS]: { color: 'bg-blue-600', label: 'قيد التنفيذ', borderColor: 'border-blue-200', iconColor: 'text-blue-600' },
  [TaskStatus.REVIEW]: { color: 'bg-purple-600', label: 'قيد المراجعة', borderColor: 'border-purple-200', iconColor: 'text-purple-600' },
  [TaskStatus.PENDING]: { color: 'bg-amber-600', label: 'معلق', borderColor: 'border-amber-200', iconColor: 'text-amber-600' },
  [TaskStatus.COMPLETED]: { color: 'bg-emerald-600', label: 'مكتمل', borderColor: 'border-emerald-200', iconColor: 'text-emerald-600' }
};

const PRIORITY_THEMES: Record<TaskPriority, { bg: string, text: string, dot: string, glow: string }> = {
  [TaskPriority.HIGH]: { 
    bg: 'bg-rose-50 dark:bg-rose-950/40', 
    text: 'text-rose-600 dark:text-rose-400', 
    dot: 'bg-rose-500 animate-pulse',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)] border-rose-100 dark:border-rose-900/30'
  },
  [TaskPriority.MEDIUM]: { 
    bg: 'bg-amber-50 dark:bg-amber-950/40', 
    text: 'text-amber-600 dark:text-amber-400', 
    dot: 'bg-amber-500',
    glow: 'border-amber-100 dark:border-amber-900/30'
  },
  [TaskPriority.LOW]: { 
    bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
    text: 'text-emerald-600 dark:text-emerald-400', 
    dot: 'bg-emerald-500',
    glow: 'border-emerald-100 dark:border-amber-900/30'
  }
};

const TaskCard: React.FC<{ task: Task, employees: Employee[], index: number, onClick: () => void, isCurrentUserTask: boolean }> = ({ task, employees, index, onClick, isCurrentUserTask }) => {
  const assignee = employees.find(e => e.id === task.assignedTo);
  const dept = DEPARTMENTS.find(d => d.id === task.departmentId);
  const priorityTheme = PRIORITY_THEMES[task.priority];
  const commentCount = task.comments?.length || 0;
  const attachmentCount = task.attachments?.length || 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white dark:bg-slate-900 p-5 rounded-[2rem] border-2 transition-all duration-300 mb-4 group relative overflow-hidden cursor-grab active:cursor-grabbing ${
            snapshot.isDragging 
              ? 'shadow-2xl ring-8 ring-blue-500/10 scale-[1.05] border-blue-500' 
              : `border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:border-blue-200`
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${priorityTheme.bg} ${priorityTheme.text} ${priorityTheme.glow}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${priorityTheme.dot}`}></div>
              <span className="text-[10px] font-black uppercase leading-none">{task.priority}</span>
            </div>
            
            {attachmentCount > 0 && (
               <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                  <Cloud size={12} />
                  <span className="text-[9px] font-black">{attachmentCount}</span>
               </div>
            )}
          </div>
          
          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 leading-snug line-clamp-2 px-1 text-right">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
               <img src={assignee?.avatar} className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-800 object-cover shadow-sm" alt="" />
               <div className="flex flex-col text-right">
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 leading-tight">{assignee?.name}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 text-slate-300 dark:text-slate-700`}>
                 <MessageSquare size={14} />
                 <span className="text-[10px] font-black">{commentCount}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                <Zap size={10} fill="currentColor" />
                <span className="text-[9px] font-black">{task.kpiPoints}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, setTasks, onTaskClick, currentUser, employees }) => {
  const [viewMode, setViewMode] = useState<'DEPARTMENT' | 'PERSONAL'>(currentUser.role === Role.EMPLOYEE ? 'PERSONAL' : 'DEPARTMENT');
  const isGeneralAdmin = currentUser.role === Role.ADMIN;
  const isTeamLeader = currentUser.role === Role.TEAM_LEADER || currentUser.role === Role.DEPT_MANAGER;

  const filteredTasks = useMemo(() => {
    let pool = isGeneralAdmin ? tasks : tasks.filter(t => t.departmentId === currentUser.departmentId);
    if (viewMode === 'PERSONAL') pool = pool.filter(t => t.assignedTo === currentUser.id);
    return pool;
  }, [tasks, viewMode, currentUser, isGeneralAdmin]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskToUpdate = tasks.find(t => t.id === draggableId);
    if (!isGeneralAdmin && !isTeamLeader && taskToUpdate?.assignedTo !== currentUser.id) {
       alert("لا تملك الصلاحية لتحريك هذه المهمة.");
       return;
    }

    const updatedTasks = tasks.map(task => {
      if (task.id === draggableId) {
        return { ...task, status: destination.droppableId as TaskStatus };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-[1.5rem] text-white shadow-2xl">
               <Zap size={26} fill="currentColor" />
             </div>
             {viewMode === 'PERSONAL' ? 'مهامي الهندسية' : 'لوحة متابعة القسم'}
          </h2>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
          <button onClick={() => setViewMode('DEPARTMENT')} className={`px-8 py-2.5 rounded-2xl text-xs font-black transition-all ${viewMode === 'DEPARTMENT' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>مهام الفريق</button>
          <button onClick={() => setViewMode('PERSONAL')} className={`px-8 py-2.5 rounded-2xl text-xs font-black transition-all ${viewMode === 'PERSONAL' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>مهامي فقط</button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-10 overflow-x-auto pb-12 custom-scrollbar min-h-[750px] items-start px-2">
          {Object.values(TaskStatus).map((status) => (
            <div key={status} className="flex-shrink-0 w-[350px] flex flex-col">
              <div className="flex items-center gap-4 mb-8 px-6">
                <div className={`w-3 h-3 rounded-full ${STATUS_LABELS[status].color} shadow-lg`}></div>
                <h3 className="text-base font-black text-slate-700 dark:text-white uppercase tracking-widest">{STATUS_LABELS[status].label}</h3>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-black text-slate-500">
                  {filteredTasks.filter(t => t.status === status).length}
                </div>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-4 max-h-[850px] overflow-y-auto custom-scrollbar px-4 py-4 min-h-[550px] transition-all rounded-[3rem] ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-slate-50/40 dark:bg-slate-900/30'
                    }`}
                  >
                    {filteredTasks
                      .filter(t => t.status === status)
                      .map((task, index) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          employees={employees} 
                          index={index}
                          onClick={() => onTaskClick(task)} 
                          isCurrentUserTask={task.assignedTo === currentUser.id}
                        />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
