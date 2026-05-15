const DEFAULT_API_URL = 'https://api.openai.com/v1/responses';

const hasAiProvider = () =>
  Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);

const requestAiText = async ({ instructions, input }) => {
  if (!hasAiProvider()) {
    return null;
  }

  const response = await fetch(process.env.OPENAI_API_URL || DEFAULT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      instructions,
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.output_text || '';
};

const parseJsonOutput = (value, fallback = null) => {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  const withoutFence = trimmed
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch (_err) {
    return fallback;
  }
};

const generateAssistantReply = async ({ message, context, fallbackReply }) => {
  try {
    const output = await requestAiText({
      instructions:
        'You are StudySphere AI. Give concise, practical study guidance with one clear next step.',
      input: `Context: ${context}\nUser message: ${message}`,
    });

    return output || fallbackReply;
  } catch (_err) {
    return fallbackReply;
  }
};

const generateInterviewFeedback = async ({ role, focusAreas, answer, fallbackReply }) => {
  try {
    const output = await requestAiText({
      instructions:
        'You are a mock interview coach. Give concise feedback with strengths, one weak point, and one next improvement.',
      input: `Role: ${role}\nFocus areas: ${focusAreas.join(', ')}\nCandidate answer: ${answer}`,
    });

    return output || fallbackReply;
  } catch (_err) {
    return fallbackReply;
  }
};

const generateQuizQuestions = async ({ topic, difficulty, count, fallbackQuestions }) => {
  try {
    const output = await requestAiText({
      instructions:
        'You are StudySphere AI. Return valid JSON only. Generate a quiz as a JSON array where each item has question, options, answer, explanation. Keep options short and practical.',
      input: `Topic: ${topic}\nDifficulty: ${difficulty}\nQuestion count: ${count}`,
    });

    const parsed = parseJsonOutput(output, null);
    if (!Array.isArray(parsed) || !parsed.length) {
      return fallbackQuestions;
    }

    return parsed
      .filter((item) => item && item.question && Array.isArray(item.options) && item.answer)
      .slice(0, count)
      .map((item) => ({
        question: String(item.question),
        options: item.options.map((option) => String(option)),
        answer: String(item.answer),
        explanation: String(item.explanation || 'Review the core concept and the tradeoffs behind this answer.'),
      }));
  } catch (_err) {
    return fallbackQuestions;
  }
};

const generateInterviewOpening = async ({ role, focusAreas, fallbackPrompts }) => {
  try {
    const output = await requestAiText({
      instructions:
        'You are a technical interviewer. Return valid JSON only as an array of concise interview questions tailored to the role and focus areas.',
      input: `Role: ${role}\nFocus areas: ${focusAreas.join(', ') || 'General software engineering'}\nCount: 3`,
    });

    const parsed = parseJsonOutput(output, null);
    if (!Array.isArray(parsed) || !parsed.length) {
      return fallbackPrompts;
    }

    return parsed.slice(0, 3).map((item) => String(item));
  } catch (_err) {
    return fallbackPrompts;
  }
};

const generateRoadmapPlan = async ({ targetRole, weakTopics, goals, fallbackRoadmap }) => {
  try {
    const output = await requestAiText({
      instructions:
        'You are StudySphere AI. Return valid JSON only as an array of 3 roadmap stages. Each item must contain title, focus, and actionItems where actionItems is an array of short strings.',
      input: `Target role: ${targetRole}\nWeak topics: ${weakTopics.join(', ') || 'General problem solving'}\nGoals: ${goals.join(', ') || 'Build consistent progress'}\nStages: 3`,
    });

    const parsed = parseJsonOutput(output, null);
    if (!Array.isArray(parsed) || !parsed.length) {
      return fallbackRoadmap;
    }

    return parsed.slice(0, 3).map((item, index) => ({
      title: String(item.title || `Stage ${index + 1}`),
      focus: String(item.focus || weakTopics[index] || 'Core practice'),
      actionItems: Array.isArray(item.actionItems)
        ? item.actionItems.map((entry) => String(entry)).filter(Boolean).slice(0, 4)
        : fallbackRoadmap[index]?.actionItems || [],
    }));
  } catch (_err) {
    return fallbackRoadmap;
  }
};

module.exports = {
  hasAiProvider,
  generateAssistantReply,
  generateInterviewFeedback,
  generateQuizQuestions,
  generateInterviewOpening,
  generateRoadmapPlan,
};
