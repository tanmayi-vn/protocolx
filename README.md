# CatchUp AI — "What Did I Miss?"

> **Less scrolling. More knowing.**

CatchUp AI is a privacy-first, AI-powered micro-app that helps people quickly understand long, unread group conversations. Paste any chat export and get an instant structured catch-up brief — decisions, action items, deadlines, mentions, and priorities — all processed **entirely in your browser**.

---

## 🚩 The Problem

Modern teams live in group chats. After stepping away for a few hours (or a weekend), returning to 200+ unread messages is overwhelming. People either:
- Spend 20+ minutes scrolling trying to find what matters
- Ask "what did I miss?" and burden teammates
- Miss critical decisions, assignments, or deadlines entirely

## 💡 The Solution

CatchUp AI analyzes the conversation **locally in the browser** and extracts:

| Section | What you get |
|---|---|
| **Catch-Up Brief** | 3–6 concise bullet points of the most important things that happened |
| **Needs Your Attention** | Urgent items, approaching deadlines, unanswered questions |
| **Decisions Made** | Explicitly made decisions with source messages |
| **Action Items** | Checklist of tasks with owners, due dates, and priority |
| **Mentions & Questions** | Places you were mentioned or asked something |
| **Important Messages** | Key messages by priority with bookmarking |

---

## ✨ Features

- **Zero configuration** — no login, no API keys, no cloud backend
- **Privacy-first** — all analysis runs in the browser (NLP pipeline, no model download required)
- **Smart NLP analysis** — deadline detection, decision extraction, mention identification, urgency scoring
- **Traceable results** — every extracted insight links to its source message
- **Transparent prioritization** — every item explains *why* it got its priority
- **Full interactivity** — search, filter, mark tasks complete, bookmark messages
- **Export** — download the catch-up report as Markdown
- **Accessible** — semantic HTML, keyboard navigation, focus styles, ARIA labels

---

## 🏗️ Architecture

```
src/
├── types/index.ts           # TypeScript interfaces
├── utils/sampleData.ts      # Demo conversation
├── services/
│   ├── parser.ts            # WhatsApp/text format parser
│   ├── analyzer.ts          # Main analysis pipeline
│   ├── prioritizer.ts       # Urgency scoring & pattern detection
│   └── storage.ts           # IndexedDB persistence + Markdown export
├── pages/
│   ├── InputPage.tsx        # Input (paste/upload/sample)
│   ├── AnalyzingPage.tsx    # Progress display
│   └── DashboardPage.tsx    # Results dashboard
├── components/
│   ├── PriorityBadge.tsx    # Urgency level badge
│   └── SourceModal.tsx      # Source message popup
├── App.tsx                  # Root component & state management
├── index.css                # Global design system
└── main.tsx                 # Entry point
```

---

## 🔒 Local-First Privacy Design

- **No backend** — the app has no server that receives messages
- **No API calls** — no OpenAI, Gemini, or any external AI API
- **No telemetry** — zero analytics or tracking
- **Text treated as data** — imported messages are never interpreted as HTML or instructions
- **IndexedDB storage** — only analysis metadata is persisted (not raw conversation text)
- **Delete all data** — one-click "Clear Data" wipes everything from local storage

The analysis mode is clearly shown in the UI:
- ⚙️ **Smart NLP** — fully local rule-based analysis (current mode)
- ✨ **AI** — would indicate model-powered inference (Transformers.js integration ready)

---

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build
```

The app runs at `http://localhost:5173` by default.

---

## 🧪 Testing

Core logic tests are in `src/services/__tests__/`:

```bash
# Run tests
npm test
```

Test coverage includes:
1. Parsing WhatsApp and plain text formats
2. Multiline message handling
3. Deadline detection patterns
4. Personal mention detection
5. Decision extraction
6. Action item extraction
7. Priority scoring
8. Empty/malformed input handling

---

## 📋 Demo Scenario

1. Open the app at `http://localhost:5173`
2. Click **"Load Sample"** to load a realistic team conversation
3. Enter `Alex Johnson` as your name
4. Click **"Catch me up"**
5. Watch the analysis progress bar
6. Explore the dashboard:
   - See 4 urgent items in the stats bar
   - Read the Catch-Up Brief for a quick summary
   - Check action items assigned to Alex Johnson
   - Find decisions about SSO scope and demo strategy
   - See direct mentions and questions addressed to Alex
   - Click any "Source" link to see the original message
   - Try the search box — search "export" or "demo"
   - Mark a task complete with the checkbox
   - Click "Export" to download the full report as Markdown

---

## ⚠️ Known Limitations

- **NLP accuracy** — uses rule-based pattern matching; may miss subtle decisions or produce false positives for complex sentences
- **Action item deduplication** — similar tasks from nearby messages may appear multiple times
- **Date parsing** — relative dates ("by Friday") are extracted as text, not resolved to absolute dates
- **Model inference** — Transformers.js integration is scaffolded but not activated (avoids large model downloads during demo)
- **Mobile sidebar** — hidden on screens < 768px; navigation available via direct section scrolling

---

## 🎯 Engineering Decisions

**Why rule-based NLP for the demo?**
Loading a transformer model (even quantized) takes 5–15 seconds on first run. For a live hackathon demo, instant startup and zero configuration is more compelling than model inference. The architecture cleanly separates the analyzer from the summarizer, so a Transformers.js model can be plugged in without changing the UI.

**Why not send to a cloud API?**
Privacy is a genuine product differentiator. Users won't paste sensitive team conversations into a tool that sends data to unknown servers. The local-only claim is verifiable via browser DevTools.

**Why IndexedDB instead of localStorage?**
IndexedDB handles larger payloads, is async (non-blocking), and is more appropriate for structured data. Only analysis results (not conversation text) are stored.

**Why extract rather than generate?**
All insights are extracted from actual message content with source links. Nothing is fabricated. This makes the tool trustworthy and auditable.
