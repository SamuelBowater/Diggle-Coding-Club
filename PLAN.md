# Diggle Coding Club — Build & Curriculum Plan

## 1. Constraints

- **Devices:** 1 iPad per student.
- **Python execution:** In-browser via **Pyodide** (Web Worker). No server runtime — safe, free on Vercel.
- **Login:** Class join code -> pick display name + avatar -> thereafter tap your face from a grid. No passwords, no email (COPPA/GDPR-friendly).
- **Format:** 8 weekly sessions, 45 min, ages 9-11, near-zero experience.
- **Hosting:** Vercel (app) + Neon (Postgres).

### iPad realities to design around

- Typing Python punctuation (`:` `()` `"` `_` `#`) on the on-screen keyboard is slow.
  Mitigation: a docked **symbol bar** above the editor with that week's characters; **fill-in-the-blank / drag-block** challenges for weeks 1-3, free typing later.
- Pyodide first load is ~6-10 MB WASM. Mitigation: preload on the name-grid screen; cache with a service worker.
- Safari tab suspension / accidental swipes lose state. Mitigation: autosave code + progress to server every few seconds and on blur.
- No hover. Tap-first, big hit targets.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) on Vercel | SSR + API routes in one deploy |
| DB | Neon Postgres + Drizzle ORM | serverless-friendly, typed migrations |
| Python | Pyodide in a Web Worker | keeps UI responsive |
| Editor | CodeMirror 6 | light, good touch support |
| Styling | Tailwind + a little Framer Motion | fast, playful |
| Realtime (teacher view) | short polling (3-5s) for v1; Pusher/Ably later | see who's stuck live |
| Auth | custom: signed httpOnly cookie with `studentId`; teacher password via env/hash | no NextAuth needed |

## 3. Data model (Neon)

```
classes         id, name, join_code, current_lesson, created_at
students        id, class_id, display_name, avatar_key, xp, level, streak, created_at, last_seen
lessons         id, slug, week_no, title, intro_md, order
steps           id, lesson_id, order, type('teach'|'quiz'|'code'|'predict'|'debug'|'turtle'),
                title, content_md, starter_code, solution_code, tests_json, hints_json, xp_reward
progress        id, student_id, step_id, status('locked'|'seen'|'attempted'|'complete'),
                attempts, code_submitted, completed_at
badges          id, key, name, description, icon
student_badges  student_id, badge_id, awarded_at
events          id, class_id, student_id, type, payload_json, created_at   (teacher feed + analytics)
```

## 4. Auth / session flow

1. Teacher creates a class in admin -> gets a 4-word join code (e.g. `blue-otter-lamp-7`) and a projector URL.
2. Student first time: club URL -> enter join code -> pick name + avatar from a grid -> row created, `studentId` in signed httpOnly cookie (1 year).
3. Student returning: club URL detects class -> shows avatar grid -> tap face -> cookie set -> into current lesson.
4. Teacher admin behind a real password (env var or `teachers` row with hash).
5. Mischief guards: name/avatar locked after session 1 unless teacher unlocks; teacher can merge/rename/delete students.

## 5. Gamification

Core loop: each lesson = 5-9 **steps**. Completing a step -> XP burst animation + progress bar fills. Enough XP -> **level up** (full-screen celebration, avatar accessory unlock).

- **XP:** quiz right first try 20, after hint 10; code challenge passes tests 30-50; predict-the-output correct 15.
- **Levels:** 1-20 with names (Byte -> Bug Hunter -> Loop Wizard -> ...). Rank shown by avatar.
- **Badges:** First Program, Bug Squasher, Speed Demon, Helper (teacher-awarded), Perfect Week, 7-day streak.
- **Avatar shop:** spend XP on cosmetic hats/pets/colours.
- **Class goal bar:** collective XP fills a class thermometer on the projector -> unlocks a group reward. Cooperative, not just competitive.
- **Leaderboard:** weekly top 3 + everyone-who-finished list (avoids demotivating slower kids). Configurable.
- **Anti-frustration:** every code step has 2-3 progressive hints then a "show me" for reduced XP.

## 6. Screens

**Student**
- Join / avatar grid
- Lesson player: left = lesson content (synced to projector, or free-roam toggle); right = editor + Run + output + symbol bar; step tracker on top; XP bar + avatar bottom corner.
- Celebration overlays (level up, badge).
- Trophy room / my progress.

**Projector (teacher main screen)**
- Big current step content, class XP thermometer, live "students on this step" dots, join code + QR.

**Teacher console**
- Create/manage class + students.
- Live dashboard: student grid colour-coded (green done / amber attempting / red stuck / grey idle), current step, last-seen; click to view their code.
- Advance/lock lesson, award badges, reset a step, export progress CSV.
- v1: lesson content edited as MDX files in the repo.

## 7. Curriculum — 8 weeks

45 min approx = 5 min recap/celebrate + 30 min guided steps + 10 min free challenge.

| Wk | Title | Concepts | End-of-session challenge |
|---|---|---|---|
| 1 | Hello, Python! | `print()`, strings, running code, comments | Computer introduces itself + ASCII art |
| 2 | Variables & the computer's memory | variables, `input()`, string `+`, `f""` | Mad-libs story generator |
| 3 | Numbers & maths | int vs str, `+ - * / // %`, `int()` | Pocket-money calculator / age in days |
| 4 | Making choices | `if / elif / else`, comparisons, booleans | Choose-your-own-adventure branch |
| 5 | Loops | `for`, `range()`, `while`, totals | Times-table printer, countdown launch |
| 6 | Lists | make/index/append, loop, `len()` | Random team picker / dice stats |
| 7 | Functions | `def`, parameters, `return`, reuse | Joke machine with `tell_joke()` |
| 8 | Mini-project + showcase | combine everything | Number-guess / quiz / chatbot; demo to class |

Content stored as MDX in `content/lessons/weekN/`; each step a frontmatter block with `type`, `xp`, `tests`. Code-step tests = Python assertions or stdout match run in Pyodide.

Optional extras if time allows: turtle graphics creative step each week; "debug this" broken-code steps; toggleable sound effects; printable certificates at week 8.

## 8. Build phases

1. Scaffold — Next.js + Tailwind + Drizzle + Neon connection; deploy skeleton to Vercel.
2. Schema + migrations; seed demo class + lesson 1.
3. Auth flow — join code, avatar grid, cookie session, teacher password.
4. Pyodide worker + CodeMirror editor + symbol bar + Run/output; service-worker cache.
5. Lesson player + MDX step loader + progress persistence + autosave.
6. Gamification — XP/level/badge engine, celebrations, trophy room, class thermometer.
7. Projector screen + teacher live dashboard (polling).
8. Author all 8 weeks of content + tests; playtest on a real iPad.
9. Polish — offline resilience, error states, CSV export, certificates.

## 9. Open choices

- Leaderboard: top-3 + finishers list (recommended) / full ranking / none.
- Realtime teacher dashboard: polling (zero infra) vs Pusher/Ably.
- Lesson content: MDX-in-repo for v1 (fast) vs in-app editor now.
