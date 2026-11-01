import { useState, useEffect, useRef, useCallback } from 'react';
import { GitBranch, Star, Code, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { SkeletonCard, ErrorMessage, EmptyState } from '../components/ui/index';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584',
  HTML: '#e34c26', CSS: '#563d7c', Ruby: '#701516', PHP: '#4f5d95',
  Swift: '#f05138', Kotlin: '#a97bff', Dart: '#00b4ab', Shell: '#89e051',
};

const GitHubExplorerPage = () => {
  const [username, setUsername] = useState('ayu2k06');
  const [inputVal, setInputVal] = useState('ayu2k06');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const requestRef = useRef(null);

  const fetchRepos = useCallback(async (user) => {
    if (!user.trim()) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    setLoading(true); setError(null); setSearched(true);
    try {
      const res = await fetch(`https://api.github.com/users/${user.trim()}/repos?sort=updated&per_page=24&type=public`, {
        signal: controller.signal,
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (res.status === 404) throw new Error(`GitHub user "${user.trim()}" not found`);
      if (res.status === 403) throw new Error('GitHub API rate limit reached. Wait a few minutes and try again.');
      if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Unexpected API response format');
      setRepos(data);
    } catch (err) {
      if (controller.signal.aborted && requestRef.current !== controller) return;
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to fetch repositories');
      }
      setRepos([]);
    } finally {
      clearTimeout(timeoutId);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRepos('ayu2k06');
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [fetchRepos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setUsername(inputVal);
    fetchRepos(inputVal);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>GitHub Explorer</h1>
        <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>Fetch and display public repositories from the GitHub REST API</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
          <GitBranch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
          <input
            id="github-username"
            className="input-field"
            style={{ paddingLeft: 36 }}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="GitHub username..."
          />
        </div>
        <button type="submit" className="btn-brand" disabled={loading}>
          <Search size={16} /> {loading ? 'Loading...' : 'Search'}
        </button>
        {error && (
          <button type="button" className="btn-outline" onClick={() => fetchRepos(username)}>
            <RefreshCw size={15} /> Retry
          </button>
        )}
      </form>

      {/* User header */}
      {searched && !loading && !error && repos.length > 0 && (
        <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <img src={`https://avatars.githubusercontent.com/${username}`} alt={username} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.3)' }} onError={(e) => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontWeight: 600, color: '#e2e2f0' }}>{username}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>{repos.length} public repositories loaded</div>
          </div>
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
            Open on GitHub <ExternalLink size={12} />
          </a>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => fetchRepos(username)} />}

      {!loading && !error && searched && repos.length === 0 && (
        <EmptyState icon={GitBranch} title="No public repositories" message={`${username} doesn't have any public repositories yet.`} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {repos.map((repo) => (
          <div key={repo.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <Code size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a78bfa', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {repo.name}
                </a>
              </div>
              <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ color: '#52526e', flexShrink: 0 }}>
                <ExternalLink size={13} />
              </a>
            </div>

            {repo.description && (
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {repo.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {repo.language && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[repo.language] || '#8b5cf6', display: 'inline-block' }} />
                  {repo.language}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <Star size={12} />
                {repo.stargazers_count}
              </span>
              {repo.fork && <span style={{ fontSize: '0.65rem', color: '#52526e', background: 'rgba(82,82,110,0.2)', padding: '2px 6px', borderRadius: 4 }}>Fork</span>}
              {repo.topics?.slice(0, 2).map((t) => (
                <span key={t} style={{ fontSize: '0.65rem', color: '#22d3ee', background: 'rgba(34,211,238,0.1)', padding: '2px 6px', borderRadius: 4 }}>{t}</span>
              ))}
            </div>

            <div style={{ fontSize: '0.7rem', color: '#3d3d5c' }}>
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubExplorerPage;
