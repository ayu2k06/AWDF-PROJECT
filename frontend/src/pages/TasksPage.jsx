import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Grid, List, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { tasksApi } from '../services/api';
import { SkeletonCard, ErrorMessage, EmptyState, PriorityBadge, StatusBadge, ConfirmDialog } from '../components/ui/index';
import TaskForm from '../components/tasks/TaskForm';
import { useToast } from '../context/ToastContext';
import { CheckSquare } from 'lucide-react';

const STATUSES = ['', 'todo', 'in-progress', 'completed'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['', 'General', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'Creative'];

const TasksPage = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'grid'
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '', dueDate: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1 });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.dueDate) params.dueDate = filters.dueDate;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;
      params.page = filters.page;
      params.limit = 12;

      const { data } = await tasksApi.getAll(params);
      setTasks(data.data?.tasks || []);
      setPagination(data.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, filters.search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTasks, filters.search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tasksApi.delete(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: key !== 'page' ? 1 : value }));

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : null;

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>My Tasks</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {pagination.total} task{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button id="tasks-new-task" className="btn-brand" onClick={() => { setEditTask(null); setTaskFormOpen(true); }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
          <input
            id="tasks-search"
            className="input-field"
            style={{ paddingLeft: 32, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        <select id="tasks-filter-status" className="input-field" style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem' }} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.slice(1).map((s) => <option key={s} value={s}>{s.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
        </select>

        <select id="tasks-filter-priority" className="input-field" style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem' }} value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.slice(1).map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>

        <select id="tasks-filter-category" className="input-field" style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem' }} value={filters.category} onChange={(e) => setFilter('category', e.target.value)} aria-label="Filter by category">
          {CATEGORIES.map((category) => <option key={category || 'all'} value={category}>{category || 'All Categories'}</option>)}
        </select>

        <select id="tasks-filter-due-date" className="input-field" style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem' }} value={filters.dueDate} onChange={(e) => setFilter('dueDate', e.target.value)} aria-label="Filter by due date">
          <option value="">Any Due Date</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due in 3 days</option>
          <option value="upcoming">Upcoming</option>
          <option value="no-date">No Due Date</option>
        </select>

        <select id="tasks-sort" className="input-field" style={{ flex: '0 0 auto', width: 'auto', padding: '0.5rem 0.75rem' }} value={`${filters.sortBy}-${filters.sortOrder}`} onChange={(e) => {
          const [by, order] = e.target.value.split('-');
          setFilters((f) => ({ ...f, sortBy: by, sortOrder: order, page: 1 }));
        }}>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="dueDate-asc">Due Date (Soonest)</option>
          <option value="priority-desc">Priority (High)</option>
          <option value="title-asc">Title A–Z</option>
        </select>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
          {[['list', List], ['grid', Grid]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '0.5rem', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(139,92,246,0.15)' : 'transparent', color: view === v ? '#a78bfa' : '#52526e' }}>
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error && <ErrorMessage message={error} onRetry={fetchTasks} />}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '0.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          message={filters.search || filters.status || filters.priority || filters.category || filters.dueDate ? 'Try adjusting your filters.' : "You haven't created any tasks yet. Create your first task to get started!"}
          action={<button className="btn-brand" onClick={() => { setEditTask(null); setTaskFormOpen(true); }}><Plus size={16} /> New Task</button>}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '0.75rem' }}>
            {tasks.map((task) => (
              <div key={task._id} className="task-card" style={{ borderLeft: isOverdue(task) ? '3px solid #ef4444' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#e2e2f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </h3>
                      {isOverdue(task) && <span style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>OVERDUE</span>}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '0.8125rem', color: '#6b6b8a', margin: '0 0 0.625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: view === 'grid' ? 'nowrap' : 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.category && task.category !== 'General' && (
                        <span style={{ fontSize: '0.7rem', color: '#52526e', background: 'rgba(82,82,110,0.15)', padding: '2px 7px', borderRadius: 5 }}>{task.category}</span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: '0.7rem', color: isOverdue(task) ? '#ef4444' : '#52526e', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.project && (
                        <span style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '2px 7px', borderRadius: 5 }}>
                          📁 {task.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditTask(task); setTaskFormOpen(true); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 6, borderRadius: 6, transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#52526e'; e.currentTarget.style.background = 'none'; }}
                      title="Edit task"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(task)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 6, borderRadius: 6, transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#52526e'; e.currentTarget.style.background = 'none'; }}
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn-outline" style={{ padding: '0.375rem 0.75rem' }} disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Page {filters.page} of {pagination.totalPages}
              </span>
              <button className="btn-outline" style={{ padding: '0.375rem 0.75rem' }} disabled={filters.page >= pagination.totalPages} onClick={() => setFilter('page', filters.page + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <TaskForm
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditTask(null); }}
        onSaved={fetchTasks}
        initialTask={editTask}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
      />
    </div>
  );
};

export default TasksPage;
