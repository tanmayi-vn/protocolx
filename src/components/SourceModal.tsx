// SourceModal: rich inspect modal showing original verified chat snippet
import { useState, useEffect } from 'react';
import { X, Copy, Check, MessageSquare, ShieldCheck } from 'lucide-react';
import type { ParsedMessage } from '../types';

interface SourceModalProps {
  message: ParsedMessage | null;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function SourceModal({ message, onClose }: SourceModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!message) return null;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(`${message.sender}: ${message.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Verified Source Message"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-header-title">
            <MessageSquare size={16} className="modal-title-icon" />
            <h3 className="modal-title">Verified Source Message</h3>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-sender-card">
            <div className="modal-sender-avatar">
              {getInitials(message.sender || 'User')}
            </div>
            <div className="modal-sender-meta">
              <span className="modal-sender-name">{message.sender || 'Unknown Sender'}</span>
              {message.timestamp && (
                <span className="modal-timestamp">{message.timestamp}</span>
              )}
            </div>
            <button
              className="btn btn-ghost btn-sm btn-copy-raw"
              onClick={copyMessage}
              title="Copy raw message snippet"
            >
              {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="modal-bubble-box">
            <p className="modal-message-text">{message.content}</p>
          </div>

          <div className="modal-audit-footer">
            <ShieldCheck size={13} className="audit-icon" />
            <span>Traceable grounding: All AI insights link directly to verifiable chat messages.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
