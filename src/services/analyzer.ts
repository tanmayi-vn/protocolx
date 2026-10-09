import type { ConversationData, AnalysisResult, ActionItem, Decision, Mention, ImportantMessage, SummaryPoint, Priority } from '../types';
import {
  scoreMessagePriority,
  detectDeadline,
  detectDecision,
  detectQuestion,
  detectActionRequest,
  detectMention,
  buildAttentionItems,
} from './prioritizer';

type ProgressCallback = (step: string, pct: number) => void;

function extractOwner(text: string, participants: string[]): string | null {
  // Check for @mentions
  const atMatch = text.match(/@([A-Za-z]+(?:\s+[A-Za-z]+)?)/);
  if (atMatch) return atMatch[1];

  // Check participant names
  for (const p of participants) {
    if (text.toLowerCase().includes(p.toLowerCase())) return p;
  }
  return null;
}

function extractActionItems(
  messages: ConversationData['messages'],
  participants: string[],
  userName: string
): ActionItem[] {
  const items: ActionItem[] = [];
  const seen = new Set<string>();

  messages.forEach((msg) => {
    const text = msg.content;

    // Simple heuristic: sentences with action verbs
    const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 10);
    sentences.forEach((sentence) => {
      const s = sentence.trim();
      if (!detectActionRequest(s) && !s.includes('will ') && !s.includes('need to')) return;

      // Avoid duplicates (normalize)
      const key = s.toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);

      const deadline = detectDeadline(s) || detectDeadline(text);
      const owner = extractOwner(s, participants) || extractOwner(text, participants) || msg.sender;
      const isMentioned = detectMention(s, userName) || detectMention(text, userName);

      let priority: Priority = 'important';
      let priorityReason = 'Action item identified';

      if (deadline) {
        priority = 'urgent';
        priorityReason = `Deadline: ${deadline}`;
      } else if (isMentioned) {
        priority = 'urgent';
        priorityReason = 'Assigned to you';
      }

      if (s.length > 15 && s.length < 200) {
        items.push({
          id: `task-${msg.id}-${items.length}`,
          description: s.charAt(0).toUpperCase() + s.slice(1),
          owner,
          dueDate: deadline,
          priority,
          completed: false,
          sourceMessageId: msg.id,
          priorityReason,
          bookmarked: false,
        });
      }
    });
  });

  // Limit to 20 most relevant
  return items.slice(0, 20);
}

// --- Decision extraction ---
function extractDecisions(messages: ConversationData['messages']): Decision[] {
  const decisions: Decision[] = [];
  const seen = new Set<string>();

  const DECISION_PATTERNS = [
    /\bwe('ve)?\s+(decided|agreed|confirmed|concluded)\b[^.!?]*/gi,
    /\bdecision\s*:\s*[^.!?]*/gi,
    /\blet'?s\s+go\s+with\b[^.!?]*/gi,
    /\bwill\s+(?:not\s+)?be\s+(?:in\s+)?(?:the\s+)?(?:demo|scope|included|excluded)\b[^.!?]*/gi,
    /\b(approved|confirmed|finalized|settled|resolved)\b[^.!?]*/gi,
    /\bthe\s+(?:plan|decision|call)\s+is\b[^.!?]*/gi,
    /\bwe('re)?\s+going\s+(?:to|with)\b[^.!?]*/gi,
    /\bSSO\s+will\s+(not\s+be|be)\b[^.!?]*/gi,
  ];

  messages.forEach((msg) => {
    const text = msg.content;
    if (!detectDecision(text)) return;

    DECISION_PATTERNS.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const decisionText = match[0].trim();
        const key = decisionText.toLowerCase().slice(0, 50);
        if (seen.has(key) || decisionText.length < 15) continue;
        seen.add(key);

        decisions.push({
          id: `decision-${msg.id}-${decisions.length}`,
          text: decisionText.charAt(0).toUpperCase() + decisionText.slice(1),
          madeBy: msg.sender,
          sourceMessageId: msg.id,
          confidence: decisionText.length > 30 ? 'high' : 'medium',
        });
      }
    });
  });

  return decisions.slice(0, 10);
}

// --- Mention extraction ---
function extractMentions(
  messages: ConversationData['messages'],
  userName: string
): Mention[] {
  if (!userName) return [];
  const mentions: Mention[] = [];

  messages.forEach((msg) => {
    if (msg.sender.toLowerCase() === userName.toLowerCase()) return; // skip own messages
    const text = msg.content;

    if (!detectMention(text, userName)) return;

    const type = detectQuestion(text)
      ? 'question'
      : detectActionRequest(text)
      ? 'request'
      : 'direct';

    mentions.push({
      id: `mention-${msg.id}`,
      messageId: msg.id,
      sender: msg.sender,
      excerpt: text.slice(0, 200),
      type,
      timestamp: msg.timestamp,
    });
  });

  return mentions;
}

// --- Summary generation (extractive) ---
function generateSummary(
  messages: ConversationData['messages'],
  userName: string,
  participants: string[]
): SummaryPoint[] {
  // Score each message and pick top ones
  const scored = messages.map((msg) => ({
    msg,
    score: scoreMessagePriority(msg, userName, participants).score,
  }));

  scored.sort((a, b) => b.score - a.score);

  const topMessages = scored.slice(0, 8);

  // Cluster into themes
  const points: SummaryPoint[] = [];
  const usedIds = new Set<string>();

  // 1. Key decisions
  const decisionMsgs = topMessages.filter((s) => detectDecision(s.msg.content));
  if (decisionMsgs.length > 0) {
    const texts = decisionMsgs
      .slice(0, 2)
      .map((s) => s.msg.content.slice(0, 100))
      .join('; ');
    points.push({
      id: `summary-decisions`,
      text: `Key decisions were made: ${texts}`,
      sourceMessageIds: decisionMsgs.map((s) => s.msg.id),
    });
    decisionMsgs.forEach((s) => usedIds.add(s.msg.id));
  }

  // 2. Deadlines
  const deadlineMsgs = topMessages.filter(
    (s) => detectDeadline(s.msg.content) && !usedIds.has(s.msg.id)
  );
  if (deadlineMsgs.length > 0) {
    const dates = deadlineMsgs
      .slice(0, 2)
      .map((s) => detectDeadline(s.msg.content))
      .filter(Boolean);
    points.push({
      id: `summary-deadlines`,
      text: `Deadlines are approaching: ${dates.join(', ')}`,
      sourceMessageIds: deadlineMsgs.map((s) => s.msg.id),
    });
    deadlineMsgs.forEach((s) => usedIds.add(s.msg.id));
  }

  // 3. Action items
  const actionMsgs = topMessages.filter(
    (s) => detectActionRequest(s.msg.content) && !usedIds.has(s.msg.id)
  );
  if (actionMsgs.length > 0) {
    points.push({
      id: `summary-actions`,
      text: `${actionMsgs.length} action item(s) were assigned to team members.`,
      sourceMessageIds: actionMsgs.map((s) => s.msg.id),
    });
    actionMsgs.forEach((s) => usedIds.add(s.msg.id));
  }

  // 4. Remaining top messages
  const remaining = topMessages.filter((s) => !usedIds.has(s.msg.id)).slice(0, 3);
  remaining.forEach((s, i) => {
    points.push({
      id: `summary-msg-${i}`,
      text: `${s.msg.sender}: "${s.msg.content.slice(0, 120)}"`,
      sourceMessageIds: [s.msg.id],
    });
  });

  return points.slice(0, 6);
}

// --- Important messages ---
function extractImportantMessages(
  messages: ConversationData['messages'],
  userName: string,
  participants: string[]
): ImportantMessage[] {
  const scored = messages.map((msg) => {
    const { priority, reason, score } = scoreMessagePriority(msg, userName, participants);
    return { msg, priority, reason, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score >= 15).slice(0, 12);

  return top.map((s) => {
    const tags: string[] = [];
    if (detectDeadline(s.msg.content)) tags.push('deadline');
    if (detectDecision(s.msg.content)) tags.push('decision');
    if (detectMention(s.msg.content, userName)) tags.push('mention');
    if (detectActionRequest(s.msg.content)) tags.push('action');
    if (detectQuestion(s.msg.content)) tags.push('question');

    return {
      id: `important-${s.msg.id}`,
      messageId: s.msg.id,
      sender: s.msg.sender,
      timestamp: s.msg.timestamp,
      excerpt: s.msg.content.slice(0, 250),
      priority: s.priority,
      priorityReason: s.reason,
      bookmarked: false,
      tags,
    };
  });
}

// --- Main analysis entry point ---
export async function analyzeConversation(
  data: ConversationData,
  userName: string,
  onProgress: ProgressCallback
): Promise<AnalysisResult> {
  const { messages, participants } = data;

  onProgress('Parsing conversation structure…', 10);
  await tick();

  onProgress('Detecting deadlines and decisions…', 25);
  await tick();
  const decisions = extractDecisions(messages);

  onProgress('Extracting action items…', 40);
  await tick();
  const actionItems = extractActionItems(messages, participants, userName);

  onProgress('Finding mentions and questions…', 55);
  await tick();
  const mentions = extractMentions(messages, userName);

  onProgress('Identifying important messages…', 70);
  await tick();
  const importantMessages = extractImportantMessages(messages, userName, participants);

  onProgress('Building attention list…', 82);
  await tick();
  const attentionItems = buildAttentionItems(messages, userName);

  onProgress('Generating summary…', 92);
  await tick();
  const summary = generateSummary(messages, userName, participants);

  onProgress('Analysis complete!', 100);
  await tick();

  return {
    summary,
    attentionItems,
    decisions,
    actionItems,
    mentions,
    importantMessages,
    analyzedAt: Date.now(),
    userName,
    mode: 'fallback',
    messageCount: messages.length,
    participantCount: participants.length,
  };
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80));
}
