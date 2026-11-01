import { useState, useEffect } from 'react';
import { Plus, FolderOpen, Trash2, Edit, CheckSquare, Eye } from 'lucide-react';
import { projectsApi } from '../services/api';
import { SkeletonLoader, ErrorMessage, EmptyState, ProgressBar, ConfirmDialog, Modal, Input } from '../components/ui/index';
import { useToast } from '../context/ToastContext';

const ProjectsPage = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#8b5cf6' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await projectsApi.getAll();
      setProjects(data.data?.projects || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    setSaving(true);
    try {
      if (editProject) {
        await projectsApi.update(editProject._id, form);
        toast.success('Project updated');
      } else {
        await projectsApi.create(form);
        toast.success('Project created');
      }
      setFormOpen(false); setEditProject(null);
      setForm({ name: '', description: '', color: '#8b5cf6' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save project');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await projectsApi.delete(deleteTarget._id);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchProjects();
    } catch { toast.error('Failed to delete project'); }
  };

  const openCreate = () => { setEditProject(null); setForm({ name: '', description: '', color: '#8b5cf6' }); setFormOpen(true); };
  const openEdit = (p) => { setEditProject(p); setForm({ name: p.name, description: p.description || '', color: p.color || '#8b5cf6' }); setFormOpen(true); };

  const openDetails = async (project) => {
    setProjectDetails({ project, tasks: [] });
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const { data } = await projectsApi.getById(project._id);
      setProjectDetails(data.data);
    } catch (err) {
      setDetailsError(err.response?.data?.error || 'Failed to load project details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a3e635', '#f97316', '#e879f9'];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>Projects</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="projects-new" className="btn-brand" onClick={openCreate}><Plus size={16} /> New Project</button>
      </div>

      {loading && <SkeletonLoader count={3} height={140} />}
      {error && <ErrorMessage message={error} onRetry={fetchProjects} />}

      {!loading && !error && projects.length === 0 && (
        <EmptyState icon={FolderOpen} title="No projects yet" message="Organize your tasks into projects for better tracking." action={<button className="btn-brand" onClick={openCreate}><Plus size={16} /> Create Project</button>} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {projects.map((p) => (
          <div key={p._id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${p.color}25`, border: `1px solid ${p.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderOpen size={16} style={{ color: p.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>{p.name}</h3>
                  <span style={{ fontSize: '0.7rem', color: p.status === 'active' ? '#34d399' : '#6b6b8a', fontWeight: 500 }}>{p.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button aria-label={`View ${p.name} details`} title="View project details" onClick={() => openDetails(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 5, borderRadius: 6 }} onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'} onMouseLeave={(e) => e.currentTarget.style.color = '#52526e'}>
                  <Eye size={14} />
                </button>
                <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 5, borderRadius: 6 }} onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'} onMouseLeave={(e) => e.currentTarget.style.color = '#52526e'}>
                  <Edit size={14} />
                </button>
                <button onClick={() => setDeleteTarget(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 5, borderRadius: 6 }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#52526e'}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {p.description && <p style={{ fontSize: '0.8125rem', color: '#6b6b8a', marginBottom: '1rem', lineHeight: 1.5 }}>{p.description}</p>}

            <div style={{ marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>{p.completedCount}/{p.taskCount} tasks</span>
                <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>{p.progress}%</span>
              </div>
              <ProgressBar value={p.progress} max={100} color={p.color} height={5} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.75rem' }}>
              <CheckSquare size={13} style={{ color: '#52526e' }} />
              <span style={{ fontSize: '0.75rem', color: '#52526e' }}>{p.taskCount} task{p.taskCount !== 1 ? 's' : ''} total</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditProject(null); }} title={editProject ? 'Edit Project' : 'Create Project'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
          <Input id="proj-name" label="Project Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="My Awesome Project" />
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Description</label>
            <textarea className="input-field" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description..." />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.5rem' }}>Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'border 0.15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={() => { setFormOpen(false); setEditProject(null); }}>Cancel</button>
            <button type="submit" className="btn-brand" disabled={saving}>{saving ? 'Saving...' : editProject ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Project" message={`Delete "${deleteTarget?.name}"? Tasks in this project will be unassigned.`} confirmText="Delete Project" />

      <Modal open={!!projectDetails} onClose={() => setProjectDetails(null)} title={projectDetails?.project?.name || 'Project details'} maxWidth={680}>
        {detailsLoading ? <SkeletonLoader count={3} height={54} /> : detailsError ? (
          <ErrorMessage message={detailsError} onRetry={() => projectDetails?.project && openDetails(projectDetails.project)} />
        ) : projectDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ color: '#9ca3af', margin: 0 }}>{projectDetails.project.description || 'No project description.'}</p>
              <p style={{ color: '#6b6b8a', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                {projectDetails.project.status} · {projectDetails.tasks.filter((task) => task.status === 'completed').length}/{projectDetails.tasks.length} tasks complete
              </p>
            </div>
            <h3 style={{ color: '#e2e2f0', fontSize: '0.9rem', margin: 0 }}>Project tasks</h3>
            {projectDetails.tasks.length ? projectDetails.tasks.map((task) => (
              <div key={task._id} className="task-card" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: '#e2e2f0', fontSize: '0.875rem' }}>{task.title}</span>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{task.status.replace('-', ' ')} · {task.priority}</span>
              </div>
            )) : <EmptyState icon={CheckSquare} title="No tasks in this project" message="Assign tasks to this project from the task editor." />}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectsPage;
