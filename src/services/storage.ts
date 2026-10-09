// Storage service: IndexedDB for local persistence, no external data transfer
import type { AnalysisResult, ConversationData } from '../types';

const DB_NAME = 'catchup-ai-db';
const DB_VERSION = 1;
const STORE_ANALYSIS = 'analysis';
const STORE_CONVERSATION = 'conversation';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ANALYSIS)) {
        db.createObjectStore(STORE_ANALYSIS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONVERSATION)) {
        db.createObjectStore(STORE_CONVERSATION, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(storeName: string, data: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function get<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  await put(STORE_ANALYSIS, { id: 'latest', ...result });
}

export async function loadAnalysis(): Promise<AnalysisResult | null> {
  return get<AnalysisResult>(STORE_ANALYSIS, 'latest');
}

export async function saveConversation(data: ConversationData): Promise<void> {
  // Store minimal metadata only — not the full conversation text
  await put(STORE_CONVERSATION, {
    id: 'latest',
    participants: data.participants,
    fileName: data.fileName,
    parsedAt: data.parsedAt,
    messageCount: data.messages.length,
    // rawText deliberately NOT stored for privacy
  });
}

export async function clearAllData(): Promise<void> {
  await clearStore(STORE_ANALYSIS);
  await clearStore(STORE_CONVERSATION);
}

// Export catch-up report as Markdown
export function exportAsMarkdown(result: AnalysisResult): string {
  const date = new Date(result.analyzedAt).toLocaleString();
  const lines: string[] = [
    `# CatchUp AI — Catch-Up Report`,
    `*Generated: ${date} | Messages analyzed: ${result.messageCount} | Participants: ${result.participantCount}*`,
    `*Analysis mode: ${result.mode === 'ai' ? 'AI-powered' : 'Smart NLP (local)'}*`,
    ``,
    `---`,
    ``,
    `## 📋 Catch-Up Brief`,
    ...result.summary.map((p) => `- ${p.text}`),
    ``,
    `---`,
    ``,
    `## 🚨 Needs Your Attention`,
    ...result.attentionItems.map(
      (a) => `- **[${a.priority.toUpperCase()}]** ${a.text}\n  > *${a.priorityReason}*`
    ),
    ``,
    `---`,
    ``,
    `## ✅ Decisions Made`,
    ...result.decisions.map(
      (d) =>
        `- ${d.text}${d.madeBy ? ` *(by ${d.madeBy})*` : ''}${
          d.confidence === 'low' ? ' ⚠️ *uncertain*' : ''
        }`
    ),
    ``,
    `---`,
    ``,
    `## 📌 Action Items`,
    ...result.actionItems.map(
      (a) =>
        `- [${a.completed ? 'x' : ' '}] **${a.description}**${
          a.owner ? ` — Owner: ${a.owner}` : ''
        }${a.dueDate ? ` — Due: ${a.dueDate}` : ''} *(${a.priority})*`
    ),
    ``,
    `---`,
    ``,
    `## 💬 Mentions & Questions`,
    ...result.mentions.map(
      (m) => `- **${m.sender}** [${m.type}]: "${m.excerpt}"`
    ),
    ``,
    `---`,
    ``,
    `## 📣 Important Messages`,
    ...result.importantMessages.map(
      (m) =>
        `- **${m.sender}**${m.timestamp ? ` (${m.timestamp})` : ''}: "${m.excerpt}"\n  > *${m.priorityReason}*`
    ),
    ``,
    `---`,
    `*This report was generated locally. No conversation data was sent to any server.*`,
  ];

  return lines.join('\n');
}
