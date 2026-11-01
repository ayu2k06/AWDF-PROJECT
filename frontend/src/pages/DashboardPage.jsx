import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, TrendingUp, AlertTriangle, Plus, ArrowRight, Target, Zap } from 'lucide-react';
import { tasksApi } from '../services/api';
import { SkeletonLoader, ErrorMessage, ProgressBar } from '../components/ui/index';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TaskForm from '../components/tasks/TaskForm';

const StatCard = ({ icon: Icon, value, label, sub, color, trend }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: '0.7rem', color: trend >= 0 ? '#34d399' : '#ef4444', background: trend >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e2f0', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
    <div style={{ fontSize: '0.8125rem', color: '#9ca3af', fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#52526e', marginTop: '0.25rem' }}>{sub}</div>}
  </div>
);

const PRIORITY_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#fb7185', urgent: '#ef4444' };

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await tasksApi.getStats();
      setStats(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Fill weekly chart gaps
  const weeklyChartData = (() => {
    if (!stats?.weeklyData) return [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = stats.weeklyData.find((w) => w._id === key);
      days.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), created: found?.created || 0, completed: found?.completed || 0 });
    }
    return days;
  })();

  const priorityPieData = stats?.priorityDistribution
    ? Object.entries(stats.priorityDistribution).map(([k, v]) => ({ name: k, value: v, color: PRIORITY_COLORS[k] || '#8b5cf6' }))
    : [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0, letterSpacing: '-0.01em' }}>Dashboard</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>Your productivity overview at a glance</p>
        </div>
        <button id="dashboard-new-task" className="btn-brand" onClick={() => setTaskFormOpen(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {loading && <SkeletonLoader count={4} height={100} />}
      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {stats && !loading && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard icon={CheckSquare} value={stats.total} label="Total Tasks" color="#8b5cf6" />
            <StatCard icon={Clock} value={stats.todo} label="To Do" color="#22d3ee" />
            <StatCard icon={Zap} value={stats.inProgress} label="In Progress" color="#fbbf24" />
            <StatCard icon={Target} value={stats.completed} label="Completed" color="#34d399" />
            <StatCard icon={AlertTriangle} value={stats.overdue} label="Overdue" color="#ef4444" />
            <StatCard icon={TrendingUp} value={`${stats.completionRate}%`} label="Completion Rate" color="#a78bfa" />
          </div>

          {/* Completion Progress */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0' }}>Overall Progress</span>
              <span style={{ fontSize: '0.875rem', color: '#a78bfa', fontWeight: 700 }}>{stats.completionRate}%</span>
            </div>
            <ProgressBar value={stats.completionRate} max={100} color="#8b5cf6" height={8} />
          </div>

          {/* Charts Row */}
          <div className="dashboard-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px, 340px)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Weekly Chart */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '1rem' }}>Weekly Productivity</h3>
              {weeklyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={weeklyChartData}>
                    <defs>
                      <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: '#52526e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52526e', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, color: '#e2e2f0', fontSize: '0.8rem' }} />
                    <Area type="monotone" dataKey="created" name="Created" stroke="#8b5cf6" fill="url(#gradCreated)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="#34d399" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d3d5c', fontSize: '0.875rem' }}>
                  Create tasks to see your weekly chart
                </div>
              )}
            </div>

            {/* Priority Distribution */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '1rem' }}>Priority Distribution</h3>
              {priorityPieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={priorityPieData} innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                        {priorityPieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, fontSize: '0.8rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {priorityPieData.map((d) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ textTransform: 'capitalize' }}>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d3d5c', fontSize: '0.875rem' }}>No tasks yet</div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Due Soon */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0', margin: 0 }}>Due Soon</h3>
                <Link to="/tasks" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {stats.dueSoon?.length === 0 ? (
                <p style={{ color: '#52526e', fontSize: '0.875rem' }}>No tasks due in the next 3 days 🎉</p>
              ) : (
                stats.dueSoon?.map((t) => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#e2e2f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Recent Activity */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0', margin: '0 0 0.875rem' }}>Recent Activity</h3>
              {stats.recentActivity?.length === 0 ? (
                <p style={{ color: '#52526e', fontSize: '0.875rem' }}>No recent activity. Create your first task!</p>
              ) : (
                stats.recentActivity?.slice(0, 6).map((t) => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#e2e2f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span className={`status-${t.status}`} style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 500, flexShrink: 0, marginLeft: '0.5rem' }}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} onSaved={fetchStats} />
    </div>
  );
};

export default DashboardPage;
