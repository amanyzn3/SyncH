# 🚀 Synhub — Enterprise Project & Task Management Platform

**Synhub** is a full-stack enterprise project management and productivity platform that unifies Jira-style Kanban project tracking, Microsoft To Do-style personal daily habit management, real-time Team Chat with manager task assignment, and a Google Gemini 1.5 AI Copilot.

---

## 🌟 Key Features & Capabilities

### 1. 🛡️ Role-Based Access Control (RBAC) & Security
- **Manager Privileges (`alex@synhub.com`)**:
  - Exclusive authority to create and assign project tasks across team members.
  - One-tap **Team Chat to Task conversion**.
  - Access to the **Manager Executive Dashboard** and **Technical Blocker / Quality Control Resolution**.
- **Employee Privileges (`sarah@synhub.com`, `mike@synhub.com`, `emma@synhub.com`)**:
  - Focuses strictly on assigned project deliverables.
  - Can **only edit their own assigned tasks** (teammates' tasks open in read-only lock state).
  - Private **Personal Habits & Growth Hub** with AI habit coaching.
  - Ability to report technical blockers to management.

---

### 2. 💬 Integrated Team Chat & Manager One-Tap Task Creation
- **Project Discussion Streams**: Real-time project chat available alongside the Kanban board and via the top Navigation Bar.
- **Click-to-Open Icon Toggle**: The chat panel collapses by default so the Kanban board occupies 100% screen width, opening smoothly only when the chat icon is clicked.
- **Manager-Only One-Tap Task Conversion**: Managers see a **"Turn into Task"** button next to any chat message.
- **Smart Conversational Parser**: Automatically strips conversational prefixes (*"Hey team, let us..."*, *"Working on..."*) to produce precise task titles and structured work descriptions.
- **Instant System Auto-Updates**: Task status changes automatically post background system messages in the project chat.
- **Employee Bell Notifications**: Assigning a task alerts the assigned employee in their top Bell dropdown menu.

---

### 3. 📊 Manager Executive Command Center
- **Projects & Team Workload Status Inspector**: Default expanded view displaying milestone progress bars, team member avatar stacks, and real-time deliverable statuses (*To Do*, *In Progress*, *Done*, *Issue Reported*) for every employee.
- **Task Errors & Quality Control**: Dedicated panel listing technical blockers reported by employees with one-click **Resolve Blocker** QA action.
- **AI Executive Briefing**: Generates instant natural-language team progress summaries.

---

### 4. 🌿 Microsoft To Do Style Personal Habits & Growth Hub
- Completely separate from company project deliverables.
- Features *My Day*, *Important ⭐*, *Planned 📅*, and *Habits & Learning 🌿* tabs.
- Includes an **AI Habit Coach & Motivator** that analyzes daily streaks and generates personalized wellness encouragement.

---

### 5. 🤖 Google Gemini 1.5 API Integration & AI Assistant
- Connected to **Google Gemini 1.5 Flash API** (`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest`).
- Answers plain-English task queries (*"What's due today?"*, *"What's my next task?"*, *"Give me today's team update"*).
- Executes live status mutations (*"Mark Fix auth bug as Done"*).
- Features automatic multi-model fallback (`gemini-flash-latest`, `gemini-3.7-flash`, `gemini-pro-latest`) and an offline local NLP engine fallback.

---

## 🔐 Default Login Credentials

| Role | Name | Email | Password | Default View |
| :--- | :--- | :--- | :--- | :--- |
| **Manager** | Alex Vance | `alex@synhub.com` | `password123` | Manager Executive Dashboard |
| **Employee** | Sarah Jenkins | `sarah@synhub.com` | `password123` | Employee Dashboard |
| **Employee** | Mike Chen | `mike@synhub.com` | `password123` | Employee Dashboard |
| **Employee** | Emma Watson | `emma@synhub.com` | `password123` | Employee Dashboard |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (Design Tokens, Dark Mode Slate Palette `#0b0f17`, Emerald Accents `#10b981`).
- **Backend**: Node.js, Express.js REST API.
- **Database**: JSON File Persistence (`server/data.json`) with safe atomic load/save operations.
- **AI Engine**: Google Gemini 1.5 REST API with custom system context injection.

---

## 🌐 REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/users` | List system user profiles |
| `POST` | `/api/auth/login` | Authenticate user profile |
| `GET` | `/api/tasks` | Fetch filtered deliverables |
| `POST` | `/api/tasks` | Create deliverable (Manager-only for projects) |
| `PATCH` | `/api/tasks/:id/status` | Update task status & post chat auto-notice |
| `PATCH` | `/api/tasks/:id/report-error` | Report technical blocker |
| `PATCH` | `/api/tasks/:id/resolve-error` | Resolve technical blocker (Manager) |
| `GET` | `/api/projects` | List projects with milestone stats |
| `POST` | `/api/projects` | Create a new project workspace |
| `GET` | `/api/chat/:projectId` | Fetch project chat messages |
| `POST` | `/api/chat/:projectId` | Send team chat message |
| `GET` | `/api/personal` | Fetch user's private personal goals |
| `POST` | `/api/personal/motivate` | AI Habit Coach motivation generator |
| `POST` | `/api/ai/chat` | AI Copilot natural language processing |
| `POST` | `/api/settings` | Save Gemini API key settings |

---

## ⚡ Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/amanyzn3/SyncH.git
cd SyncH
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Run Development Server
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser!

---

## 📁 Repository Information

- **GitHub Repository**: [https://github.com/amanyzn3/SyncH](https://github.com/amanyzn3/SyncH)
- **Maintainer**: `@amanyzn3`
