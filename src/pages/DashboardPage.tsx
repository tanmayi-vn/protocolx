// DashboardPage: high-end executive briefing and analysis interface
import { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  Trash2,
  RotateCcw,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  Bell,
  Users,
  Link,
  Bookmark,
  BookmarkCheck,
  Check,
  Calendar,
  User,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import type { AnalysisResult, ConversationData, FilterTab, ParsedMessage } from '../types';
import PriorityBadge from '../components/PriorityBadge';
import SourceModal from '../components/SourceModal';
import { exportAsMarkdown, clearAllData } from '../services/storage';

interface DashboardPageProps {
  result: AnalysisResult;
  conversation: ConversationData;
  onReset: () => void;
  onUpdateResult: (r: AnalysisResult) => void;
}

// Generate deterministic avatar color from name
function getAvatarColor(name: string): { bg: string; text: string; border: string } {
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.18)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' },
    { bg: 'rgba(168, 85, 247, 0.18)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' },
    { bg: 'rgba(236, 72, 153, 0.18)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.4)' },
    { bg: 'rgba(34, 197, 94, 0.18)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' },
    { bg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' },
    { bg: 'rgba(6, 182, 212, 0.18)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.4)' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardPage({
  result,
  conversation,
  onReset,
  onUpdateResult,
}: DashboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'my' | 'open' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceMsg, setSourceMsg] = useState<ParsedMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Metrics calculations
  const urgentCount = result.attentionItems.filter((a) => a.priority === 'urgent').length;
  const completedTaskCount = result.actionItems.filter((a) => a.completed).length;
  const totalTaskCount = result.actionItems.length;
  const taskCount = totalTaskCount - completedTaskCount;
  const mentionCount = result.mentions.length;
  const decisionCount = result.decisions.length;
  const bookmarkedCount = result.importantMessages.filter((m) => m.bookmarked).length;

  // Reading time saved (est ~200 wpm from raw chat)
  const estimatedReadMinsSaved = useMemo(() => {
    const totalWords = conversation.messages.reduce(
      (acc, m) => acc + m.content.split(/\s+/).length,
      0
    );
    return Math.max(2, Math.round(totalWords / 160));
  }, [conversation.messages]);

  // Participant breakdown
  const participantStats = useMemo(() => {
    const counts = new Map<string, number>();
    conversation.messages.forEach((m) => {
      if (m.sender) counts.set(m.sender, (counts.get(m.sender) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [conversation.messages]);

  const getMessageById = useCallback(
    (id: string): ParsedMessage | null =>
      conversation.messages.find((m) => m.id === id) ?? null,
    [conversation.messages]
  );

  const showSource = (msgId: string) => {
    const msg = getMessageById(msgId);
    if (msg) setSourceMsg(msg);
  };

  // Search highlight helper
  const highlight = (text: string): string => {
    if (!searchQuery.trim()) return text;
    const esc = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark class="search-highlight">$1</mark>');
  };

  const filterText = (text: string): boolean => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    const updated = {
      ...result,
      actionItems: result.actionItems.map((a) =>
        a.id === taskId ? { ...a, completed: !a.completed } : a
      ),
    };
    onUpdateResult(updated);
  };

  // Toggle bookmark on important message
  const toggleBookmark = (msgId: string) => {
    const updated = {
      ...result,
      importantMessages: result.importantMessages.map((m) =>
        m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m
      ),
    };
    onUpdateResult(updated);
    showToast('Bookmark updated');
  };

  // Copy Executive Brief in clean Slack/Teams Markdown
  const copyExecutiveBrief = async () => {
    let brief = `*CatchUp AI — Executive Briefing*\n\n`;
    brief += `*Key Highlights:*\n`;
    result.summary.forEach((p) => {
      brief += `• ${p.text}\n`;
    });

    if (result.decisions.length > 0) {
      brief += `\n*Decisions Agreed:*\n`;
      result.decisions.forEach((d) => {
        brief += `• ${d.text}${d.madeBy ? ` (by ${d.madeBy})` : ''}\n`;
      });
    }

    if (result.actionItems.length > 0) {
      brief += `\n*Action Items:*\n`;
      result.actionItems.forEach((a) => {
        brief += `• [${a.completed ? 'x' : ' '}] ${a.description}${a.owner ? ` (@${a.owner})` : ''}${a.dueDate ? ` — Due: ${a.dueDate}` : ''}\n`;
      });
    }

    await navigator.clipboard.writeText(brief);
    showToast('Executive briefing copied to clipboard!');
  };

  // Export full markdown
  const exportReport = () => {
    const md = exportAsMarkdown(result);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catchup-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export file downloaded');
  };

  // Clear data
  const handleClearData = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearAllData();
    onReset();
  };

  // Filtered sections
  const filteredSummary = useMemo(
    () =>
      activeFilter === 'all' || activeFilter === 'urgent' || activeFilter === 'important'
        ? result.summary.filter((p) => filterText(p.text))
        : [],
    [result.summary, activeFilter, searchQuery]
  );

  const filteredAttention = useMemo(() => {
    if (activeFilter !== 'all' && activeFilter !== 'urgent') return [];
    return result.attentionItems.filter(
      (a) =>
        (activeFilter === 'urgent' ? a.priority === 'urgent' : true) &&
        filterText(a.text)
    );
  }, [result.attentionItems, activeFilter, searchQuery]);

  const filteredDecisions = useMemo(() => {
    if (activeFilter !== 'all' && activeFilter !== 'decisions') return [];
    return result.decisions.filter((d) => filterText(d.text));
  }, [result.decisions, activeFilter, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (activeFilter !== 'all' && activeFilter !== 'tasks') return [];
    return result.actionItems.filter((a) => {
      if (!filterText(a.description)) return false;
      if (taskFilter === 'open' && a.completed) return false;
      if (taskFilter === 'done' && !a.completed) return false;
      return true;
    });
  }, [result.actionItems, activeFilter, taskFilter, searchQuery]);

  const filteredMentions = useMemo(() => {
    if (activeFilter !== 'all' && activeFilter !== 'mentions') return [];
    return result.mentions.filter((m) => filterText(m.excerpt));
  }, [result.mentions, activeFilter, searchQuery]);

  const filteredImportant = useMemo(() => {
    if (activeFilter !== 'all' && activeFilter !== 'important') return [];
    return result.importantMessages.filter((m) => {
      if (activeFilter === 'important' && !m.bookmarked && m.priority !== 'urgent') return false;
      return filterText(m.excerpt);
    });
  }, [result.importantMessages, activeFilter, searchQuery]);

  // Overall match count for search
  const totalMatches =
    (searchQuery.trim()
      ? filteredSummary.length +
        filteredAttention.length +
        filteredDecisions.length +
        filteredTasks.length +
        filteredMentions.length +
        filteredImportant.length
      : null);

  return (
    <div className="dashboard">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast" role="status">
          <Sparkles size={14} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <nav className="sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <div className="sidebar-section-label">Executive Views</div>
        </div>

        <div className="sidebar-nav-list">
          {(
            [
              { id: 'all', icon: <MessageSquare size={15} />, label: 'All Insights', count: null },
              { id: 'urgent', icon: <AlertTriangle size={15} />, label: 'Urgent Needs', count: urgentCount, badgeColor: 'urgent' },
              { id: 'tasks', icon: <CheckSquare size={15} />, label: 'Action Items', count: taskCount, badgeColor: 'accent' },
              { id: 'decisions', icon: <Lightbulb size={15} />, label: 'Decisions', count: decisionCount, badgeColor: 'cyan' },
              { id: 'mentions', icon: <Users size={15} />, label: 'Mentions & Asks', count: mentionCount, badgeColor: 'purple' },
              { id: 'important', icon: <Bell size={15} />, label: 'Important & Saved', count: bookmarkedCount, badgeColor: 'amber' },
            ] as {
              id: FilterTab;
              icon: React.ReactNode;
              label: string;
              count: number | null;
              badgeColor?: string;
            }[]
          ).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeFilter === item.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(item.id)}
              aria-pressed={activeFilter === item.id}
              id={`nav-${item.id}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {item.count != null && item.count > 0 && (
                <span className={`nav-item-count count-${item.badgeColor || 'default'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Participant breakdown pill stack */}
        <div className="sidebar-participants">
          <div className="sidebar-section-label">Active Speakers ({participantStats.length})</div>
          <div className="participants-stack">
            {participantStats.slice(0, 6).map((p) => {
              const c = getAvatarColor(p.name);
              return (
                <div key={p.name} className="participant-chip" title={`${p.name}: ${p.count} messages`}>
                  <div
                    className="avatar-circle"
                    style={{ background: c.bg, color: c.text, borderColor: c.border }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span className="participant-name">{p.name}</span>
                  <span className="participant-msg-count">{p.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="sidebar-actions">
          <button className="btn btn-secondary btn-sm btn-full" onClick={onReset} id="btn-new-conversation">
            <RotateCcw size={13} />
            <span>New Catch-Up</span>
          </button>

          <button
            className={`btn btn-sm btn-full ${confirmClear ? 'btn-danger' : 'btn-ghost'}`}
            onClick={handleClearData}
            id="btn-clear-data"
          >
            <Trash2 size={13} />
            <span>{confirmClear ? 'Confirm Delete All' : 'Clear Saved Data'}</span>
          </button>

          {confirmClear && (
            <button className="btn btn-ghost btn-sm btn-full" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main" aria-label="Catch-up results">
        {/* Top Floating Glass Toolbar */}
        <div className="dashboard-toolbar">
          <div className="search-box" role="search">
            <Search size={15} className="search-icon" aria-hidden />
            <input
              type="search"
              placeholder="Search extracted insights, tasks, decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catch-up results"
              id="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
            {totalMatches !== null && (
              <span className="search-match-badge">{totalMatches} matches</span>
            )}
          </div>

          <div className="toolbar-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={copyExecutiveBrief}
              id="btn-copy-summary"
              title="Copy formatted briefing for Slack or Teams"
            >
              <Copy size={13} />
              <span>Copy Briefing</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={exportReport}
              id="btn-export"
              title="Download Markdown Report"
            >
              <Download size={13} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Premium Executive KPI Row */}
        <div className="executive-kpi-banner">
          <div className="kpi-card time-saved">
            <div className="kpi-icon-wrap">
              <Clock size={18} className="kpi-icon-pulse" />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">~{estimatedReadMinsSaved} mins</div>
              <div className="kpi-label">Reading Time Saved</div>
            </div>
          </div>

          <div className="kpi-card urgent-highlight">
            <div className="kpi-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value text-urgent">{urgentCount}</div>
              <div className="kpi-label">Urgent Items</div>
            </div>
          </div>

          <div className="kpi-card tasks-summary">
            <div className="kpi-icon-wrap">
              <CheckSquare size={18} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value text-accent">
                {completedTaskCount}/{totalTaskCount}
              </div>
              <div className="kpi-label">Tasks Completed</div>
            </div>
            {totalTaskCount > 0 && (
              <div className="kpi-mini-progress">
                <div
                  className="kpi-progress-bar"
                  style={{
                    width: `${Math.round((completedTaskCount / totalTaskCount) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="kpi-card decisions-summary">
            <div className="kpi-icon-wrap">
              <Lightbulb size={18} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value text-cyan">{decisionCount}</div>
              <div className="kpi-label">Decisions Reached</div>
            </div>
          </div>

          <div className="kpi-card mentions-summary">
            <div className="kpi-icon-wrap">
              <Users size={18} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{mentionCount}</div>
              <div className="kpi-label">Mentions & Asks</div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Feed */}
        <div className="dashboard-content">
          {/* --- SECTION 1: CATCH-UP BRIEF --- */}
          {filteredSummary.length > 0 && (
            <section className="dashboard-section section-brief" aria-labelledby="section-brief">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge">📋</div>
                  <h2 className="section-title" id="section-brief">
                    Executive Catch-Up Brief
                  </h2>
                  <span className="section-count">{filteredSummary.length} points</span>
                </div>
              </div>

              <div className="brief-card">
                <ul className="brief-list" aria-label="Catch-up summary points">
                  {filteredSummary.map((point) => (
                    <li key={point.id} className="brief-item">
                      <div className="brief-bullet-glow" aria-hidden />
                      <div
                        className="brief-text"
                        dangerouslySetInnerHTML={{
                          __html: highlight(point.text),
                        }}
                      />
                      {point.sourceMessageIds[0] && (
                        <button
                          className="source-link-pill"
                          onClick={() => showSource(point.sourceMessageIds[0])}
                          title="View original message in context"
                        >
                          <Link size={11} />
                          <span>Context</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* --- SECTION 2: NEEDS ATTENTION / URGENT --- */}
          {filteredAttention.length > 0 && (
            <section className="dashboard-section section-attention" aria-labelledby="section-attention">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge urgent-glow">🚨</div>
                  <h2 className="section-title" id="section-attention">
                    Urgent & Immediate Attention
                  </h2>
                  <span className="section-count count-urgent">{filteredAttention.length} items</span>
                </div>
              </div>

              <div className="cards-grid">
                {filteredAttention.map((item) => (
                  <div key={item.id} className="attention-card border-urgent">
                    <div className="card-top-row">
                      <PriorityBadge priority={item.priority} />
                      <span className="pill-tag">{item.type.replace('-', ' ')}</span>
                    </div>
                    <p
                      className="card-main-text"
                      dangerouslySetInnerHTML={{ __html: highlight(item.text) }}
                    />
                    <div className="card-bottom-row">
                      <div className="reason-pill">
                        <AlertTriangle size={11} />
                        <span>{item.priorityReason}</span>
                      </div>
                      <button
                        className="source-link-pill"
                        onClick={() => showSource(item.sourceMessageId)}
                        title="View source message"
                      >
                        <Link size={11} />
                        <span>Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- SECTION 3: ACTION ITEMS / TASKS --- */}
          {filteredTasks.length > 0 && (
            <section className="dashboard-section section-tasks" aria-labelledby="section-tasks">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge">✅</div>
                  <h2 className="section-title" id="section-tasks">
                    Action Items & Responsibilities
                  </h2>
                  <span className="section-count count-accent">{taskCount} open</span>
                </div>

                {/* Sub-filter tabs */}
                <div className="task-sub-filters">
                  <button
                    className={`sub-filter-btn ${taskFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setTaskFilter('all')}
                  >
                    All ({result.actionItems.length})
                  </button>
                  <button
                    className={`sub-filter-btn ${taskFilter === 'open' ? 'active' : ''}`}
                    onClick={() => setTaskFilter('open')}
                  >
                    Open ({taskCount})
                  </button>
                  <button
                    className={`sub-filter-btn ${taskFilter === 'done' ? 'active' : ''}`}
                    onClick={() => setTaskFilter('done')}
                  >
                    Done ({completedTaskCount})
                  </button>
                </div>
              </div>

              <div className="task-list-card">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${task.completed ? 'is-completed' : ''}`}
                  >
                    <button
                      className={`task-check-circle ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      id={`task-check-${task.id}`}
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </button>

                    <div className="task-content-area">
                      <p
                        className="task-description-text"
                        dangerouslySetInnerHTML={{ __html: highlight(task.description) }}
                      />

                      <div className="task-badges-row">
                        <PriorityBadge priority={task.priority} />

                        {task.owner && (
                          <div className="task-pill assignee">
                            <User size={11} />
                            <span>{task.owner}</span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="task-pill deadline">
                            <Calendar size={11} />
                            <span>{task.dueDate}</span>
                          </div>
                        )}

                        <span className="task-reason-text">{task.priorityReason}</span>

                        <button
                          className="source-link-pill ml-auto"
                          onClick={() => showSource(task.sourceMessageId)}
                          title="View message where task was assigned"
                        >
                          <Link size={11} />
                          <span>Source</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- SECTION 4: DECISIONS LOG --- */}
          {filteredDecisions.length > 0 && (
            <section className="dashboard-section section-decisions" aria-labelledby="section-decisions">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge cyan-glow">⚡</div>
                  <h2 className="section-title" id="section-decisions">
                    Agreed Decisions
                  </h2>
                  <span className="section-count count-cyan">{filteredDecisions.length} recorded</span>
                </div>
              </div>

              <div className="decisions-grid">
                {filteredDecisions.map((d) => (
                  <div key={d.id} className="decision-card">
                    <div className="decision-top-bar">
                      <span className="decision-type-label">Confirmed Decision</span>
                      {d.madeBy && (
                        <div className="decision-author">
                          <User size={11} />
                          <span>{d.madeBy}</span>
                        </div>
                      )}
                    </div>
                    <p
                      className="decision-statement"
                      dangerouslySetInnerHTML={{ __html: highlight(d.text) }}
                    />
                    <div className="decision-footer">
                      {d.confidence === 'low' && (
                        <span className="tag-warning">⚠️ Needs confirmation</span>
                      )}
                      <button
                        className="source-link-pill ml-auto"
                        onClick={() => showSource(d.sourceMessageId)}
                        title="View origin message"
                      >
                        <Link size={11} />
                        <span>Context</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- SECTION 5: MENTIONS & QUESTIONS --- */}
          {filteredMentions.length > 0 && (
            <section className="dashboard-section section-mentions" aria-labelledby="section-mentions">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge">💬</div>
                  <h2 className="section-title" id="section-mentions">
                    Mentions & Questions For You
                  </h2>
                  <span className="section-count">{filteredMentions.length}</span>
                </div>
              </div>

              <div className="cards-grid">
                {filteredMentions.map((m) => {
                  const avatar = getAvatarColor(m.sender);
                  return (
                    <div key={m.id} className="mention-card">
                      <div className="card-top-row">
                        <div className="sender-info-wrap">
                          <div
                            className="avatar-circle-sm"
                            style={{
                              background: avatar.bg,
                              color: avatar.text,
                              borderColor: avatar.border,
                            }}
                          >
                            {getInitials(m.sender)}
                          </div>
                          <span className="card-sender-name">{m.sender}</span>
                        </div>
                        <span className={`mention-badge ${m.type}`}>{m.type}</span>
                        {m.timestamp && <span className="card-time">{m.timestamp}</span>}
                      </div>

                      <p
                        className="card-main-text"
                        dangerouslySetInnerHTML={{ __html: highlight(m.excerpt) }}
                      />

                      <div className="card-bottom-row">
                        <button
                          className="source-link-pill ml-auto"
                          onClick={() => showSource(m.messageId)}
                        >
                          <Link size={11} />
                          <span>Source Message</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* --- SECTION 6: IMPORTANT HIGHLIGHTS & SAVED --- */}
          {filteredImportant.length > 0 && (
            <section className="dashboard-section section-important" aria-labelledby="section-important">
              <div className="section-header">
                <div className="section-title-wrap">
                  <div className="section-emoji-badge">📣</div>
                  <h2 className="section-title" id="section-important">
                    Key Highlights & Bookmarks
                  </h2>
                  <span className="section-count">{filteredImportant.length}</span>
                </div>
              </div>

              <div className="cards-grid">
                {filteredImportant.map((msg) => (
                  <div key={msg.id} className={`highlight-card ${msg.bookmarked ? 'bookmarked' : ''}`}>
                    <div className="card-top-row">
                      <span className="card-sender-name">{msg.sender}</span>
                      <div className="card-top-actions">
                        <PriorityBadge priority={msg.priority} />
                        {msg.timestamp && <span className="card-time">{msg.timestamp}</span>}
                        <button
                          className={`bookmark-toggle-btn ${msg.bookmarked ? 'active' : ''}`}
                          onClick={() => toggleBookmark(msg.id)}
                          title={msg.bookmarked ? 'Saved' : 'Bookmark message'}
                          id={`bookmark-${msg.id}`}
                        >
                          {msg.bookmarked ? (
                            <BookmarkCheck size={14} className="bookmark-icon-active" />
                          ) : (
                            <Bookmark size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p
                      className="card-main-text"
                      dangerouslySetInnerHTML={{ __html: highlight(msg.excerpt) }}
                    />

                    <div className="card-bottom-row">
                      <div className="tags-wrap">
                        {msg.tags.map((tag) => (
                          <span key={tag} className="meta-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        className="source-link-pill ml-auto"
                        onClick={() => showSource(msg.messageId)}
                      >
                        <Link size={11} />
                        <span>Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty search/filter state */}
          {filteredSummary.length === 0 &&
            filteredAttention.length === 0 &&
            filteredDecisions.length === 0 &&
            filteredTasks.length === 0 &&
            filteredMentions.length === 0 &&
            filteredImportant.length === 0 && (
              <div className="dashboard-empty-state">
                <div className="empty-icon-box">
                  <Search size={28} />
                </div>
                <h3>No matching insights found</h3>
                <p>
                  {searchQuery
                    ? `No items matched your search query "${searchQuery}".`
                    : 'No items currently available in this filtered view.'}
                </p>
                {searchQuery && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>
                    Clear search filter
                  </button>
                )}
              </div>
            )}
        </div>
      </main>

      {/* High-fidelity Context Modal */}
      <SourceModal message={sourceMsg} onClose={() => setSourceMsg(null)} />
    </div>
  );
}
