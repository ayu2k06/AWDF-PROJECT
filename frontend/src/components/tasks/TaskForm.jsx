import { useState, useEffect } from 'react';
import { Modal, Input, Select } from '../ui/index';
import { tasksApi, projectsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';

const STATUSES = ['todo', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['General', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'Creative'];

const TaskForm = ({ open, onClose, onSaved, initialTask }) => {
  const toast = useToast();
  const isEdit = !!initialTask?._id;
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    category: 'General',
    project: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});

  // Load projects list
  useEffect(() => {
    if (!open) return;
    projectsApi.getAll().then(({ data }) => setProjects(data.data?.projects || [])).catch(() => {});
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (initialTask) {
      setAiSuggestions(initialTask.aiSuggestions || null);
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'todo',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '',
        category: initialTask.category || 'General',
        project: initialTask.project?._id || initialTask.project || '',
        tags: Array.isArray(initialTask.tags) ? initialTask.tags.join(', ') : '',
      });
    } else {
      setAiSuggestions(null);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', category: 'General', project: '', tags: '' });
    }
    setErrors({});
  }, [initialTask, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.length > 200) errs.title = 'Title too long (max 200 chars)';
    return errs;
  };

  const handleAISuggest = async () => {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.warning('Enter at least 3 characters in the title for AI suggestions');
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await aiApi.suggest(form.title, form.description);
      const s = data.data.suggestions;
      setAiSuggestions(s);
      setForm((f) => ({
        ...f,
        description: s.description || f.description,
        priority: s.priority || f.priority,
        dueDate: s.suggestedDeadlineDays
          ? new Date(Date.now() + s.suggestedDeadlineDays * 86400000).toISOString().slice(0, 10)
          : f.dueDate,
        tags: s.tags?.length ? s.tags.join(', ') : f.tags,
      }));
      toast.success(s.source === 'fallback'
        ? `AI fallback applied: ${s.disclaimer}`
        : `AI suggestion applied! ${s.explanation}`
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI suggestion failed. You can fill in manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
        project: form.project || null,
        aiSuggestions,
      };

      if (isEdit) {
        await tasksApi.update(initialTask._id, payload);
        toast.success('Task updated successfully');
      } else {
        await tasksApi.create(payload);
        toast.success('Task created! 🎉');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) {
        const fieldErrors = {};
        details.forEach((d) => { fieldErrors[d.field] = d.message; });
        setErrors(fieldErrors);
      } else {
        toast.error(err.response?.data?.error || 'Failed to save task');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
        <div>
          <Input id="task-title" label="Title *" value={form.title} onChange={set('title')} placeholder="Task title..." error={errors.title} maxLength={200} />
          {form.title.trim().length >= 3 && !isEdit && (
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={aiLoading}
              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#a78bfa', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
            >
              {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
              {aiLoading ? 'Getting AI suggestions...' : 'Suggest with AI'}
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </button>
          )}
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Description</label>
          {aiSuggestions && <p style={{ fontSize: '0.72rem', color: '#6b6b8a', margin: '0 0 0.35rem' }}>AI suggestion ({aiSuggestions.source || 'reviewed'}) — review and edit before saving.</p>}
          <textarea
            className="input-field"
            value={form.description}
            onChange={set('description')}
            placeholder="Optional description..."
            rows={3}
            maxLength={2000}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select id="task-status" label="Status" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
          </Select>
          <Select id="task-priority" label="Priority" value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input id="task-due-date" label="Due Date" type="date" value={form.dueDate} onChange={set('dueDate')} />
          <Select id="task-category" label="Category" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Select id="task-project" label="Project (optional)" value={form.project} onChange={set('project')}>
          <option value="">— No Project —</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>

        <Input id="task-tags" label="Tags (comma-separated)" value={form.tags} onChange={set('tags')} placeholder="react, frontend, bug..." />

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn-brand" disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
