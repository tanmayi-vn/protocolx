import type { ParsedMessage, ConversationData } from '../types';

// WhatsApp export formats:
// [10/7/25, 9:02:13 AM] Sender: message
// [7/10/2025, 09:02:13] Sender: message
// 10/7/25, 9:02 AM - Sender: message
// 2025-10-07 09:02:13 Sender: message

const WA_BRACKET_PATTERN =
  /^\[(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]\s+([^:]+):\s*(.*)/i;

const WA_DASH_PATTERN =
  /^(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\s+-\s+([^:]+):\s*(.*)/i;

const ISO_PATTERN =
  /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?)\s+([^:]+):\s*(.*)/;

const PLAIN_SENDER_PATTERN = /^([A-Z][a-zA-Z\s]{1,30}):\s+(.*)/;

function generateId(index: number, content: string): string {
  return `msg-${index}-${content.slice(0, 8).replace(/\s/g, '')}`;
}

function tryParseMessage(
  line: string
): Omit<ParsedMessage, 'id' | 'lineIndex'> | null {
  let m: RegExpMatchArray | null;

  m = line.match(WA_BRACKET_PATTERN);
  if (m) return { timestamp: m[1].trim(), sender: m[2].trim(), content: m[3].trim(), rawText: line };

  m = line.match(WA_DASH_PATTERN);
  if (m) return { timestamp: m[1].trim(), sender: m[2].trim(), content: m[3].trim(), rawText: line };

  m = line.match(ISO_PATTERN);
  if (m) return { timestamp: m[1].trim(), sender: m[2].trim(), content: m[3].trim(), rawText: line };

  m = line.match(PLAIN_SENDER_PATTERN);
  if (m) return { timestamp: null, sender: m[1].trim(), content: m[2].trim(), rawText: line };

  return null;
}

export function parseConversation(
  raw: string,
  fileName?: string
): ConversationData {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  const messages: ParsedMessage[] = [];
  const participantSet = new Set<string>();
  let msgIndex = 0;

  let currentMsg: ParsedMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }
      continue;
    }

    const parsed = tryParseMessage(line);
    if (parsed) {
      if (currentMsg) messages.push(currentMsg);
      const id = generateId(msgIndex++, parsed.content);
      currentMsg = { id, lineIndex: i, ...parsed };
      if (parsed.sender) participantSet.add(parsed.sender);
    } else if (currentMsg) {
      // Continuation line (multiline message)
      currentMsg.content += '\n' + line.trim();
      currentMsg.rawText += '\n' + line;
    } else {
      // Unattributed line — treat as a standalone message with unknown sender
      const id = generateId(msgIndex++, line);
      messages.push({
        id,
        sender: 'Unknown',
        timestamp: null,
        content: line.trim(),
        rawText: line,
        lineIndex: i,
      });
    }
  }

  if (currentMsg) messages.push(currentMsg);

  // Rebuild participants from final messages (handles continuation lines)
  messages.forEach((m) => {
    if (m.sender && m.sender !== 'Unknown') participantSet.add(m.sender);
  });

  return {
    messages,
    participants: Array.from(participantSet),
    rawText: raw,
    fileName,
    parsedAt: Date.now(),
  };
}

export function validateFile(file: File): { ok: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['text/plain', 'text/csv', ''];
  const ALLOWED_EXTS = ['.txt', '.csv', '.log'];

  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`,
    };
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: `Unsupported file type. Please upload a .txt, .csv, or .log file.`,
    };
  }

  return { ok: true };
}
