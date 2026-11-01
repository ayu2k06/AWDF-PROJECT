import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Bell, Moon, Sun, LogOut, Save, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/index';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '' });
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications !== false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const useDark = theme === 'dark' || (theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', useDark);
      document.documentElement.classList.toggle('light', !useDark);
    };
    applyTheme();
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener?.('change', applyTheme);
    return () => media?.removeEventListener?.('change', applyTheme);
  }, [theme]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setSaving(true);
    try {
      const { data } = await authApi.updateMe({ name: form.name.trim(), preferences: { theme, notifications: notificationsEnabled } });
      updateUser(data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>Settings</h1>
        <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage your profile, preferences, and security</p>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Tabs */}
        <div className="glass-card" style={{ padding: '0.75rem' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: 'none',
                cursor: 'pointer', marginBottom: 2, fontSize: '0.875rem', fontWeight: 500,
                background: activeTab === id ? '#eaf2ef' : 'transparent',
                color: activeTab === id ? '#27675d' : '#65746f',
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #e5ebe7', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <button
              onClick={() => { if (confirm('Are you sure you want to log out?')) logout(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                background: 'transparent', color: '#6b6b8a', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6b6b8a'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>Profile Information</h2>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#27675d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e2f0' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>{user?.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#52526e', marginTop: '0.25rem' }}>
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <Input id="settings-name" label="Display Name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Your full name" />

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Email Address</label>
                <div className="input-field" style={{ opacity: 0.6, cursor: 'not-allowed' }}>{user?.email}</div>
                <p style={{ fontSize: '0.72rem', color: '#52526e', marginTop: '0.25rem' }}>Email cannot be changed</p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Account Role</label>
                <div className="input-field" style={{ opacity: 0.6 }}>{user?.role || 'user'}</div>
              </div>

              <button type="submit" className="btn-brand" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save Changes</>}
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>Appearance</h2>
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem', margin: 0 }}>Choose your preferred color theme</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[['dark', 'Dark', Moon, '#1a1a27'], ['light', 'Light', Sun, '#f0eeff'], ['system', 'System', null, null]].map(([v, label, Icon]) => (
                  <button
                    key={v}
                    onClick={() => setTheme(v)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      padding: '1.25rem', borderRadius: 10, border: `2px solid ${theme === v ? '#27675d' : '#dfe7e3'}`,
                      background: theme === v ? '#edf5f2' : 'transparent',
                      cursor: 'pointer', minWidth: 100, transition: 'all 0.15s',
                    }}
                  >
                    {Icon && <Icon size={20} style={{ color: theme === v ? '#27675d' : '#65746f' }} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: theme === v ? '#27675d' : '#65746f' }}>{label}</span>
                  </button>
                ))}
              </div>
              <button className="btn-brand" style={{ alignSelf: 'flex-start' }} onClick={async () => {
                try {
                  const { data } = await authApi.updateMe({ preferences: { theme, notifications: notificationsEnabled } });
                  updateUser(data.data.user);
                  toast.success('Theme preference saved');
                } catch { toast.error('Failed to save theme'); }
              }}>
                <Save size={15} /> Save Appearance
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>Notification Preferences</h2>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: '#f5f7f5', borderRadius: 8, border: '1px solid #e5ebe7' }}>
                <span>
                  <span style={{ display: 'block', fontWeight: 500, color: '#e2e2f0', fontSize: '0.875rem' }}>In-app task notifications</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#52526e', marginTop: '0.25rem' }}>Store task-created activity in your notification history.</span>
                </span>
                <input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} aria-label="Enable in-app task notifications" />
              </label>
              <button className="btn-brand" style={{ alignSelf: 'flex-start' }} onClick={async () => {
                setSaving(true);
                try {
                  const { data } = await authApi.updateMe({ preferences: { theme, notifications: notificationsEnabled } });
                  updateUser(data.data.user);
                  toast.success('Notification preference saved');
                } catch { toast.error('Failed to save notification preference'); }
                finally { setSaving(false); }
              }} disabled={saving}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
