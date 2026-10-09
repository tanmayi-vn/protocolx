// InputPage: conversation input with paste, upload, multi-presets, and live preview
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Upload,
  Clipboard,
  Zap,
  Lock,
  ChevronRight,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../utils/sampleData';
import type { SampleChatPreset } from '../utils/sampleData';
import { parseConversation, validateFile } from '../services/parser';
import type { ConversationData } from '../types';

type InputMode = 'paste' | 'upload';

interface InputPageProps {
  onAnalyze: (data: ConversationData, userName: string) => void;
}

export default function InputPage({ onAnalyze }: InputPageProps) {
  const [mode, setMode] = useState<InputMode>('paste');
  const [text, setText] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = text.length;
  const MAX_CHARS = 200_000;

  // Real-time quick preview of pasted conversation
  const previewStats = useMemo(() => {
    if (!text.trim()) return null;
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    // Rough estimate of messages: lines with timestamps or colons
    const msgLines = lines.filter((l) => /[:\-\]]/.test(l));
    const count = Math.max(msgLines.length, Math.round(lines.length * 0.7));
    // Estimate read time: avg 200 wpm
    const words = text.trim().split(/\s+/).length;
    const readMinutes = Math.max(1, Math.round(words / 180));
    return {
      lines: lines.length,
      estimatedMessages: count,
      words,
      readMinutes,
    };
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) {
      setError(`Conversation is too long (${val.length.toLocaleString()} chars). Max: ${MAX_CHARS.toLocaleString()}.`);
      return;
    }
    setError('');
    setText(val);
    setActivePresetId(null);
  };

  const handleLoadPreset = (preset: SampleChatPreset) => {
    setText(preset.rawText);
    setMode('paste');
    setUserName(preset.suggestedUser);
    setActivePresetId(preset.id);
    setError('');
  };

  const handleClipboardPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        setMode('paste');
        setActivePresetId(null);
        setError('');
      }
    } catch {
      setError('Clipboard permission denied or unavailable. Please paste directly into the box.');
    }
  };

  const processFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.ok) {
      setError(validation.error!);
      return;
    }
    setError('');
    const raw = await file.text();
    if (raw.length > MAX_CHARS) {
      setError(`File is too large (${Math.round(raw.length / 1000)}k chars). Max 200k characters.`);
      return;
    }
    setText(raw);
    setMode('paste');
    setActivePresetId(null);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) await processFile(file);
    },
    [processFile]
  );

  const handleAnalyze = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste a conversation, select a demo preset, or upload an export file.');
      return;
    }
    if (trimmed.split('\n').filter((l) => l.trim()).length < 2) {
      setError('The conversation appears too short to analyze. Please provide a longer chat log.');
      return;
    }
    setError('');
    const data = parseConversation(trimmed);
    onAnalyze(data, userName.trim());
  };

  return (
    <div className="input-page">
      {/* Background glow effects */}
      <div className="ambient-glow glow-top" aria-hidden="true" />
      <div className="ambient-glow glow-bottom" aria-hidden="true" />

      <div className="input-container">
        {/* Hero Section */}
        <div className="input-hero">
          <div className="input-hero-badge">
            <Sparkles size={13} className="hero-badge-icon" />
            <span>AI Executive Briefing Engine</span>
            <span className="hero-badge-separator">•</span>
            <span className="hero-badge-highlight">100% In-Browser Privacy</span>
          </div>

          <h1 className="hero-title">
            Less scrolling. <span className="title-gradient">More knowing.</span>
          </h1>

          <p className="hero-subtitle">
            Paste any chaotic group chat, WhatsApp export, or Slack thread. Instantly extract executive summaries,
            missed deadlines, key decisions, and your personal action items.
          </p>

          <div className="hero-trust-row">
            <div className="hero-trust-item">
              <ShieldCheck size={14} className="trust-icon" />
              <span>Zero-server leakage</span>
            </div>
            <div className="hero-trust-item">
              <Zap size={14} className="trust-icon" />
              <span>Sub-second analysis</span>
            </div>
            <div className="hero-trust-item">
              <Flame size={14} className="trust-icon" />
              <span>Multi-format parser</span>
            </div>
          </div>
        </div>

        {/* Presets Row */}
        <div className="presets-section">
          <div className="presets-label">
            <Sparkles size={13} />
            <span>Try an interactive scenario:</span>
          </div>
          <div className="presets-grid">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleLoadPreset(preset)}
                  id={`preset-${preset.id}`}
                >
                  <div className="preset-card-top">
                    <span className="preset-tag">{preset.tag}</span>
                    {isSelected && <span className="preset-selected-dot">Active</span>}
                  </div>
                  <h4 className="preset-title">{preset.title}</h4>
                  <p className="preset-desc">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="input-card">
          {/* Identity row */}
          <div className="input-user-row">
            <div className="input-field">
              <div className="input-label-row">
                <label className="input-label" htmlFor="user-name">
                  Your Name or Handle
                </label>
                <span className="input-helper-text">Used to surface questions, tasks, and mentions directed at you</span>
              </div>
              <div className="input-with-icon">
                <Users size={16} className="input-icon-left" />
                <input
                  id="user-name"
                  type="text"
                  className="input-text"
                  placeholder="e.g. Alex Johnson or @Alex"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoComplete="name"
                  maxLength={60}
                />
              </div>
            </div>
          </div>

          {/* Mode switch tabs */}
          <div className="input-source-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'paste'}
              className={`source-tab ${mode === 'paste' ? 'active' : ''}`}
              onClick={() => setMode('paste')}
              id="tab-paste"
            >
              <Clipboard size={14} />
              Paste Raw Chat
            </button>
            <button
              role="tab"
              aria-selected={mode === 'upload'}
              className={`source-tab ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
              id="tab-upload"
            >
              <Upload size={14} />
              Upload Export (.txt / .csv / .log)
            </button>

            {mode === 'paste' && (
              <button
                type="button"
                className="btn-paste-clipboard"
                onClick={handleClipboardPaste}
                title="Paste from your system clipboard"
              >
                <Clipboard size={12} />
                Paste Clipboard
              </button>
            )}
          </div>

          {/* Input Area */}
          {mode === 'paste' ? (
            <div className="textarea-wrapper">
              <textarea
                aria-label="Paste your conversation here"
                className="conversation-textarea"
                placeholder={`Paste your chat export here...\n\nExamples of supported formats:\n[10/7/25, 9:02 AM] Sarah Chen: Quick sync before demo\n[10/7/25, 9:04 AM] Priya: Client moved date to Friday!\nMike Torres: I will handle the export feature by Thursday.\nSarah Chen: @Alex please finish the dashboard charts today 3pm.`}
                value={text}
                onChange={handleTextChange}
                spellCheck={false}
              />

              {/* Live Preview Stats Pill */}
              {previewStats && (
                <div className="preview-stats-bar">
                  <div className="preview-stat-item">
                    <MessageSquare size={12} />
                    <span>~{previewStats.estimatedMessages} messages detected</span>
                  </div>
                  <div className="preview-stat-item">
                    <Clock size={12} />
                    <span>~{previewStats.readMinutes} min read saved</span>
                  </div>
                  <div className="preview-stat-item ml-auto">
                    <span>{charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload chat export file"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div className="upload-zone-icon">
                <Upload size={28} />
              </div>
              <h3>Drop your exported chat file here</h3>
              <p>Supports WhatsApp exports, Slack channel dumps, Discord logs, plain text (.txt, .csv, .log)</p>
              <span className="upload-zone-hint">Click anywhere or drag & drop (Max 5 MB)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.log,text/plain"
                onChange={handleFileChange}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="input-footer">
            <div className="input-meta">
              <Lock size={13} className="privacy-lock-icon" />
              <span>Processed 100% locally with client-side NLP. Zero network requests.</span>
            </div>

            <button
              className="btn btn-primary btn-lg btn-glow"
              onClick={handleAnalyze}
              disabled={!text.trim()}
              id="btn-analyze"
            >
              <span>Catch Me Up</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
