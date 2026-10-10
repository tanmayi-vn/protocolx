// Core domain types for CatchUp AI

export type Priority = 'urgent' | 'important' | 'awareness';

export interface ParsedMessage {
  id: string;
  sender: string;
  timestamp: string | null;
  content: string;
  rawText: string;
  lineIndex: number;
}

export interface ConversationData {
  messages: ParsedMessage[];
  participants: string[];
  rawText: string;
  fileName?: string;
  parsedAt: number;
}

export interface SummaryPoint {
  id: string;
  text: string;
  sourceMessageIds: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  sourceMessageId: string;
  priorityReason: string;
  bookmarked: boolean;
}

export interface Decision {
  id: string;
  text: string;
  madeBy: string | null;
  sourceMessageId: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Mention {
  id: string;
  messageId: string;
  sender: string;
  excerpt: string;
  type: 'direct' | 'question' | 'request';
  timestamp: string | null;
}

export interface ImportantMessage {
  id: string;
  messageId: string;
  sender: string;
  timestamp: string | null;
  excerpt: string;
  priority: Priority;
  priorityReason: string;
  bookmarked: boolean;
  tags: string[];
}

export interface AttentionItem {
  id: string;
  text: string;
  priority: Priority;
  priorityReason: string;
  sourceMessageId: string;
  type: 'deadline' | 'question' | 'urgent-request' | 'mention';
}

export interface AnalysisResult {
  summary: SummaryPoint[];
  attentionItems: AttentionItem[];
  decisions: Decision[];
  actionItems: ActionItem[];
  mentions: Mention[];
  importantMessages: ImportantMessage[];
  analyzedAt: number;
  userName: string;
  mode: 'ai' | 'fallback';
  messageCount: number;
  participantCount: number;
}

export type AppView = 'input' | 'analyzing' | 'dashboard' | 'scene';

export type FilterTab =
  | 'all'
  | 'urgent'
  | 'mentions'
  | 'decisions'
  | 'tasks'
  | 'important';

export interface AppState {
  view: AppView;
  conversation: ConversationData | null;
  analysis: AnalysisResult | null;
  userName: string;
  activeFilter: FilterTab;
  searchQuery: string;
}
