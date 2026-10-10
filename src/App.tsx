// CatchUp AI — Main App
import { useState, useCallback, useEffect } from 'react';
import { Lock, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';
import InputPage from './pages/InputPage';
import AnalyzingPage from './pages/AnalyzingPage';
import DashboardPage from './pages/DashboardPage';
import type { AppView, ConversationData, AnalysisResult } from './types';
import { analyzeConversation } from './services/analyzer';
import { saveAnalysis } from './services/storage';
import { Scene } from './Scene';

export default function App() {
  const [view, setView] = useState<AppView>(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('scene') || window.location.hash === '#scene')) {
      return 'scene';
    }
    return 'input';
  });
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progressStep, setProgressStep] = useState('');
  const [progressPct, setProgressPct] = useState(0);

  // Dark / Light Mode state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('catchup-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('catchup-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAnalyze = useCallback(
    async (data: ConversationData, userName: string) => {
      setConversation(data);
      setView('analyzing');
      setProgressPct(0);
      setProgressStep('Ingesting and parsing messages…');

      try {
        const result = await analyzeConversation(
          data,
          userName,
          (step, pct) => {
            setProgressStep(step);
            setProgressPct(pct);
          }
        );

        // Persist analysis (not the conversation text itself)
        await saveAnalysis(result).catch(() => {
          // Storage failure is non-critical — continue
        });

        setAnalysis(result);
        setView('dashboard');
      } catch (err) {
        console.error('Analysis failed:', err);
        setProgressStep('Analysis encountered an error. Please try again.');
        setTimeout(() => setView('input'), 2500);
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setView('input');
    setConversation(null);
    setAnalysis(null);
    setProgressPct(0);
    setProgressStep('');
  }, []);

  const handleUpdateResult = useCallback((r: AnalysisResult) => {
    setAnalysis(r);
    // Persist updated result (e.g., task completions, bookmarks)
    saveAnalysis(r).catch(() => {});
  }, []);

  return (
    <div className="app-root">
      {/* Top micro privacy announcement */}
      <div className="privacy-banner" role="status" aria-label="Privacy status">
        <span className="privacy-pulse-dot" aria-hidden />
        <span className="privacy-banner-text">
          <strong>100% Client-Side Privacy:</strong> All conversation intelligence runs inside your browser. No data ever leaves your device.
        </span>
      </div>

      {/* Sleek SaaS Glass Header */}
      <header className="app-header">
        <div className="header-brand" onClick={handleReset} role="button" tabIndex={0} title="Return to start">
          <div className="header-logo-glow">
            <Sparkles size={16} className="logo-sparkle-icon" />
          </div>
          <div className="header-text-group">
            <div className="header-title-row">
              <span className="header-name">CatchUp AI</span>
              <span className="header-version-pill">v1.2</span>
            </div>
            <div className="header-tagline">Less scrolling. More knowing.</div>
          </div>
        </div>

        <div className="header-actions">
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="theme-toggle-icon sun-icon" />
                <span className="theme-toggle-text">Light</span>
              </>
            ) : (
              <>
                <Moon size={14} className="theme-toggle-icon moon-icon" />
                <span className="theme-toggle-text">Dark</span>
              </>
            )}
          </button>

          <button
            className="theme-toggle-btn"
            onClick={() => setView((v) => (v === 'scene' ? 'input' : 'scene'))}
            aria-label="Toggle Sketchbook Landing Page Demo"
            title="Toggle Sketchbook Landing Page Demo"
            id="sketchbook-toggle"
          >
            <Sparkles size={14} className="theme-toggle-icon" />
            <span className="theme-toggle-text">{view === 'scene' ? 'Back' : 'Sketchbook'}</span>
          </button>

          <div className="header-status-pill">
            <span className="live-dot" />
            <span>Local Engine</span>
          </div>

          <div className="header-badge-security">
            <ShieldCheck size={12} />
            <span>Zero Egress</span>
          </div>

          <div className="header-badge-offline">
            <Lock size={11} />
            <span>Private</span>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="app-main-content">
        {view === 'scene' && (
          <div style={{ width: '100%', height: 'calc(100vh - 120px)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <Scene />
          </div>
        )}

        {view === 'input' && (
          <InputPage onAnalyze={handleAnalyze} />
        )}

        {view === 'analyzing' && (
          <AnalyzingPage step={progressStep} progress={progressPct} />
        )}

        {view === 'dashboard' && analysis && conversation && (
          <DashboardPage
            result={analysis}
            conversation={conversation}
            onReset={handleReset}
            onUpdateResult={handleUpdateResult}
          />
        )}
      </main>
    </div>
  );
}
