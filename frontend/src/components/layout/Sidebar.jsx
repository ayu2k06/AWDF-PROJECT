import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FolderOpen, Bell, Settings,
  User, Sparkles, GitBranch, Activity, ChevronLeft, ChevronRight,
  Zap, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  { to: '/github', icon: GitBranch, label: 'GitHub Explorer' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/performance', icon: Activity, label: 'Performance' },
  { to: '/portfolio', icon: User, label: 'Portfolio' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ collapsed, mobileOpen, onMobileClose, onToggle }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`sidebar${mobileOpen ? ' open' : ''}`}
      style={{
        width: collapsed ? 64 : 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1rem 0' : '1rem 1rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 64,
      }}>
        <div style={{
          width: 34, height: 34, background: '#27675d',
          borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Zap size={18} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#243330', lineHeight: 1.2 }}>FocusDesk</div>
            <div style={{ fontSize: '0.7rem', color: '#638078', fontWeight: 600 }}>WORKSPACE</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
              borderRadius: 8,
              color: isActive ? '#27675d' : '#65746f',
              background: isActive ? '#eaf2ef' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: 2,
              borderLeft: isActive ? '2px solid #27675d' : '2px solid transparent',
              transition: 'all 0.15s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
        {!collapsed && user && (
          <div style={{ padding: '0.5rem 0.875rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e2f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#52526e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
        )}
        <button
          onClick={logout}
          title="Log out"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
            borderRadius: 8, color: '#6b6b8a', background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            width: '100%', transition: 'all 0.15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6b8a'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute', top: '50%', right: -12,
          transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: '#fff', border: '1px solid #dfe7e3',
          color: '#54756c', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
