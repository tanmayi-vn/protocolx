import type { ParsedMessage, Priority, AttentionItem } from '../types';

const URGENCY_KEYWORDS = [
  'urgent', 'asap', 'immediately', 'emergency', 'critical', 'important',
  'right now', 'as soon as possible', 'right away', 'now', 'today',
  'blocking', 'blocker', 'must', 'required', 'deadline',
];

const DEADLINE_PATTERNS = [
  /\b(today|tonight|this afternoon|this morning|this evening)\b/i,
  /\bby\s+(noon|midnight|eod|end of day|end of business|eob)\b/i,
  /\bby\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i,
  /\bdue\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i,
  /\bdeadline\b/i,
  /\bby\s+(?:end\s+of\s+)?(?:this\s+)?week\b/i,
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}\b/i,
  /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/,
];

const DECISION_PATTERNS = [
  /\bwe('ve)?\s+(decided|agreed|confirmed|concluded)\b/i,
  /\bdecision\s*:\s*/i,
  /\b(will|won't|going to)\s+\w+\s+(instead|moving forward|from now)\b/i,
  /\blet'?s\s+(go\s+with|use|adopt|do)\b/i,
  /\b(approved|confirmed|finalized|settled|resolved)\b/i,
  /\bthe\s+plan\s+is\b/i,
];

const QUESTION_PATTERNS = [
  /\?$/m,
  /^(who|what|when|where|why|how|can|could|would|should|is|are|will|does|did)\b/i,
];

const ACTION_PATTERNS = [
  /\bcan\s+you\b/i,
  /\bplease\b/i,
  /\bneed\s+(?:you\s+)?to\b/i,
  /\bwould\s+you\b/i,
  /\bshould\s+(?:you|we)\b/i,
  /\bmake\s+sure\b/i,
  /\bdon'?t\s+forget\b/i,
  /\bremember\s+to\b/i,
  /\byour\s+(?:task|job|responsibility|action\s+item)\b/i,
  /\bassigned\s+to\b/i,
];

export function scoreMessagePriority(
  msg: ParsedMessage,
  userName: string,
  _participants?: string[]
): { priority: Priority; reason: string; score: number } {
  const text = msg.content.toLowerCase();
  const originalText = msg.content;
  let score = 0;
  const reasons: string[] = [];

  // Personal mention — highest signal
  if (userName) {
    const userLower = userName.toLowerCase();
    const nameParts = userLower.split(/\s+/);
    const mentionRegex = new RegExp(
      `@?${nameParts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}`,
      'i'
    );
    if (mentionRegex.test(originalText)) {
      score += 50;
      reasons.push('Directly mentions you');
    }
  }

  // Urgency keywords
  const urgencyFound = URGENCY_KEYWORDS.filter((kw) => text.includes(kw));
  if (urgencyFound.length > 0) {
    score += Math.min(urgencyFound.length * 10, 30);
    reasons.push('Contains urgency language');
  }

  // Deadline patterns
  const hasDeadline = DEADLINE_PATTERNS.some((p) => p.test(originalText));
  if (hasDeadline) {
    score += 25;
    reasons.push('Deadline mentioned');
  }

  // Questions
  const isQuestion = QUESTION_PATTERNS.some((p) => p.test(originalText));
  if (isQuestion) {
    score += 10;
    reasons.push('Contains a question');
  }

  // Action requests
  const isAction = ACTION_PATTERNS.some((p) => p.test(originalText));
  if (isAction) {
    score += 15;
    reasons.push('Action requested');
  }

  // Decision
  const isDecision = DECISION_PATTERNS.some((p) => p.test(originalText));
  if (isDecision) {
    score += 20;
    reasons.push('Decision made');
  }

  // Short messages with only emoji or affirmations are low priority
  const strippedLen = originalText.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}✅👍💪🚀]/gu, '').trim().length;
  if (strippedLen < 5) {
    score = Math.max(0, score - 20);
  }

  let priority: Priority;
  if (score >= 50) priority = 'urgent';
  else if (score >= 20) priority = 'important';
  else priority = 'awareness';

  const reason = reasons.length > 0 ? reasons.slice(0, 2).join('; ') : 'General information';

  return { priority, reason, score };
}

export function detectDeadline(text: string): string | null {
  for (const pattern of DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

export function detectDecision(text: string): boolean {
  return DECISION_PATTERNS.some((p) => p.test(text));
}

export function detectQuestion(text: string): boolean {
  return QUESTION_PATTERNS.some((p) => p.test(text));
}

export function detectActionRequest(text: string): boolean {
  return ACTION_PATTERNS.some((p) => p.test(text));
}

export function detectMention(
  text: string,
  userName: string
): boolean {
  if (!userName) return false;
  const nameParts = userName.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  return nameParts.some((part) => part.length > 2 && textLower.includes(part));
}

export function buildAttentionItems(
  messages: ParsedMessage[],
  userName: string
): AttentionItem[] {
  const items: AttentionItem[] = [];

  messages.forEach((msg) => {
    const text = msg.content;
    const deadline = detectDeadline(text);
    const isMention = detectMention(text, userName);
    const isQuestion = detectQuestion(text);
    const isUrgent = URGENCY_KEYWORDS.some((kw) =>
      text.toLowerCase().includes(kw)
    );

    if (deadline) {
      items.push({
        id: `att-deadline-${msg.id}`,
        text: `Deadline: "${text.slice(0, 120)}"`,
        priority: 'urgent',
        priorityReason: `Deadline mentioned: ${deadline}`,
        sourceMessageId: msg.id,
        type: 'deadline',
      });
    }

    if (isMention && isQuestion) {
      items.push({
        id: `att-q-${msg.id}`,
        text: `${msg.sender} asked you: "${text.slice(0, 120)}"`,
        priority: 'urgent',
        priorityReason: 'Question directed at you',
        sourceMessageId: msg.id,
        type: 'question',
      });
    } else if (isMention) {
      items.push({
        id: `att-mention-${msg.id}`,
        text: `${msg.sender} mentioned you: "${text.slice(0, 120)}"`,
        priority: 'important',
        priorityReason: 'Directly mentions you',
        sourceMessageId: msg.id,
        type: 'mention',
      });
    }

    if (isUrgent && !deadline) {
      items.push({
        id: `att-urgent-${msg.id}`,
        text: `Urgent item from ${msg.sender}: "${text.slice(0, 120)}"`,
        priority: 'urgent',
        priorityReason: 'Marked as urgent',
        sourceMessageId: msg.id,
        type: 'urgent-request',
      });
    }
  });

  // Deduplicate by sourceMessageId + type
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.sourceMessageId}-${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
