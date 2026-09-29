# HabitTrack — Offline Personal Habit Tracker

<div align="center">

![HabitTrack Banner](https://img.shields.io/badge/HabitTrack-v1.0.0-6366f1?style=for-the-badge&logo=checkmarx&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-4ade80?style=for-the-badge&logo=pwa&logoColor=white)
![Offline First](https://img.shields.io/badge/Offline-First-f97316?style=for-the-badge&logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

**A clean, fast, offline-first habit tracker — inspired by the simplicity of a physical habit-tracking spreadsheet, redesigned for your phone.**

[Live Demo](#) · [Install on Android](#-installing-on-android) · [Features](#-features) · [Tech Stack](#-tech-stack)

</div>

---

## 📖 What is HabitTrack?

HabitTrack is a **Progressive Web App (PWA)** that lets you track daily habits without any backend, account, or internet connection. The concept is simple:

> Create your habits once → tick them off every day → watch your consistency grow.

It works like a digital version of a physical habit-tracking spreadsheet — habits are rows, days are columns, and each cell is a checkbox. But it's built specifically for mobile, so it's fast, thumb-friendly, and works completely offline after installation.

**No login. No cloud. No subscription. Your data lives on your device.**

---

## ✨ Features

### 🎯 Core Tracking
- **Daily habit checklist** — tap once to complete, tap again to undo
- **Auto-shows today's habits** — never recreate them, they appear automatically every day
- **Real-time progress bar** — see your daily completion percentage update instantly
- **All-done celebration** — subtle 🎉 message when you've completed everything

### 📅 History
- **Weekly grid view** — spreadsheet-style Mon–Sun grid, tap any cell to toggle
- **Monthly calendar** — color-coded completion heat map (full / partial / some / none)
- **Day detail modal** — tap any calendar day to view and edit that day's habits
- **Edit past days** — mark historical habits as done or undone at any time

### 📊 Statistics
- **Overview cards** — overall completion %, total completed, current streak, best streak
- **Last 7 days bar chart** — quick visual of recent consistency
- **Last 30 days line chart** — spot trends over a month
- **Per-habit breakdown** — completion %, streak, and best streak for each habit

### 🔥 Streak System
- **Current streak** — consecutive days with all habits completed
- **Best streak** — your all-time record
- **Future-safe** — today's incomplete habits never break yesterday's streak
- **History-aware** — editing past days recalculates streaks correctly

### ⚙️ Habit Management
- **Add unlimited habits** — with emoji icon, name, and optional description
- **Edit anytime** — change name, emoji, or description
- **Archive (not delete)** — archived habits disappear from tracking but history is preserved
- **Restore archived habits** — bring them back whenever
- **Hard delete** — permanently remove a habit and all its logs if needed
- **Drag to reorder** — long-press the handle and drag on mobile, click and drag on desktop

### 💾 Data Management
- **Export JSON backup** — full backup of all habits, logs, and settings
- **Import JSON backup** — restore from any previous backup with auto-reload
- **Export CSV** — `Date,Habit,Completed` format — open in Excel, Google Sheets, Numbers
- **Clear all data** — nuclear option with confirmation dialog

### 🔔 Notifications
- **Daily reminders** — browser push notifications with permission flow
- **Test notification** — preview how reminders look before committing
- **Graceful fallback** — silently disabled if the browser doesn't support it

### 🎨 Appearance
- **Light / Dark / System** theme modes
- **Week starts on Monday or Sunday** — affects the history grid
- **Poppins font** — clean, readable, modern

### 📱 PWA / Offline
- **Installable** — "Add to Home Screen" on Android Chrome
- **Fully offline** — works with zero internet after first install
- **Standalone mode** — opens like a native app, no browser UI
- **Service worker** — Workbox precaches all assets including fonts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Database | IndexedDB via `idb` |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| PWA | vite-plugin-pwa + Workbox |
| Font | Poppins (Google Fonts, offline cached) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Clone & Install

```bash
git clone https://github.com/shubhamsutar-debug/HabitTracker.git
cd HabitTracker
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output goes to `dist/`. Preview it locally with:

```bash
npm run preview
```

---

## 📱 Installing on Android

1. Open **Chrome** on your Android phone
2. Navigate to the app URL (or your hosted URL)
3. Tap the **⋮ menu** → **"Add to Home Screen"** (or wait for the install prompt)
4. Tap **Install** / **Add**
5. The app appears on your home screen and opens in standalone mode — just like a native app

> **Tip:** After installation, turn off your internet and open the app. Everything still works — including adding habits, ticking checkboxes, and viewing history.

---

## 🏗 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── BottomNavigation/ # Mobile bottom tab bar
│   ├── ConfirmDialog/    # Accessible modal dialog
│   ├── EmptyState/       # Empty state placeholder
│   ├── HabitCard/        # Daily habit row with checkbox
│   ├── HabitCheckbox/    # Animated checkbox button
│   ├── HabitForm/        # Add/edit habit form with emoji picker
│   ├── Header/           # Sticky page header
│   ├── ProgressBar/      # Animated progress bar
│   └── Sheet/            # Mobile bottom drawer modal
│
├── pages/                # Route-level page components (lazy loaded)
│   ├── Today/            # Main dashboard — today's habits
│   ├── History/          # Weekly grid + monthly calendar
│   ├── Statistics/       # Charts, streaks, per-habit stats
│   ├── Habits/           # Habit management with drag-to-reorder
│   ├── Settings/         # Theme, notifications, backup/restore
│   └── Onboarding/       # First-launch welcome + habit selection
│
├── db/                   # IndexedDB data layer
│   ├── database.ts       # DB connection + schema (v1)
│   ├── habits.ts         # Habits CRUD + archive/unarchive/reorder
│   ├── logs.ts           # HabitLog read/write/toggle/range queries
│   └── settings.ts       # Singleton settings + clearAllData
│
├── hooks/                # Custom React hooks
│   ├── useHabits.ts      # Full habits state management
│   ├── useHabitLogs.ts   # Per-date / range / all-logs hooks
│   ├── useStatistics.ts  # Memoized stats calculation
│   ├── useTheme.ts       # Theme apply + persist
│   ├── useSettings.ts    # Settings load + update
│   └── useNotifications.ts # Push notification permission + toggle
│
├── utils/                # Pure utility functions
│   ├── dates.ts          # Local-timezone-safe date operations
│   ├── streaks.ts        # Current + best streak algorithms
│   ├── calculations.ts   # Day/range/overall completion stats
│   └── export.ts         # JSON backup + CSV export/import
│
├── types/                # TypeScript interfaces
│   ├── habit.ts          # Habit, HabitFormData
│   ├── habitLog.ts       # HabitLog
│   └── settings.ts       # Settings, Theme, WeekStartDay
│
├── App.tsx               # Root — routing + lazy loading + theme init
├── main.tsx              # React entry point
└── index.css             # Global styles (Tailwind v4 + CSS vars)
```

---

## 💾 Data Model

All data is stored locally in **IndexedDB** — three object stores:

### `habits`
```ts
{
  id: string           // "habit_<timestamp>_<random>"
  name: string         // "Morning Run"
  emoji: string        // "🏃"
  description?: string // "At least 20 minutes"
  order: number        // display order (0-indexed)
  active: boolean      // shows in daily tracking
  createdAt: string    // ISO 8601
  archivedAt?: string  // set when archived, undefined if active
}
```

### `habitLogs`
```ts
{
  id: string      // "log_<habitId>_<YYYY-MM-DD>" (deterministic)
  habitId: string
  date: string    // "2026-09-29" — local timezone, never UTC
  completed: boolean
  updatedAt: string // ISO 8601
}
```

### `settings`
```ts
{
  id: 'settings'           // singleton key
  theme: 'light' | 'dark' | 'system'
  weekStartsOn: 0 | 1      // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean
  onboardingCompleted: boolean
}
```

> **Important:** All dates use `YYYY-MM-DD` strings in the user's **local timezone**. There are no UTC conversions that could shift your dates.

---

## 🔌 Offline Mode — How It Works

1. **First visit:** The service worker (powered by Workbox) precaches all app assets — JS chunks, CSS, icons, and the Poppins font.
2. **All data operations** go directly to IndexedDB — no network requests are ever made for reading or writing habit data.
3. **Subsequent visits (online or offline):** The service worker intercepts navigation and serves `index.html` from cache. All JS/CSS is served from cache. The app loads instantly.
4. **Result:** After installation, turning off Wi-Fi and mobile data completely doesn't affect any functionality.

---

## 📤 Backup & Restore

### Export JSON
`Settings → Export Backup` downloads a complete snapshot:
```json
{
  "version": 1,
  "exportedAt": "2026-09-29T18:30:00.000Z",
  "habits": [...],
  "habitLogs": [...],
  "settings": { "theme": "light", ... }
}
```

### Import JSON
`Settings → Import Backup` — select a `.json` backup file. The app validates the structure, restores all data, and reloads automatically.

### Export CSV
`Settings → Export CSV` downloads a spreadsheet-compatible file:
```csv
Date,Habit,Completed
2026-09-29,"Morning Run",true
2026-09-29,"Reading",false
2026-09-29,"Cold Shower",true
```

---

## 🎨 Screenshots

> *Coming soon — run the app and take your own!*

---

## 🗺 Roadmap

- [ ] Scheduled daily reminder notifications (configurable time)
- [ ] Habit categories / groups
- [ ] Weekly completion goals (e.g. "5 out of 7 days")
- [ ] Home screen widget (via PWA shortcuts)
- [ ] iCloud / Google Drive backup sync (optional, opt-in)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ using React, TypeScript, and Vite.

**No backend. No account. No nonsense.**

</div>
