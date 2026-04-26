# 🚀 Campus Connect — Intelligent Ambassador Management & Engagement Platform

> **Hackathon-ready, production-quality platform** for managing campus ambassador programs with AI-powered GitHub analysis, gamification, and real-time analytics.

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Demo Accounts](#demo-accounts)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## 🎯 Problem Statement

Traditional campus ambassador programs rely on fragmented tools — WhatsApp groups, Excel sheets, and emails — leading to:

- ❌ Inefficient task assignment and tracking
- ❌ Manual, slow submission verification
- ❌ No transparency or real-time progress visibility
- ❌ Low ambassador engagement and motivation
- ❌ No data-driven decision-making for admin teams

**Campus Connect solves all of this** with a single, intelligent platform.

---

## ✨ Features

### 👑 Admin Features
| Feature | Description |
|---------|-------------|
| 📊 **Analytics Dashboard** | Real-time charts — Bar, Doughnut, Radar — with KPI cards |
| 📋 **Task Manager** | Create, edit, delete tasks with points, deadlines, proof requirements |
| 📥 **Submission Review** | Approve/reject submissions with feedback, auto-verification detection |
| 👥 **Ambassador Registry** | View all ambassadors with points, badges, GitHub scores |
| ⚡ **Auto-Verification** | Keyword-based URL verification — submissions auto-approved instantly |

### 🌟 Ambassador Features
| Feature | Description |
|---------|-------------|
| 📋 **Task Board** | View all tasks with status, deadlines, and point values |
| 📤 **Proof Submission** | Submit links, screenshots, or file references |
| 🏆 **Leaderboard** | Ranked view with podium for top 3, global rankings |
| 🏅 **Badge System** | Bronze → Silver → Gold → Platinum with confetti animation |
| 🔬 **GitHub Analyzer** | Intelligent profile scoring with actionable recommendations |

### 🔬 GitHub Profile Analyzer
- Scores GitHub profiles **out of 100** using 5 dimensions
- **Activity Score** — Recent commits and push frequency
- **Repository Score** — Count and star quality
- **Social Score** — Follower reach and community trust
- **Quality Score** — Documentation and descriptions
- **Consistency Score** — Ongoing contribution patterns
- Generates **Strengths**, **Improvements**, and **Archival Suggestions**
- Pre-loaded demo profiles for `torvalds`, `mojombo`, `octocat`
- 1-hour response caching to prevent API rate limits

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18 |
| **Styling** | Tailwind CSS 3 with custom design system |
| **Charts** | Chart.js + React-ChartJS-2 (Bar, Doughnut, Radar) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Database** | In-memory store (demo) / PostgreSQL (production) |
| **GitHub API** | REST API v3 with intelligent caching |
| **Animations** | Custom CSS animations + Canvas confetti |
| **Typography** | Inter + Outfit + JetBrains Mono (Google Fonts) |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
campus-connect/
├── app/
│   ├── page.tsx                 # Landing / Login page
│   ├── layout.tsx               # Root layout (fonts, metadata)
│   ├── globals.css              # Design system, animations
│   ├── admin/
│   │   ├── layout.tsx           # Admin auth guard + sidebar
│   │   ├── page.tsx             # Admin dashboard (charts, KPIs)
│   │   ├── tasks/page.tsx       # Task CRUD manager
│   │   ├── submissions/page.tsx # Submission review queue
│   │   ├── analytics/page.tsx   # Deep analytics page
│   │   └── ambassadors/page.tsx # Ambassador directory
│   ├── dashboard/
│   │   ├── layout.tsx           # Ambassador auth guard + sidebar
│   │   ├── page.tsx             # Ambassador dashboard
│   │   ├── tasks/page.tsx       # Task board + submit proof
│   │   ├── submissions/page.tsx # Submission history
│   │   ├── leaderboard/page.tsx # Global leaderboard + podium
│   │   └── github/page.tsx      # GitHub Profile Analyzer
│   └── api/
│       ├── auth/login/          # POST login
│       ├── auth/register/       # POST register
│       ├── auth/me/             # GET current user
│       ├── tasks/               # GET/POST tasks
│       ├── tasks/[id]/          # GET/PUT/DELETE task
│       ├── submissions/         # GET all / POST submit
│       ├── submissions/[id]/    # PATCH approve/reject
│       ├── leaderboard/         # GET ranked ambassadors
│       ├── analytics/           # GET admin analytics
│       └── github/              # POST analyze GitHub profile
├── components/
│   ├── Sidebar.tsx              # Collapsible sidebar, role-based nav
│   ├── Toast.tsx                # Notification system + hook
│   └── Confetti.tsx             # Canvas-based confetti animation
└── lib/
    ├── auth.ts                  # JWT utilities, bcrypt
    ├── badges.ts                # Badge system definitions
    ├── github.ts                # GitHub API + caching + scoring
    └── store.ts                 # In-memory data store (demo mode)
```

---

## 🚀 Setup Instructions

### Option A: Quick Start (No Database Required)

The app runs in **demo mode** with an in-memory data store — no PostgreSQL needed!

```bash
# 1. Navigate to the project directory
cd "campus connect"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Option B: Full Setup with PostgreSQL

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL connection string

# 3. Start PostgreSQL and create database
createdb campus_connect

# 4. Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/campus_connect
JWT_SECRET=your_super_secret_key_here
GITHUB_TOKEN=ghp_xxxxx  # Optional: for higher GitHub API rate limits
NEXTAUTH_URL=http://localhost:3000
```

---

## 🎭 Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@campusconnect.com | password123 | Full admin dashboard |
| **Ambassador** | user@campusconnect.com | password123 | Ambassador portal |

> Click the **Quick Demo Access** buttons on the login page for instant auto-fill!

### Demo GitHub Profiles
Try these pre-cached GitHub usernames in the analyzer (no API calls needed):
- `torvalds` — Score: 98/100
- `mojombo` — Score: 82/100  
- `octocat` — Score: 71/100

---

## 🔌 API Routes

### Authentication
```
POST /api/auth/login      — Login with email + password
POST /api/auth/register   — Register new user
GET  /api/auth/me         — Get current user profile
```

### Tasks
```
GET    /api/tasks         — List all tasks (with submission status for ambassadors)
POST   /api/tasks         — Create task (admin only)
GET    /api/tasks/:id     — Get single task
PUT    /api/tasks/:id     — Update task (admin only)
DELETE /api/tasks/:id     — Delete task (admin only)
```

### Submissions
```
GET   /api/submissions       — List submissions (all for admin, own for ambassador)
POST  /api/submissions       — Submit proof for a task
PATCH /api/submissions/:id   — Approve or reject (admin only)
```

### Analytics & Data
```
GET  /api/leaderboard   — Ranked ambassador list
GET  /api/analytics     — Admin analytics data
POST /api/github        — Analyze GitHub profile
GET  /api/github?username=x — Get cached analysis
```

---

## 🗄️ Database Schema

### Users
```sql
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,
  role            VARCHAR(20) DEFAULT 'ambassador',  -- 'admin' | 'ambassador'
  github_username VARCHAR(100),
  github_score    INTEGER,
  points          INTEGER DEFAULT 0,
  badge           VARCHAR(20) DEFAULT 'none',        -- 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### Tasks
```sql
CREATE TABLE tasks (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  points           INTEGER NOT NULL,
  deadline         TIMESTAMP NOT NULL,
  required_keyword VARCHAR(100),          -- Optional: for auto-verification
  proof_type       VARCHAR(20) NOT NULL,  -- 'screenshot' | 'link' | 'file'
  created_by       INTEGER REFERENCES users(id),
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

### Submissions
```sql
CREATE TABLE submissions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  task_id       INTEGER REFERENCES tasks(id),
  proof         TEXT NOT NULL,
  proof_type    VARCHAR(20) NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  feedback      TEXT,
  approved_by   INTEGER REFERENCES users(id),
  auto_verified BOOLEAN DEFAULT FALSE,
  submitted_at  TIMESTAMP DEFAULT NOW(),
  reviewed_at   TIMESTAMP
);
```

---

## 🎮 Badge System

| Badge | Points Required | Icon |
|-------|----------------|------|
| Newcomer | 0 pts | 🌱 |
| Bronze Ambassador | 100+ pts | 🥉 |
| Silver Ambassador | 300+ pts | 🥈 |
| Gold Ambassador | 600+ pts | 🥇 |
| Platinum Ambassador | 1000+ pts | 💎 |

> **Badge unlock triggers confetti animation** 🎊

---

## ⚡ Auto-Verification Logic

When a task has a `required_keyword` set:

1. Ambassador submits a **link** as proof
2. System checks if the URL contains the keyword (case-insensitive)
3. If ✅ keyword found → **Auto-approved instantly**, points awarded
4. If ❌ not found → Flagged for **manual admin review**

Example: Task requires keyword `CampusConnect`, ambassador submits `https://linkedin.com/posts/CampusConnect-2024` → **Auto-verified!**

---

## 🔮 Future Improvements

| Feature | Priority |
|---------|----------|
| Email notifications for submission updates | High |
| Real-time WebSocket updates | High |
| File upload with S3/Cloudinary | High |
| Mobile app (React Native) | Medium |
| AI-powered submission quality scoring | Medium |
| Streak tracking & daily challenges | Medium |
| Slack/Discord integration | Low |
| Bulk task CSV import/export | Low |
| Advanced analytics with date range filters | Low |
| Custom badge/achievement creator | Low |

---

## 🏆 Built For

**Hackathon 2024** — Campus Ambassador Program Management Track

> Designed to maximize scores across: **Impact, Innovation, Technical Execution, UX, and Presentation**

---

*Made with ❤️ by the Campus Connect Team*
