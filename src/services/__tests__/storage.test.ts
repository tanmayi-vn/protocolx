// Tests for the storage/export functionality
import { describe, it, expect } from 'vitest';
import { exportAsMarkdown } from '../../services/storage';
import type { AnalysisResult } from '../../types';

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    summary: [{ id: 's1', text: 'Demo moved to Friday', sourceMessageIds: ['msg-1'] }],
    attentionItems: [
      {
        id: 'a1',
        text: 'Export feature due Thursday',
        priority: 'urgent',
        priorityReason: 'Deadline mentioned',
        sourceMessageId: 'msg-2',
        type: 'deadline',
      },
    ],
    decisions: [
      {
        id: 'd1',
        text: 'SSO will not be in the demo',
        madeBy: 'Sarah',
        sourceMessageId: 'msg-3',
        confidence: 'high',
      },
    ],
    actionItems: [
      {
        id: 't1',
        description: 'Review security audit findings',
        owner: 'Alex Johnson',
        dueDate: 'Wednesday',
        priority: 'important',
        completed: false,
        sourceMessageId: 'msg-4',
        priorityReason: 'Assigned to you',
        bookmarked: false,
      },
    ],
    mentions: [
      {
        id: 'm1',
        messageId: 'msg-5',
        sender: 'Sarah',
        excerpt: 'Alex can you take a look?',
        type: 'question',
        timestamp: '9:11 AM',
      },
    ],
    importantMessages: [
      {
        id: 'im1',
        messageId: 'msg-6',
        sender: 'Priya',
        timestamp: '9:04 AM',
        excerpt: "Demo date moved to Friday October 10th",
        priority: 'urgent',
        priorityReason: 'Contains urgency language',
        bookmarked: false,
        tags: ['deadline'],
      },
    ],
    analyzedAt: 1700000000000,
    userName: 'Alex Johnson',
    mode: 'fallback',
    messageCount: 50,
    participantCount: 4,
    ...overrides,
  };
}

describe('exportAsMarkdown', () => {
  it('produces a non-empty markdown string', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toBeTruthy();
    expect(typeof md).toBe('string');
  });

  it('includes the report title', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('CatchUp AI');
  });

  it('includes catch-up brief content', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('Demo moved to Friday');
  });

  it('includes decision content', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('SSO will not be in the demo');
  });

  it('includes action items', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('Review security audit findings');
  });

  it('includes mentions', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('Alex can you take a look?');
  });

  it('shows completed tasks with [x]', () => {
    const result = makeResult({
      actionItems: [
        {
          id: 't1',
          description: 'Done task',
          owner: null,
          dueDate: null,
          priority: 'important',
          completed: true,
          sourceMessageId: 'msg-1',
          priorityReason: 'Action item',
          bookmarked: false,
        },
      ],
    });
    const md = exportAsMarkdown(result);
    expect(md).toContain('[x]');
  });

  it('shows open tasks with [ ]', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('[ ]');
  });

  it('includes privacy statement', () => {
    const md = exportAsMarkdown(makeResult());
    expect(md).toContain('locally');
  });

  it('shows fallback mode label', () => {
    const md = exportAsMarkdown(makeResult({ mode: 'fallback' }));
    expect(md).toContain('Smart NLP');
  });
});
