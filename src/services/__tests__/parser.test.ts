// Tests for conversation parser
import { describe, it, expect } from 'vitest';
import { parseConversation, validateFile } from '../../services/parser';

describe('parseConversation', () => {
  it('parses WhatsApp bracket format', () => {
    const raw = `[10/7/25, 9:02:13 AM] Alice: Hello there
[10/7/25, 9:03:00 AM] Bob: Hi Alice!`;
    const result = parseConversation(raw);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
    expect(result.messages[0].content).toBe('Hello there');
    expect(result.messages[0].timestamp).toBe('10/7/25, 9:02:13 AM');
    expect(result.messages[1].sender).toBe('Bob');
    expect(result.participants).toContain('Alice');
    expect(result.participants).toContain('Bob');
  });

  it('parses WhatsApp dash format', () => {
    const raw = `10/7/25, 9:02 AM - Alice: Hello
10/7/25, 9:03 AM - Bob: Hi!`;
    const result = parseConversation(raw);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
    expect(result.messages[1].sender).toBe('Bob');
  });

  it('parses plain Sender: message format', () => {
    const raw = `Alice: Hello
Bob: Hi there!`;
    const result = parseConversation(raw);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe('Alice');
    expect(result.messages[0].content).toBe('Hello');
  });

  it('handles multiline messages', () => {
    const raw = `[10/7/25, 9:02 AM] Alice: This is a long message
that spans multiple
lines

[10/7/25, 9:03 AM] Bob: Short reply`;
    const result = parseConversation(raw);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content).toContain('multiple');
    expect(result.messages[1].sender).toBe('Bob');
  });

  it('handles empty input gracefully', () => {
    const result = parseConversation('');
    expect(result.messages).toHaveLength(0);
    expect(result.participants).toHaveLength(0);
  });

  it('handles whitespace-only input', () => {
    const result = parseConversation('   \n\n  ');
    expect(result.messages).toHaveLength(0);
  });

  it('handles malformed lines without crashing', () => {
    const raw = `some random text without sender
another random line
[10/7/25, 9:02 AM] Alice: Valid message`;
    const result = parseConversation(raw);
    expect(result.messages.length).toBeGreaterThan(0);
    const aliceMsg = result.messages.find((m) => m.sender === 'Alice');
    expect(aliceMsg).toBeTruthy();
    expect(aliceMsg?.content).toBe('Valid message');
  });

  it('correctly collects participants', () => {
    const raw = `[10/7/25, 9:02 AM] Sarah: Hello
[10/7/25, 9:03 AM] Mike: Hi
[10/7/25, 9:04 AM] Sarah: How are you?`;
    const result = parseConversation(raw);
    expect(result.participants).toHaveLength(2);
    expect(result.participants).toContain('Sarah');
    expect(result.participants).toContain('Mike');
  });

  it('stores the raw text', () => {
    const raw = `[10/7/25, 9:02 AM] Alice: Hello`;
    const result = parseConversation(raw);
    expect(result.rawText).toBe(raw);
  });
});

describe('validateFile', () => {
  const makeFile = (name: string, size: number, type = 'text/plain') =>
    ({ name, size, type } as File);

  it('accepts .txt files', () => {
    const f = makeFile('chat.txt', 1000);
    expect(validateFile(f).ok).toBe(true);
  });

  it('accepts .csv files', () => {
    const f = makeFile('chat.csv', 1000);
    expect(validateFile(f).ok).toBe(true);
  });

  it('rejects files over 5MB', () => {
    const f = makeFile('big.txt', 6 * 1024 * 1024);
    const result = validateFile(f);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('rejects unsupported extensions', () => {
    const f = makeFile('chat.docx', 500, 'application/vnd.openxmlformats');
    const result = validateFile(f);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Unsupported');
  });
});
