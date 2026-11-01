import { useState, useEffect } from 'react';
import { Activity, Cpu, Clock, RefreshCw, Server, HardDrive, Zap } from 'lucide-react';
import { systemApi } from '../services/api';
import { LoadingSpinner, ErrorMessage } from '../components/ui/index';

const MetricCard = ({ icon: Icon, title, value, sub, color = '#8b5cf6' }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
      <Icon size={16} style={{ color }} />
      <span style={{ fontSize: '0.75rem', color: '#6b6b8a', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e2f0', lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#52526e', marginTop: '0.25rem' }}>{sub}</div>}
  </div>
);

const PerformancePage = () => {
  const [health, setHealth] = useState(null);
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [healthRes, perfRes] = await Promise.all([
        systemApi.health(),
        systemApi.performance(),
      ]);
      setHealth(healthRes.data.data);
      setPerf(perfRes.data.data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load performance data. Backend may not be running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return `${h}h ${m}m ${sec}s`;
  };

  const formatBytes = (b) => {
    if (!b) return 'N/A';
    return Math.round(b / 1024 / 1024) + ' MB';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>Performance & System Health</h1>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time cache statistics, API metrics, and backend health
            {lastFetched && <span> · Updated {lastFetched.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button className="btn-outline" onClick={fetchData} disabled={loading} style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {loading && <LoadingSpinner message="Fetching system metrics..." />}
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {health && perf && !loading && (
        <>
          {/* Health Status */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: health.status === 'ok' ? '#34d399' : '#ef4444', boxShadow: `0 0 6px ${health.status === 'ok' ? '#34d399' : '#ef4444'}` }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0' }}>System Status</span>
              <span style={{ fontSize: '0.8rem', color: health.status === 'ok' ? '#34d399' : '#ef4444', fontWeight: 500 }}>
                {health.status?.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={14} style={{ color: '#34d399' }} />
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>App data: <strong style={{ color: '#fbbf24' }}>cleared on restart</strong></span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>Node {health.node} · {health.environment}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>Uptime: {formatUptime(health.uptime)}</div>
          </div>

          {/* Cache Stats */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '0.875rem' }}>Cache Statistics (node-cache)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <MetricCard icon={Zap} title="Cache Hits" value={perf.cache?.hits ?? 0} color="#34d399" />
            <MetricCard icon={Activity} title="Cache Misses" value={perf.cache?.misses ?? 0} color="#fbbf24" />
            <MetricCard icon={Clock} title="Hit Rate" value={perf.cache?.hitRate ?? '0%'} color="#a78bfa" />
            <MetricCard icon={HardDrive} title="Cached Keys" value={perf.cache?.keys ?? 0} color="#22d3ee" />
            <MetricCard icon={RefreshCw} title="Invalidations" value={perf.cache?.invalidations ?? 0} color="#fb7185" />
          </div>

          {/* Cache Note */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(251,191,36,0.15)' }}>
            <p style={{ fontSize: '0.8rem', color: '#6b6b8a', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#fbbf24' }}>⚠️ Cache Note:</strong> {perf.cache?.note}
            </p>
          </div>

          {/* Server Memory */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '0.875rem' }}>Server Memory</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <MetricCard icon={Cpu} title="Heap Used" value={formatBytes(perf.server?.memoryUsage?.heapUsed)} color="#8b5cf6" />
            <MetricCard icon={Server} title="Heap Total" value={formatBytes(perf.server?.memoryUsage?.heapTotal)} color="#6b6b8a" />
            <MetricCard icon={Server} title="RSS" value={formatBytes(perf.server?.memoryUsage?.rss)} color="#52526e" />
          </div>

          {/* Benchmarking Instructions */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '0.875rem' }}>📏 Benchmarking Instructions</h3>
            <p style={{ fontSize: '0.8125rem', color: '#6b6b8a', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              To benchmark cache vs. non-cache response times:
            </p>
            <ol style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 2, marginLeft: '1.25rem' }}>
              <li>Make a <strong style={{ color: '#a78bfa' }}>GET /api/tasks</strong> request — this is a cache miss (filters in-memory tasks)</li>
              <li>Make the same request again — this is a cache hit (memory)</li>
              <li>Compare <code style={{ background: 'rgba(139,92,246,0.1)', padding: '0 4px', borderRadius: 3, color: '#a78bfa' }}>responseTimeMs</code> field in the response</li>
              <li>Create/update a task — cache is invalidated automatically</li>
              <li>Query again — it's a miss again and filters the current task collection</li>
            </ol>
            <p style={{ fontSize: '0.75rem', color: '#52526e', marginTop: '0.75rem' }}>
              Response times vary with task count, network, and hardware.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformancePage;
