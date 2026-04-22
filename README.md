# Scriptor

Scriptor — a writing companion for long-form fiction authors using AI in their process. Manages chapter structure, world bible, and catches consistency errors before your readers do.

**[novelplus-g157.vercel.app](https://novelplus-g157.vercel.app)**

<!-- DEMO VIDEO: drag and drop your MP4 here in the GitHub editor, then delete this comment -->

All data lives in your browser. No accounts, no cloud sync, no subscriptions.

---

## Features

**Chapter Editor**
Distraction-free textarea with autosave (800ms debounce), live word count, and fullscreen mode. Bible terms you've tracked are underlined directly in the editor — hover to see the description without leaving the page.

**World Bible**
Track characters, locations, terms, and factions with names, aliases, and descriptions. Mark which chapter first introduces each entry. Add entries manually, extract them from a master doc with AI, or let Scriptor suggest new ones after you finish writing a chapter.

**Consistency Checker**
Scans every chapter against your world bible and flags premature mentions — places where a character or term appears before the chapter you marked as their introduction. No false positives from aliases; multi-word terms like "The Silver Compact" match correctly.

**AI Revision Panel**
Highlight any passage in the editor and run one of three actions:
- **Tighten** — cuts redundancy, preserves your voice
- **Pacing** — identifies where the passage drags or rushes
- **Sound like this chapter** — rewrites the selection to match a reference chapter's tone

**Extract from Master Doc**
Paste your existing outline or draft and the AI pulls out every named character, location, term, and faction. Review and edit each one before accepting — duplicates already in your bible are filtered out automatically.

**Scan Chapter**
After finishing a chapter, scan it for new entities the AI thinks you should be tracking. Each suggestion comes pre-tagged with the current chapter as its introduction point.

**Backup / Restore**
Export your entire novel — chapters, bible entries, everything — as a single `.scriptor.json` file. Import it on any machine or browser to restore exactly where you left off.

---

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/) for all transitions and animations
- [Zustand](https://zustand-demo.pmnd.rs) for client state
- [idb](https://github.com/jakearchibald/idb) (IndexedDB) for persistence
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) — server-side only via API routes
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) for drag-to-reorder chapters

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd novelplus
npm install
```

### 2. Add your Anthropic API key

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

The AI features (revision panel, extract, scan chapter) won't work without this. Everything else — editor, bible, consistency checker, search — works offline with no key.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A demo novel ("The Hollow King") seeds automatically on first load so you can explore all features immediately.

---

## How the Consistency Checker Works

Each bible entry can have a `firstIntroducedChapterId`. When you run the checker, it scans every chapter's text with word-boundary regex for each tracked name and alias. If a match appears in a chapter that comes *before* the entry's introduction chapter, it's flagged as a premature mention.

The demo novel ships with two intentional flags in Chapter 3 — "Vaelith" and "The Silver Compact" appear there, but both entries point to Chapter 4 as their introduction. Click **Check Consistency** on Chapter 3 to see it in action.

---

## Data Storage

Everything is stored in IndexedDB under the key `scriptor`. No data is ever sent to a server except the text you explicitly send to the AI endpoints (revision, extract, scan). The Anthropic API key never leaves the server — it's only used inside Next.js API routes.

Clearing your browser's site data will wipe your novels. Use **Export backup** regularly if you're writing something you care about.

---

## Deployment

Deploy to [Vercel](https://vercel.com) in one step:

```bash
vercel
```

Set `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` as environment variables in your Vercel project settings. Everything else works without configuration.
