// AnalyzingPage: premium progress animation during analysis
import { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalyzingPageProps {
  step: string;
  progress: number;
}

const PIPELINE_STAGES = [
  { id: 'parse', label: 'Parsing messages & speaker chronologies' },
  { id: 'mentions', label: 'Detecting direct mentions, tags & questions' },
  { id: 'deadlines', label: 'Extracting time-sensitive deadlines & commitments' },
  { id: 'decisions', label: 'Synthesizing team decisions & agreements' },
  { id: 'prioritize', label: 'Scoring priority weights & attention matrix' },
];

export default function AnalyzingPage({ step, progress }: AnalyzingPageProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    const idx = Math.min(
      PIPELINE_STAGES.length - 1,
      Math.floor((progress / 100) * PIPELINE_STAGES.length)
    );
    setActiveStageIndex(idx);
  }, [progress]);

  return (
    <div className="analyzing-page">
      <div className="ambient-glow glow-center" aria-hidden="true" />

      <div className="analyzing-container">
        {/* Holographic scanner orb */}
        <div className="radar-scanner" role="status" aria-label="Analyzing conversation">
          <div className="radar-ring ring-1" />
          <div className="radar-ring ring-2" />
          <div className="radar-ring ring-3" />
          <div className="radar-core">
            <Cpu size={32} className="radar-icon-pulse" />
          </div>
        </div>

        <div className="analyzing-header-text">
          <span className="badge-pill">
            <Loader2 size={12} className="spin-fast" />
            <span>Local Neural Pipeline</span>
          </span>
          <h2 className="analyzing-title">Distilling Conversation Intelligence</h2>
          <p className="analyzing-current-step">{step || 'Extracting signals from conversation log...'}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div
            className="progress-bar-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-shine" />
            </div>
          </div>
          <div className="progress-metrics-row">
            <span className="progress-pct-value">{progress}% completed</span>
            <span className="progress-speed">⚡ Client-Side NLP</span>
          </div>
        </div>

        {/* Pipeline Stage Checkpoints */}
        <div className="stages-timeline">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;

            return (
              <div
                key={stage.id}
                className={`stage-row ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="stage-icon">
                  {isCompleted ? (
                    <CheckCircle2 size={15} className="stage-check" />
                  ) : isCurrent ? (
                    <div className="stage-pulse-dot" />
                  ) : (
                    <div className="stage-idle-dot" />
                  )}
                </div>
                <span className="stage-label">{stage.label}</span>
              </div>
            );
          })}
        </div>

        <div className="analyzing-privacy-badge">
          <ShieldCheck size={14} className="privacy-badge-icon" />
          <span>Zero cloud egress. Analysis computed strictly inside WebAssembly/JS threads.</span>
        </div>
      </div>
    </div>
  );
}
