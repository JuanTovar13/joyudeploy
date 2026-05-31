# JOYU — Student Wellness App

JOYU is a web application built for university students to support their emotional and academic well-being. It connects students with psychological services, helps them stay on top of their study sessions, tracks their mood over time, and recommends wellness activities based on weekly check-ins — all powered in part by AI.

---

## Features

### Students

#### Home
- **Weekly check-in** — 5-question emotional check-in with support for custom free-text answers.
- **AI recommendation** — after completing the check-in, Groq generates a personalized motivational message and recommends 3 wellness activities from the university catalogue.
- **Quote card** — displays the recommendation with activity badges.
- **Weekly calendar** — shows class schedule and confirmed psychology appointments side by side, including mode (virtual / in-person).
- **Activities banner** — previews upcoming activities with a link to the full catalogue.
- **Actions row** — quick access to appointment scheduling, appointment history, and the Study Toolkit.
- **Mood analytics** — weekly and monthly mood charts built from check-in history.

#### Activities
- Full catalogue of university wellness activities grouped by section (Cultura → Deportes → Otros) and ordered by category (Artes Plásticas, Artes Musicales, Deportes Individuales, Deportes de Conjunto).
- Tap any card to see activity details (description, schedule).

#### Appointments
- Request a psychology appointment (reason + in-person or virtual mode).
- View pending and confirmed appointments, each with date, time, professional name, and mode.
- Cancel any appointment directly from the list.

#### Study Toolkit
- **Pomodoro timer** — standard 25-min work / 5-min break cycle with skip and reset.
- **Countdown timer** — set any duration, plays an alarm when it ends.
- **Stopwatch** — free-running timer.
- **Task list** — synced with Supabase in real time; add tasks with a pomodoro goal, track progress via checkbox (supports multi-pomodoro tasks), delete tasks.
- **Concentration bar** — visual indicator of today's completed vs. goal pomodoros.
- **Study Music** — rotating weekly playlist of YouTube study streams with a hide-video toggle (audio keeps playing).
- **Mini Journal** — quick notes panel for the current session.
- **AI Study Coach** — on-demand analysis of today's study session via Groq:
  - Current state snapshot
  - Positive reinforcement
  - Attention point
  - One concrete next action
  - Automatically prompts when the student skips the work session 2+ times in a row.
- All today-counters (sessions, focus minutes, pomodoros) persist across page reloads and reset automatically at midnight.

### Psychologists
- **Dashboard** — list of pending appointment requests from students.
- **Appointment scheduler** — assign date, time (hourly slots), and confirm mode; hours that conflict with the student's class schedule or existing appointments are disabled automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Routing | React Router v7 (all routes are lazy-loaded) |
| State management | Redux Toolkit + React-Redux |
| Auth | Firebase Authentication |
| Database | Supabase (PostgreSQL + Realtime) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Styling | Plain CSS with Fredoka font (no CSS framework) |

---

## Project Structure

```
src/
├── assets/                   # Fonts, SVGs, images
├── components/
│   ├── ui/                   # Shared reusable primitives
│   │   ├── BackButton.tsx
│   │   ├── FormMessage.tsx   # error / success / warning inline messages
│   │   ├── ModeBadge.tsx     # Virtual / In-person pill badge
│   │   └── TabBar.tsx
│   ├── estudiante/           # Student-facing components
│   │   ├── Form/
│   │   │   └── CheckInForm.tsx
│   │   ├── ActionsRow.tsx
│   │   ├── ActivitiesBanner.tsx
│   │   ├── ActivitiesCard.tsx
│   │   ├── ActivityDetailModal.tsx
│   │   ├── CheckInCard.tsx
│   │   ├── CountdownTimerDisplay.tsx
│   │   ├── HomeHeader.tsx
│   │   ├── MiniJournal.tsx
│   │   ├── MonthlyMoodChart.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── PendingAppointmentCard.tsx
│   │   ├── PomodoroTimer.tsx
│   │   ├── QuoteCard.tsx
│   │   ├── ScheduledAppointmentCard.tsx
│   │   ├── StopwatchDisplay.tsx
│   │   ├── StudyCoach.tsx
│   │   ├── TaskList.tsx
│   │   ├── WeeklyCalendar.tsx
│   │   └── WeeklyMoodChart.tsx
│   └── psicologo/            # Psychologist-facing components
│       ├── CalendarWidget.tsx
│       ├── DayPanel.tsx
│       └── RequestCard.tsx
├── context/
│   └── AuthContext.tsx        # Firebase auth + Supabase role resolution
├── data/
│   └── classSchedule.ts       # Static class schedule + conflict detection helpers
├── hooks/
│   ├── useAlarmSound.ts
│   ├── useCountdownTimer.ts
│   ├── usePomodoro.ts
│   └── useStopwatch.ts
├── lib/
│   ├── groqCoach.ts           # AI Study Coach — getStudyAnalysis()
│   ├── groqRecommendations.ts # Check-in AI — getRecommendation()
│   ├── supabaseClient.ts
│   ├── randomUserClient.ts    # Psychologist avatar photos
│   ├── dateUtils.ts
│   └── emotionConfig.ts
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Home.tsx
│   ├── ActivitiesPage.tsx
│   ├── AppointmentsList.tsx
│   ├── ScheduleAppointment.tsx
│   ├── StudyPlanner.tsx
│   └── PsychologistDashboard.tsx
├── store/
│   └── slices/
│       ├── activitiesSlice.ts
│       ├── appointmentsSlice.ts
│       ├── authSlice.ts
│       ├── calendarSlice.ts
│       ├── recommendationSlice.ts
│       └── studyPlannerSlice.ts
├── styles/                    # One CSS file per component / page + ui.css
├── types/                     # Shared TypeScript types
└── utils/
    ├── ProtectedRoute.tsx
    └── RoleRoute.tsx          # Redirects based on Firebase + Supabase role
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com/) project with **Email/Password** authentication enabled
- A [Supabase](https://supabase.com/) project
- A [Groq](https://console.groq.com/) API key

### Environment Variables

Create a `.env` file at the project root (never commit this file):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

VITE_GROQ_API_KEY=your_groq_api_key
```

### Install and Run

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Database Schema (Supabase)

| Table | Key Columns |
|---|---|
| `profiles` | `uid`, `role` (`student` \| `psychologist`) |
| `appointments` | `user_id`, `student_name`, `reason`, `mode`, `status` (`pending` \| `scheduled`), `date`, `hour`, `professional_name` |
| `activities` | `title`, `category`, `description`, `image` |
| `activity_schedules` | `activity_id`, `day`, `start_time`, `end_time` |
| `study_tasks` | `user_id`, `title`, `completed`, `estimated_pomodoros`, `completed_pomodoros` |
| `mood_entries` | `user_id`, `emotion`, `created_at` |

---

## AI Features

### Check-in Recommendation (`groqRecommendations.ts`)

After completing the 5-question emotional check-in, the student's answers are sent to Groq along with the full list of university activities. The model returns:

- A short, warm motivational sentence (≤ 20 words).
- 3 recommended activities chosen from the catalogue.

### Study Coach Analysis (`groqCoach.ts`)

Available on demand in the Study Toolkit, or triggered automatically when the student skips the Pomodoro work session 2 or more times in a row. The model receives today's study stats and returns a structured 4-part analysis:

| Field | Description |
|---|---|
| `diagnosis` | 1–2 honest sentences about the student's current state |
| `highlight` | One specific thing they are doing well |
| `alert` | One thing that needs attention (or positive note if all good) |
| `next_action` | One concrete, specific action to take right now |

---

## Performance

The production build uses **manual chunk splitting** so vendor libraries are cached independently from app code:

| Chunk | Contents | Gzipped |
|---|---|---|
| `vendor-react` | React, ReactDOM, React Router | ~74 KB |
| `vendor-supabase` | All `@supabase/*` packages | ~50 KB |
| `vendor-firebase` | All `firebase/*` and `@firebase/*` packages | ~33 KB |
| `vendor-redux` | Redux Toolkit, React-Redux | ~9 KB |
| `index` | App bootstrap + shared utilities | ~6 KB |

App-specific pages and components are code-split via `React.lazy` and only loaded on demand.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
