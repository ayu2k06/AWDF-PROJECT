import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, Command, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';

const COMMANDS = [
  { label: 'Go to Dashboard', action: '/dashboard', shortcut: 'D' },
  { label: 'My Tasks', action: '/tasks', shortcut: 'T' },
  { label: 'Projects', action: '/projects', shortcut: 'P' },
  { label: 'AI Assistant', action: '/ai-assistant', shortcut: 'A' },
  { label: 'GitHub Explorer', action: '/github', shortcut: 'G' },
  { label: 'Notifications', action: '/notifications', shortcut: 'N' },
  { label: 'Performance', action: '/performance', shortcut: 'F' },
  { label: 'Portfolio', action: '/portfolio', shortcut: 'O' },
  { label: 'Settings', action: '/settings', shortcut: 'S' },
];

const TopNav = ({ sidebarCollapsed, onMobileMenuToggle, breadcrumbs = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdIndex, setCmdIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const inputRef = useRef(null);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  // Keyboard shortcut for Command Palette (Ctrl/Cmd + K)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
        setCmdQuery('');
        setCmdIndex(0);
      }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when palette opens
  useEffect(() => {
    if (commandOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [commandOpen]);

  // Navigation in command palette
  const handleCmdKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCmdIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCmdIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[cmdIndex]) {
      navigate(filtered[cmdIndex].action);
      setCommandOpen(false);
    }
  };

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    notificationsApi.getAll({ unreadOnly: true, limit: 1 })
      .then(({ data }) => setUnreadCount(data.data?.unreadCount || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.getAll({ unreadOnly: true, limit: 1 })
        .then(({ data }) => setUnreadCount(data.data?.unreadCount || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <>
      <header className="top-nav" style={{
        position: 'fixed',
        top: 0, right: 0,
        left: sidebarWidth,
        height: 64,
        zIndex: 150,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5ebe7',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
        transition: 'left 0.3s ease',
      }}>
        {/* Mobile menu */}
        <button className="mobile-menu-button" aria-label="Open navigation menu" onClick={onMobileMenuToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a' }}>
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {i > 0 && <ChevronRight size={14} style={{ color: '#3d3d5c' }} />}
                <span style={{ fontSize: '0.8rem', color: i === breadcrumbs.length - 1 ? '#e2e2f0' : '#52526e', fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}>
                  {b}
                </span>
              </span>
            ))}
          </nav>
        )}

        <div style={{ flex: 1 }} />

        {/* Command Palette Button */}
        <button
          id="cmd-palette-trigger"
          onClick={() => setCommandOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#f5f7f5', border: '1px solid #e1e8e4',
            borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer',
            color: '#65746f', fontSize: '0.8rem', transition: 'all 0.2s',
          }}
          title="Command palette (Ctrl+K)"
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd style={{ background: '#eaf2ef', border: '1px solid #dce8e2', borderRadius: 4, padding: '1px 5px', fontSize: '0.7rem', color: '#27675d', fontFamily: 'monospace' }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          id="nav-notifications"
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#65746f', padding: 6, transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#27675d')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#65746f')}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#27675d', color: 'white',
              fontSize: '0.6rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <button
          id="nav-user-menu"
          onClick={() => navigate('/settings')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#27675d',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.875rem',
          }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </header>

      {/* Command Palette */}
      {commandOpen && (
        <div className="command-overlay" onClick={() => setCommandOpen(false)}>
          <div className="command-palette animate-command-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <Command size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={cmdQuery}
                onChange={(e) => { setCmdQuery(e.target.value); setCmdIndex(0); }}
                onKeyDown={handleCmdKeyDown}
                placeholder="Search commands..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e2f0', fontSize: '0.9rem' }}
              />
              <button onClick={() => setCommandOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52526e' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '0.5rem' }}>
              {filtered.length === 0 ? (
                <p style={{ color: '#52526e', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>No commands found</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.label}
                    onClick={() => { navigate(cmd.action); setCommandOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: i === cmdIndex ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      color: i === cmdIndex ? '#a78bfa' : '#9ca3af',
                      fontSize: '0.875rem', transition: 'all 0.1s', textAlign: 'left',
                    }}
                    onMouseEnter={() => setCmdIndex(i)}
                  >
                    <span>{cmd.label}</span>
                    <kbd style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 4, padding: '1px 6px', fontSize: '0.7rem', color: '#8b5cf6', fontFamily: 'monospace' }}>{cmd.shortcut}</kbd>
                  </button>
                ))
              )}
            </div>
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid rgba(139, 92, 246, 0.08)', display: 'flex', gap: '1rem' }}>
              {[['↑↓', 'navigate'], ['↵', 'select'], ['Esc', 'close']].map(([key, label]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#3d3d5c' }}>
                  <kbd style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 3, padding: '0 4px', fontFamily: 'monospace' }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNav;
