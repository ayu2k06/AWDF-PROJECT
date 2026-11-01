import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle, Wand2, Save } from 'lucide-react';
import { aiApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskForm from '../components/tasks/TaskForm';

const AiAssistantPage = () => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [suggestedTask, setSuggestedTask] = useState(null);

  const handleSuggest = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      toast.warning('Enter at least 3 characters in the task title');
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await aiApi.suggest(title.trim(), context.trim());
      setResult(data.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.error || 'AI service is unavailable. Please try again later.');
    } finally { setLoading(false); }
  };

  const handleUseResult = () => {
    if (!result) return;
    const dueDate = result.suggestedDeadlineDays
      ? new Date(Date.now() + result.suggestedDeadlineDays * 86400000).toISOString().slice(0, 10)
      : '';
    setSuggestedTask({
      title,
      description: result.description,
      priority: result.priority,
      dueDate,
      tags: result.tags || [],
      status: 'todo',
      category: 'General',
    });
    setTaskFormOpen(true);
  };

  const PRIORITY_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#fb7185', urgent: '#ef4444' };
  const SOURCE_LABELS = { gemini: '✨ Powered by Gemini AI', fallback: '🔧 Keyword-based fallback (AI unavailable)' };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e2f0', margin: 0 }}>AI Task Assistant</h1>
        <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginTop: '0.25rem' }}>Generate task descriptions, priorities, and deadlines using Gemini AI</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Input Panel */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#e2e2f0', fontSize: '0.9375rem' }}>Task Suggestion</div>
              <div style={{ fontSize: '0.75rem', color: '#6b6b8a' }}>Get AI-powered recommendations</div>
            </div>
          </div>

          <form onSubmit={handleSuggest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
            <div>
              <label htmlFor="ai-title" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>
                Task Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="ai-title"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build user authentication system"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="ai-context" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>
                Additional Context <span style={{ color: '#52526e' }}>(optional)</span>
              </label>
              <textarea
                id="ai-context"
                className="input-field"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Team size, tech stack, complexity level, dependencies..."
                rows={3}
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-brand" disabled={loading || title.trim().length < 3} style={{ justifyContent: 'center', padding: '0.75rem' }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating suggestions...</>
                : <><Wand2 size={16} /> Generate AI Suggestions</>
              }
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </button>
          </form>

          {/* Disclaimer */}
          <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8 }}>
            <p style={{ fontSize: '0.75rem', color: '#52526e', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: '#6b6b8a' }}>ℹ️ Note:</strong> AI suggestions are recommendations only. The suggested deadline and priority are not objectively correct — always review before saving. If the AI service is unavailable, a deterministic keyword-based fallback is used.
            </p>
          </div>
        </div>

        {/* Result Panel */}
        <div>
          {!result && !error && !loading && (
            <div className="glass-card" style={{ padding: '2rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', minHeight: 300 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} style={{ color: '#3d3d5c' }} />
              </div>
              <p style={{ color: '#3d3d5c', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                Enter a task title and click "Generate AI Suggestions" to see results here.
              </p>
            </div>
          )}

          {error && (
            <div className="glass-card" style={{ padding: '1.5rem', borderColor: 'rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.375rem', fontSize: '0.9rem' }}>AI Service Unavailable</div>
                  <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: '0 0 0.875rem', lineHeight: 1.5 }}>{error}</p>
                  <p style={{ color: '#6b6b8a', fontSize: '0.8rem', margin: 0 }}>
                    You can still create tasks manually — the task form is fully functional without AI.
                  </p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} style={{ color: '#34d399' }} />
                  <span style={{ fontWeight: 600, color: '#e2e2f0', fontSize: '0.9375rem' }}>AI Suggestions</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#6b6b8a', background: 'rgba(107,107,138,0.15)', padding: '3px 8px', borderRadius: 5 }}>
                  {SOURCE_LABELS[result.source] || result.source}
                </span>
              </div>

              {/* Description */}
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 8, padding: '0.875rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
                <p style={{ color: '#e2e2f0', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{result.description}</p>
              </div>

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(26,26,39,0.6)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 8, padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52526e', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: PRIORITY_COLORS[result.priority] || '#8b5cf6', textTransform: 'capitalize' }}>
                    {result.priority}
                  </span>
                </div>
                <div style={{ background: 'rgba(26,26,39,0.6)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 8, padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52526e', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Deadline</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22d3ee' }}>
                    {result.suggestedDeadlineDays} day{result.suggestedDeadlineDays !== 1 ? 's' : ''} from now
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#52526e', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reasoning</div>
                <p style={{ color: '#9ca3af', fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>{result.explanation}</p>
              </div>

              {/* Tags */}
              {result.tags?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#52526e', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Tags</div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {result.tags.map((t) => (
                      <span key={t} style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)', padding: '2px 9px', borderRadius: 5, fontSize: '0.75rem' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p style={{ fontSize: '0.72rem', color: '#3d3d5c', margin: 0, fontStyle: 'italic' }}>{result.disclaimer}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <button className="btn-brand" onClick={handleUseResult} style={{ flex: 1, justifyContent: 'center' }}>
                  <Save size={15} /> Use This & Create Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '0.875rem' }}>Try these examples</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Implement user login', 'Fix critical production bug', 'Write unit tests for API', 'Design mobile UI', 'Optimize task search', 'Set up CI/CD pipeline'].map((ex) => (
            <button
              key={ex}
              onClick={() => setTitle(ex)}
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', color: '#a78bfa', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <TaskForm open={taskFormOpen} onClose={() => { setTaskFormOpen(false); setSuggestedTask(null); }} onSaved={() => toast.success('Task created with AI suggestions!')} initialTask={suggestedTask} />
    </div>
  );
};

export default AiAssistantPage;
