const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const initializeAI = () => {
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ [AI] Gemini API initialized');
    } catch (err) {
      console.warn('⚠️  [AI] Failed to initialize Gemini API:', err.message);
    }
  } else {
    console.warn('⚠️  [AI] GEMINI_API_KEY not set. AI features will use fallback mode.');
  }
};

/**
 * Generate AI task suggestions from a short task title.
 * Returns structured JSON with description, priority, dueDate, and explanation.
 * Falls back gracefully if AI is unavailable.
 */
const generateTaskSuggestions = async (title, context = '') => {
  // Validate input
  if (!title || title.trim().length < 3) {
    throw new Error('Task title must be at least 3 characters for AI suggestions');
  }

  // Sanitize — limit input length
  const sanitizedTitle = title.trim().slice(0, 200);
  const sanitizedContext = context.trim().slice(0, 500);

  if (!genAI) {
    return getDeterministicFallback(sanitizedTitle);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a task management assistant. Given the following task title${sanitizedContext ? ' and context' : ''}, provide helpful suggestions.

Task Title: "${sanitizedTitle}"
${sanitizedContext ? `Additional Context: "${sanitizedContext}"` : ''}

Respond ONLY with a valid JSON object (no markdown, no code fences) with exactly these fields:
{
  "description": "A detailed, actionable task description (2-3 sentences)",
  "priority": "one of: low, medium, high, urgent",
  "suggestedDeadlineDays": <integer number of days from today>,
  "explanation": "Brief explanation of why this priority and deadline are recommended (1-2 sentences)",
  "tags": ["relevant", "tags", "array"]
}

Important: The deadline and priority are suggestions only — not verified facts. The user should review before saving.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse and validate response
    let parsed;
    try {
      // Strip any accidental markdown code fences
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[AI] Failed to parse Gemini response:', text);
      return getDeterministicFallback(sanitizedTitle);
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || typeof parsed.description !== 'string' || !parsed.description.trim()) {
      return getDeterministicFallback(sanitizedTitle);
    }

    // Validate and constrain AI output
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    return {
      description: String(parsed.description || '').slice(0, 2000),
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : 'medium',
      suggestedDeadlineDays: Math.max(1, Math.min(365, parseInt(parsed.suggestedDeadlineDays) || 7)),
      explanation: String(parsed.explanation || '').slice(0, 500),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(t => String(t).slice(0, 30)) : [],
      source: 'gemini',
      disclaimer: 'AI suggestions are recommendations only. Review before saving.',
    };
  } catch (err) {
    console.error('[AI] Gemini API error:', err.message);

    // Specific fallback messages for common errors
    if (err.message?.includes('quota') || err.message?.includes('429')) {
      throw new Error('AI service rate limit reached. Please try again later or use manual entry.');
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('401')) {
      throw new Error('AI service configuration error. Please use manual task entry.');
    }

    return getDeterministicFallback(sanitizedTitle);
  }
};

/**
 * Deterministic fallback when AI is unavailable.
 * Provides reasonable defaults based on keyword analysis.
 * NOT random — always returns the same result for the same input.
 */
const getDeterministicFallback = (title) => {
  const lower = title.toLowerCase();

  let priority = 'medium';
  let deadlineDays = 7;

  // Keyword-based priority heuristics
  if (/urgent|critical|asap|emergency|immediately|blocker/i.test(lower)) {
    priority = 'urgent';
    deadlineDays = 1;
  } else if (/important|high|priority|deadline|due|fix|bug|error/i.test(lower)) {
    priority = 'high';
    deadlineDays = 3;
  } else if (/low|minor|optional|someday|nice to have/i.test(lower)) {
    priority = 'low';
    deadlineDays = 14;
  }

  return {
    description: `Complete the task: "${title}". Break this into actionable steps, define acceptance criteria, and track progress until completion.`,
    priority,
    suggestedDeadlineDays: deadlineDays,
    explanation: `Suggested ${priority} priority based on keyword analysis of the task title. Please adjust based on your actual context.`,
    tags: [],
    source: 'fallback',
    disclaimer: 'AI service is currently unavailable. These are keyword-based suggestions. Review before saving.',
  };
};

module.exports = { initializeAI, generateTaskSuggestions, getDeterministicFallback };
