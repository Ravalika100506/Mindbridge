# 🧠 MindBridge v3.0 — Digital Mental Health Platform for Students

> A comprehensive MERN stack mental wellness system featuring AI companion, NLP emotion detection, anonymous peer chat, gamification hub, voice mood analysis, crisis detection, counselor booking, personalized routines, and much more.

---

## ✅ Complete Feature Matrix

### Core Features
| # | Feature | Route | Status |
|---|---|---|---|
| 1 | JWT Authentication (Student / Counselor / Admin roles) | `/login`, `/register` | ✅ |
| 2 | Mood Tracker — emoji, tags, sleep, exercise, symptoms | `/mood` | ✅ |
| 3 | AI Companion "Mira" (Groq LLaMA 3.3-70B, CBT/DBT aware) | `/chat` | ✅ |
| 4 | Smart Journal (Free write, Gratitude, CBT, Vent, Daily Reflection) | `/journal` | ✅ |
| 5 | Breathing & Meditation Tools (5 techniques + animations) | `/breathe` | ✅ |
| 6 | Anonymous Peer Community (vent wall + reactions + replies) | `/community` | ✅ |
| 7 | Self-Help Resource Library with **Search** | `/resources` | ✅ |
| 8 | **Daily Mindfulness Tips** in Resources | `/resources` | ✅ |
| 9 | Crisis Detection (keyword-based NLP on mood, journal, chat) | backend | ✅ |
| 10 | Emergency SOS Button (alerts counselors via Socket.IO) | `/crisis` | ✅ |
| 11 | Indian Crisis Helplines (iCall, Vandrevala, NIMHANS, Snehi) | `/crisis`, `/resources` | ✅ |
| 12 | Wellness Goal Tracker (daily/weekly/monthly goals) | `/wellness` | ✅ |
| 13 | Academic Event Tracker (exam/assignment stress correlation) | `/wellness` | ✅ |
| 14 | User Profile & Emergency Contact | `/profile` | ✅ |

### Advanced Features (v2.0)
| # | Feature | Route | Status |
|---|---|---|---|
| 15 | **📊 Analytics Dashboard** — mood trends, sleep chart, academic load scatter, tag analysis | `/analytics` | ✅ |
| 16 | **🎙️ Voice Mood Analysis** — Web Speech API, emotion detection, auto mood log | `/voice` | ✅ |
| 17 | **📈 Academic Stress Predictor** — AI risk forecast from deadlines + wellness data | `/stress` | ✅ |
| 18 | **👩‍⚕️ Counselor Booking System** — browse counselors, slots, chat/video/in-person | `/appointments` | ✅ |
| 19 | **🗓️ Smart Routine Planner** — AI-generated personalized daily schedule | `/routine` | ✅ |
| 20 | **🎯 Recommendation Engine** — AI-curated activities, resources, exercises, weekly challenge | `/recommendations` | ✅ |
| 21 | **🔔 Smart Notification System** — reminders, badges, streak alerts, appointment updates | `/notifications` | ✅ |
| 22 | **🛡️ Admin/Counselor Dashboard** — manage crisis alerts, confirm/deny appointments | `/admin` | ✅ |
| 23 | **AI Journal Analysis** — themes, insight, coping strategies, follow-up question | `/journal` | ✅ |
| 24 | **Real-time Socket.IO** — live SOS alerts to online counselors, notification push | backend | ✅ |
| 25 | **Notification Cron Jobs** — automated mood reminders, meditation alerts, break timers | backend | ✅ |
| 26 | **Sentiment Analysis** — built-in NLP on all journal and mood notes | backend | ✅ |

### 🆕 New Features (v3.0)
| # | Feature | Route | Status |
|---|---|---|---|
| 27 | **🧠 NLP Emotion Detection** — Groq AI analyzes free-text input, returns primary emotion, breakdown chart, themes, coping strategies | `/emotion` | ✅ NEW |
| 28 | **💬 Anonymous Peer Chat** — Real-time Socket.IO chat rooms (General, Anxiety, Academics, Loneliness, Motivation, Wins), fully anonymized identities | `/peer-chat` | ✅ NEW |
| 29 | **🏆 Gamification Hub** — Full badge catalog (16 badges), XP leaderboard, level journey map, XP earning guide, streak tracking | `/gamification` | ✅ NEW |

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (7-day tokens), bcrypt password hashing |
| Real-time | Socket.IO |
| AI | Groq API — LLaMA 3.3-70B (free tier available) |
| NLP | `sentiment` npm package + custom keyword detection |
| Scheduling | `node-cron` for smart notification jobs |
| Voice | Web Speech Recognition API (browser-native, no cost) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://mongodb.com/atlas))
- Free Groq API key at [console.groq.com](https://console.groq.com)

### Installation

```bash
# 1. Extract project
cd mindbridge

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env:
#   MONGODB_URI=mongodb://localhost:27017/mindbridge
#   GROQ_API_KEY=your_key_here
#   JWT_SECRET=any_random_string

# 4. Start backend
cd backend && npm run dev      # port 5000

# 5. Start frontend (new terminal)
cd frontend && npm run dev     # port 5173
```

### Access
- **App:** http://localhost:5173
- **API:** http://localhost:5000/api/health

---

## 🗂️ Project Structure

```
mindbridge/
├── backend/
│   ├── config/crisisDetection.js      # Keyword NLP + sentiment scoring
│   ├── jobs/notificationCron.js       # Smart scheduled notifications [NEW]
│   ├── middleware/auth.js             # JWT + role guards
│   ├── models/
│   │   ├── User.js                    # Gamification, wellness, emergency contact
│   │   ├── Mood.js                    # Mood with academic context + sentiment
│   │   ├── Journal.js                 # CBT/gratitude/AI analysis fields
│   │   ├── Community.js               # Posts, CrisisAlerts, Goals, BreathingSessions, AcademicEvents
│   │   ├── Appointment.js             # Counselor booking [NEW]
│   │   └── Notification.js            # In-app notifications [NEW]
│   ├── routes/
│   │   ├── auth.js                    # Register, login, profile
│   │   ├── mood.js                    # CRUD + analytics
│   │   ├── journal.js                 # CRUD + crisis detection
│   │   ├── ai.js                      # Chat, journal analysis, stress predictor, routine planner [+], recommendations [NEW]
│   │   ├── community.js               # Posts, reactions, replies
│   │   ├── crisis.js                  # SOS + alert management
│   │   ├── wellness.js                # Goals, breathing, events, leaderboard
│   │   ├── resources.js               # Static resource library
│   │   ├── appointments.js            # Counselor booking [NEW]
│   │   └── notifications.js           # In-app notifications [NEW]
│   ├── socket/handler.js              # Real-time events + SOS broadcast [UPDATED]
│   └── server.js                      # Express entry point [UPDATED]
│
└── frontend/src/
    ├── pages/
    │   ├── Landing.jsx                # Feature showcase [UPDATED]
    │   ├── Dashboard.jsx              # Overview + quick actions
    │   ├── MoodTracker.jsx            # Mood input
    │   ├── VoiceMood.jsx              # 🎙️ Voice mood analysis [NEW]
    │   ├── Journal.jsx                # Journal editor + AI
    │   ├── Breathe.jsx                # Breathing techniques
    │   ├── AIChat.jsx                 # AI companion Mira
    │   ├── Community.jsx              # Peer support wall
    │   ├── Resources.jsx              # Resource library + Search [UPDATED]
    │   ├── Crisis.jsx                 # SOS + helplines
    │   ├── Wellness.jsx               # Goals + gamification
    │   ├── Profile.jsx                # User profile
    │   ├── Analytics.jsx              # 📊 Analytics dashboard [NEW]
    │   ├── StressPredictor.jsx        # 📈 Stress predictor UI [NEW]
    │   ├── Appointments.jsx           # 👩‍⚕️ Counselor booking [NEW]
    │   ├── RoutinePlanner.jsx         # 🗓️ AI routine planner [NEW]
    │   ├── Recommendations.jsx        # 🎯 AI recommendations [NEW]
    │   ├── Notifications.jsx          # 🔔 Notification center [NEW]
    │   └── AdminDashboard.jsx         # 🛡️ Admin/counselor panel [NEW]
    └── components/common/
        └── Layout.jsx                 # Grouped sidebar nav + notif badge [UPDATED]
```

---

## 🔐 Role System

| Role | Access |
|---|---|
| `student` | All personal features — mood, journal, chat, community, appointments (book) |
| `counselor` | All student features + Admin Dashboard (manage their appointments + view active crisis alerts) |
| `admin` | Full access — all crisis alerts, all appointments, user management |

To create a counselor/admin account, register normally then update the `role` field in MongoDB directly, or extend the auth route.

---

## ⚠️ Limitations

- Not a replacement for professional therapy
- Voice mood analysis requires Chrome/Edge (Web Speech API)
- AI responses are supportive, not clinical diagnoses
- Crisis detection is keyword-based — not 100% accurate
- Notification cron jobs require the backend server to be running

## 🔮 Future Enhancements

- Face emotion detection via webcam
- Mobile app (React Native)
- WhatsApp/SMS notifications via Twilio
- Wearable device data integration
- Multi-language support (Hindi, Telugu, Tamil)
- Group therapy session scheduling

---

## 🔧 Bug Fixes Applied (v3.0.1)

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `frontend/src/pages/PeerChat.jsx:198` | Unescaped apostrophe in single-quoted JS string `'It's OK to vent'` caused esbuild crash | Changed to double-quoted string `"It's OK to vent"` |
| 2 | `frontend/package.json` | Missing `"start"` script — `npm start` failed | Added `"start": "vite"` to scripts |
