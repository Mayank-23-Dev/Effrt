# ⚡ EFFRT
### *"Effort isn't a feeling. It's proof."*

**Domain:** effrt.tech
**Track:** EDU-04 — Group Projects Still Suck
**Event:** NYC CodeQuest 2026
**Type:** Solo Build | 8-Hour Hackathon Round

---

## 1. The Problem

Every group project has that one person. You know the one. Shows up to two meetings, does nothing, then messages "sorry guys deadline crept up on me 😭" the night before submission — and still gets the same grade/credit as everyone else who carried the thing.

Group accountability tools today are either:
- Glorified to-do lists with no enforcement (Trello, Notion)
- Corporate PM tools nobody actually opens (Jira, Asana)
- Purely self-reported — which means the slacker just lies

Nobody's built something that makes contribution **undeniable, visible, and impossible to fake**.

---

## 2. The Solution

**EFFRT** is a group project accountability tool that tracks *real* contribution — not vibes, not self-reports — and turns it into a live, unforgeable paper trail. Every task completed, every check-in made, every commit pushed becomes timestamped proof. At any point, anyone on the team (or the professor, or the judge) can pull up the trail and see exactly who did what.

No more he-said-she-said. No more "I contributed a lot actually." Just effort, tracked.

**Tagline:** *Effort isn't a feeling. It's proof.*

---

## 3. Core Features (8-Hour Build Scope)

### 3.1 Workspace & Team Setup
- Create a project workspace, generate a shareable invite code
- Teammates join via code — no complex auth, just name + code (Supabase for persistence)

### 3.2 The Task Ledger
- Kanban-style board (`To Do → In Progress → Done`) built with `dnd-kit` + shadcn `Card`
- Every task has an assignee, due date, and status
- Completing a task = generates a timestamped **proof entry** in the trail

### 3.3 The Proof Trail
- A live, scrolling audit feed (shadcn `Table` / activity feed) — every action taken by every member, timestamped
- Think "git commit log" but for human accountability: *"Mayank completed 'Design wireframes' — 2 hrs ago"*
- Can't be edited or deleted → this is the whole point. It's the paper trail.

### 3.4 The Effort Meter (Contribution Dashboard)
- shadcn `Chart` (radar or bar) comparing each member's:
  - Tasks completed vs. assigned
  - On-time completion %
  - Days since last activity
- Auto-generates a **"Ghost Alert"** badge (shadcn `Badge`, destructive variant) if someone's gone silent 48+ hrs
- This is the visual gut-punch moment in the demo — judges see imbalance instantly

### 3.5 Daily Standup Digest (AI Stretch Feature)
- Each member drops a 1-line "what I did today" text
- Groq/Claude API summarizes the whole team's updates into a digest
- If someone skips 2+ days in a row → auto-flags them on the Effort Meter

### 3.6 The Final Report (Submission Killer Feature)
- One-click export: generates a clean summary page/PDF showing exact per-member contribution %
- Literally the proof you hand your professor when someone tries to claim credit they didn't earn

---

## 4. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TypeScript |
| UI Library | **shadcn/ui** + Tailwind CSS |
| Components | `Table`, `Card`, `Dialog`, `Tabs`, `Chart` (recharts), `Avatar`, `Badge`, `Progress`, `Sheet` |
| Drag & Drop | `dnd-kit` |
| Backend / DB | Supabase (Postgres + Realtime + Auth) |
| AI | Groq API (fast inference for standup digest) |
| Hosting | Vercel |
| Domain | effrt.tech |
| Realtime sync | Supabase Realtime channels (so the Proof Trail updates live across all members) |

---

## 5. Data Model (Supabase)

```
workspaces
├── id, name, invite_code, created_at

members
├── id, workspace_id, name, joined_at

tasks
├── id, workspace_id, title, assignee_id, status, due_date, completed_at

proof_trail (immutable log)
├── id, workspace_id, member_id, action_type, task_id, timestamp

standups
├── id, workspace_id, member_id, content, date
```

---

## 6. 8-Hour Build Plan

| Hour | Focus |
|---|---|
| 1 | Supabase schema setup + Vite/shadcn scaffold + auth-lite (name + invite code) |
| 2–3 | Task Ledger (Kanban board, CRUD, dnd-kit drag/drop) |
| 4 | Proof Trail (immutable log, realtime updates) |
| 5 | Effort Meter dashboard (charts, Ghost Alert logic) |
| 6 | AI Standup Digest (Groq integration) |
| 7 | Final Report export + UI polish pass (this is where shadcn + your aesthetic sense wins points) |
| 8 | Demo video, README, deploy, buffer for bugs |

---

## 7. Why This Wins on the Scorecard

| Criteria | How Effrt Delivers |
|---|---|
| Innovation & Creativity (20) | Reframes accountability as an unforgeable "proof trail" — not another to-do app |
| Technical Implementation (20) | Realtime sync, immutable logging, AI summarization — real engineering, not a wrapper |
| UI/UX (15) | Clean shadcn dashboard, dark theme, Ghost Alert badges — visually sharp and scannable |
| Functionality & Performance (15) | Fully demoable end-to-end in under 60 seconds: add task → complete it → see proof → see chart shift |
| Presentation (10) | Strong narrative hook ("effort isn't a feeling, it's proof") — memorable, judge-friendly pitch |
| Social Media Impact (15) | Relatable pain point everyone's experienced — high shareability |
| Documentation (5) | README + this doc covers setup and rationale clearly |

---

## 8. Demo Script (60 seconds)

1. Create workspace "CS 4820 Final Project" — share invite code
2. Two "members" join (pre-seeded for demo speed)
3. Assign 3 tasks, complete 2 as Member A, 0 as Member B
4. Show Proof Trail populating live
5. Flip to Effort Meter → Member B's Ghost Alert lights up red
6. Click "Generate Final Report" → clean exportable proof
7. Close with the tagline: *"Effort isn't a feeling. It's proof."*

---

## 9. Stretch Goals (If Time Remains)
- GitHub commit integration (pull real commit counts per member)
- Slack/Discord webhook notifications for Ghost Alerts
- "Effort streak" gamification — members get a badge for consistent daily contribution