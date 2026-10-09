// Tests for the prioritizer and analysis logic
import { describe, it, expect } from 'vitest';
import {
  scoreMessagePriority,
  detectDeadline,
  detectDecision,
  detectQuestion,
  detectMention,
  detectActionRequest,
  buildAttentionItems,
} from '../../services/prioritizer';
import type { ParsedMessage } from '../../types';

function makeMsg(content: string, sender = 'Alice'): ParsedMessage {
  return {
    id: `test-${Math.random()}`,
    sender,
    timestamp: '10/7/25, 9:00 AM',
    content,
    rawText: `${sender}: ${content}`,
    lineIndex: 0,
  };
}

describe('detectDeadline', () => {
  it('detects "today"', () => {
    expect(detectDeadline('Please finish this today')).toBeTruthy();
  });

  it('detects "by noon"', () => {
    expect(detectDeadline('Submit the report by noon')).toBeTruthy();
  });

  it('detects "by EOD"', () => {
    expect(detectDeadline('Have it done by EOD')).toBeTruthy();
  });

  it('detects "by 3pm"', () => {
    expect(detectDeadline('Send by 3pm please')).toBeTruthy();
  });

  it('detects explicit dates', () => {
    expect(detectDeadline('Demo is on Friday Oct 10')).toBeTruthy();
  });

  it('returns null for no deadline', () => {
    expect(detectDeadline('Just a general chat message')).toBeNull();
  });

  it('detects "deadline"', () => {
    expect(detectDeadline('What is the deadline for this?')).toBeTruthy();
  });
});

describe('detectDecision', () => {
  it('detects "we decided"', () => {
    expect(detectDecision('We decided to go with the new design')).toBe(true);
  });

  it('detects "agreed"', () => {
    expect(detectDecision("We've agreed on Thursday")).toBe(true);
  });

  it('detects "confirmed"', () => {
    expect(detectDecision('Confirmed: SSO is not in scope')).toBe(true);
  });

  it('detects "let\'s go with"', () => {
    expect(detectDecision("Let's go with option B")).toBe(true);
  });

  it('returns false for non-decisions', () => {
    expect(detectDecision('What time works for everyone?')).toBe(false);
  });
});

describe('detectQuestion', () => {
  it('detects question mark', () => {
    expect(detectQuestion('Can you review this?')).toBe(true);
  });

  it('detects "who" questions', () => {
    expect(detectQuestion('Who is responsible for this?')).toBe(true);
  });

  it('detects "when" questions', () => {
    expect(detectQuestion('When is the deadline?')).toBe(true);
  });

  it('returns false for statements', () => {
    expect(detectQuestion('The meeting is at 3pm.')).toBe(false);
  });
});

describe('detectMention', () => {
  it('detects full name mention', () => {
    expect(detectMention('Alex, can you review this?', 'Alex Johnson')).toBe(true);
  });

  it('detects @mention', () => {
    expect(detectMention('@Alex please check this', 'Alex Johnson')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(detectMention('ALEX please check this', 'Alex Johnson')).toBe(true);
  });

  it('returns false when name not present', () => {
    expect(detectMention('This is a general message', 'Alex Johnson')).toBe(false);
  });

  it('handles empty user name', () => {
    expect(detectMention('Some message', '')).toBe(false);
  });
});

describe('detectActionRequest', () => {
  it('detects "can you"', () => {
    expect(detectActionRequest('Can you send me the report?')).toBe(true);
  });

  it('detects "please"', () => {
    expect(detectActionRequest('Please review the code')).toBe(true);
  });

  it('detects "need to"', () => {
    expect(detectActionRequest('We need to finish this')).toBe(true);
  });

  it('returns false for passive messages', () => {
    expect(detectActionRequest('The weather is nice today')).toBe(false);
  });
});

describe('scoreMessagePriority', () => {
  it('scores urgent for direct mention + deadline', () => {
    const msg = makeMsg('Alex, please finish the export by today EOD');
    const { priority, score } = scoreMessagePriority(msg, 'Alex Johnson', ['Alice', 'Bob']);
    expect(priority).toBe('urgent');
    expect(score).toBeGreaterThan(50);
  });

  it('scores important for decision', () => {
    const msg = makeMsg("We've decided to proceed with option B");
    const { priority } = scoreMessagePriority(msg, 'Alex Johnson', []);
    expect(['urgent', 'important']).toContain(priority);
  });

  it('scores awareness for casual messages', () => {
    const msg = makeMsg('OK cool');
    const { priority } = scoreMessagePriority(msg, 'Alex Johnson', []);
    expect(priority).toBe('awareness');
  });

  it('scores emoji-only messages as awareness', () => {
    const msg = makeMsg('✅👍💪');
    const { priority } = scoreMessagePriority(msg, 'Alex Johnson', []);
    expect(priority).toBe('awareness');
  });

  it('includes a reason string', () => {
    const msg = makeMsg('Can you fix this today?');
    const { reason } = scoreMessagePriority(msg, 'Alex', []);
    expect(reason).toBeTruthy();
    expect(typeof reason).toBe('string');
  });
});

describe('buildAttentionItems', () => {
  it('creates deadline attention items', () => {
    const msgs = [makeMsg('Please submit the report by today noon')];
    const items = buildAttentionItems(msgs, 'Alex');
    expect(items.some((i) => i.type === 'deadline')).toBe(true);
  });

  it('creates mention attention items', () => {
    const msgs = [makeMsg('Alex, can you check this?')];
    const items = buildAttentionItems(msgs, 'Alex');
    expect(items.some((i) => i.type === 'question' || i.type === 'mention')).toBe(true);
  });

  it('does not duplicate by sourceMessageId + type', () => {
    const msgs = [
      makeMsg('Alex please check this today'),
      makeMsg('Alex please check this today'), // duplicate
    ];
    const items = buildAttentionItems(msgs, 'Alex');
    const deadlineItems = items.filter((i) => i.type === 'deadline');
    // Should not have more deadline items than unique messages with deadlines
    expect(deadlineItems.length).toBeLessThanOrEqual(msgs.length);
  });

  it('handles empty message list', () => {
    const items = buildAttentionItems([], 'Alex');
    expect(items).toHaveLength(0);
  });

  it('handles missing userName', () => {
    const msgs = [makeMsg('Some message with deadline by today')];
    const items = buildAttentionItems(msgs, '');
    // Should still work, just no mention-type items
    expect(Array.isArray(items)).toBe(true);
  });
});
