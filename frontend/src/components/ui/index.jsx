// Shared reusable UI components — Week 1 requirement
import { Loader2 } from 'lucide-react';

// =========================================================
// LoadingSpinner
// =========================================================
export const LoadingSpinner = ({ size = 24, message = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem' }}>
    <Loader2 size={size} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
    {message && <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>{message}</p>}
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// =========================================================
// SkeletonLoader
// =========================================================
export const SkeletonLoader = ({ count = 3, height = 80 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height, borderRadius: 10 }} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="task-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div className="skeleton" style={{ height: 18, width: '70%' }} />
    <div className="skeleton" style={{ height: 14, width: '90%' }} />
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
      <div className="skeleton" style={{ height: 22, width: 60 }} />
      <div className="skeleton" style={{ height: 22, width: 70 }} />
    </div>
  </div>
);

// =========================================================
// ErrorMessage
// =========================================================
export const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: '1.25rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  }}>
    <p style={{ color: '#fb7185', fontSize: '0.875rem' }}>{message || 'Something went wrong.'}</p>
    {onRetry && (
      <button className="btn-outline" onClick={onRetry} style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>
        Try Again
      </button>
    )}
  </div>
);

// =========================================================
// EmptyState
// =========================================================
export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
    {Icon && (
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} style={{ color: '#8b5cf6' }} />
      </div>
    )}
    <h3 style={{ color: '#e2e2f0', fontWeight: 600, fontSize: '1rem', margin: 0 }}>{title}</h3>
    {message && <p style={{ color: '#6b6b8a', fontSize: '0.875rem', margin: 0, maxWidth: 320 }}>{message}</p>}
    {action}
  </div>
);

// =========================================================
// Badge
// =========================================================
export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const styles = {
    default: { background: 'rgba(107, 107, 138, 0.2)', color: '#9ca3af', border: '1px solid rgba(107, 107, 138, 0.3)' },
    brand: { background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' },
    success: { background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)' },
    danger: { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' },
    warning: { background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)' },
    cyan: { background: 'rgba(34, 211, 238, 0.12)', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.25)' },
  };
  const paddings = { xs: '2px 6px', sm: '3px 8px', md: '4px 10px' };
  return (
    <span style={{
      ...styles[variant] || styles.default,
      padding: paddings[size] || paddings.sm,
      borderRadius: 6,
      fontSize: size === 'xs' ? '0.7rem' : '0.75rem',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

// =========================================================
// PriorityBadge
// =========================================================
export const PriorityBadge = ({ priority }) => {
  const cfg = {
    low: { label: 'Low', cls: 'priority-low' },
    medium: { label: 'Medium', cls: 'priority-medium' },
    high: { label: 'High', cls: 'priority-high' },
    urgent: { label: 'Urgent', cls: 'priority-urgent' },
  };
  const { label, cls } = cfg[priority] || cfg.medium;
  return <span className={cls} style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>;
};

// =========================================================
// StatusBadge
// =========================================================
export const StatusBadge = ({ status }) => {
  const cfg = {
    'todo': { label: 'To Do', cls: 'status-todo' },
    'in-progress': { label: 'In Progress', cls: 'status-in-progress' },
    'completed': { label: 'Completed', cls: 'status-completed' },
  };
  const { label, cls } = cfg[status] || cfg['todo'];
  return <span className={cls} style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>;
};

// =========================================================
// Modal
// =========================================================
export const Modal = ({ open, onClose, title, children, maxWidth = 540 }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="modal-title" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a', padding: 4 }} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

// =========================================================
// ConfirmDialog
// =========================================================
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Delete', confirmClass = 'btn-danger' }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 420 }} role="alertdialog">
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '0.5rem' }}>{title}</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{message}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// Input
// =========================================================
export const Input = ({ label, error, id, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    {label && <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af' }}>{label}</label>}
    <input id={id} className={`input-field${error ? ' error' : ''}`} {...props} />
    {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
  </div>
);

// =========================================================
// Select
// =========================================================
export const Select = ({ label, error, id, children, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    {label && <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af' }}>{label}</label>}
    <select id={id} className={`input-field${error ? ' error' : ''}`} style={{ cursor: 'pointer' }} {...props}>
      {children}
    </select>
    {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
  </div>
);

// =========================================================
// ProgressBar
// =========================================================
export const ProgressBar = ({ value, max = 100, color = '#8b5cf6', height = 6 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: height, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: height,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
};
