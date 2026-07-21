<div align="center">
  
<br />

# Whispr-AI

### AI-Powered Anonymous Messaging Platform

<p align="center">
  <em>Anonymous conversations reinvented with AI.</em>
</p>

<br />

<!-- Badges -->
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-F54F3C?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg?style=for-the-badge)](LICENSE)

<br />

[![Stars](https://img.shields.io/github/stars/abhikhokhar/whispr?style=social)](https://github.com/abhikhokhar/whispr/stargazers)
[![Forks](https://img.shields.io/github/forks/abhikhokhar/whispr?style=social)](https://github.com/abhikhokhar/whispr/network/members)
[![Issues](https://img.shields.io/github/issues/abhikhokhar/whispr?color=6366f1)](https://github.com/abhikhokhar/whispr/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ec4899.svg)](CONTRIBUTING.md)

<br />

---

</div>

---

## 🌌 About

**Whispr** is a next-generation anonymous social messaging platform that empowers anyone to send anonymous messages or start real-time anonymous conversations with registered users — without ever compromising identity.

Unlike traditional anonymous messaging tools, Whispr integrates **Groq AI** to generate mood-based message suggestions, making every anonymous conversation more thoughtful, expressive, and engaging.

> Built with a privacy-first mindset, a futuristic dark UI, and a production-grade backend — Whispr isn't just a messaging app, it's an experience.

<br />

<div align="center">

| 🔒 Privacy First | ✨ AI-Assisted | ⚡ Real-time | 🎨 Modern UI |
|:---:|:---:|:---:|:---:|
| Complete anonymity for visitors | Mood-based AI message suggestions | Socket.io powered live chat | Glassmorphism dark aesthetic |

</div>

---

## 📸 Screenshots

<details open>
<summary><strong>Click to view screenshots</strong></summary>

<br />

### 🏠 Landing / Profile Page
> *The public profile page that anonymous visitors land on*

```
```
<img width="1908" height="892" alt="image" src="https://github.com/user-attachments/assets/ce2d203e-13a0-4ed5-afff-77f2c2eaafdd" />
 
```
```

---

### 🔐 Authentication

```
```
<img width="1912" height="892" alt="image" src="https://github.com/user-attachments/assets/a24cf700-d345-4eae-8c64-1660ee472e5f" />
<img width="1907" height="893" alt="image" src="https://github.com/user-attachments/assets/e88477c5-4c47-4dde-8fd6-cdf94c3f167f" />

---
<img width="1882" height="876" alt="image" src="https://github.com/user-attachments/assets/1b8a52da-0dbb-490d-96d9-8b6ade6e3124" />


### 📊 Dashboard
```
```
<img width="1897" height="857" alt="image" src="https://github.com/user-attachments/assets/a8c618d7-f28e-4952-a2a4-20d55908b6c8" />
```
```


### 💌 Anonymous Messaging
```

```
<img width="1708" height="833" alt="image" src="https://github.com/user-attachments/assets/fe267178-0609-4660-b749-2cb3f1251f2e" />
<img width="1911" height="842" alt="image" src="https://github.com/user-attachments/assets/c32c7cf9-159e-4b60-bb36-2f1ed31fdb00" />

```
---

### 🤖 AI Message Suggestions

```

<img width="718" height="626" alt="image" src="https://github.com/user-attachments/assets/e0beb125-bd92-4eaf-869a-bb50357de272" />

```

---

### 💬 Anonymous Chat

```
<img width="1918" height="845" alt="image" src="https://github.com/user-attachments/assets/0fd6b2a1-9b3f-4067-bc5b-e1404516a23a" />

```

---
```



## ✨ Features

<details open>
<summary><strong>🔐 Authentication & Security</strong></summary>

<br />

- ✅ **NextAuth.js** — Secure credential-based authentication
- ✅ **JWT Sessions** — Stateless, secure session management
- ✅ **Protected Routes** — Middleware-level route protection
- ✅ **OTP Email Verification** — Powered by [Resend](https://resend.com)
- ✅ **Beautiful Email Templates** — Custom verification emails
- ✅ **Verification-gated Login** — Users must verify before accessing the platform
- ✅ **bcrypt Password Hashing** — Industry-standard password security
- ✅ **MongoDB Validation** — Mongoose schema-level validation
- ✅ **Secure Environment Variables** — No secrets exposed to the client

</details>

---

<details>
<summary><strong>💌 Anonymous Messaging</strong></summary>

<br />

- 📤 **Public Profile Links** — Share your unique `whispr.app/u/[username]` link
- 📥 **Anonymous Inbox** — Receive messages without the sender ever logging in
- 🗑️ **Delete Messages** — Full control over your inbox
- 🔄 **Toggle Accepting** — Turn your inbox on or off instantly
- 📋 **Copy Link** — One-click profile link sharing
- 📊 **Message Stats** — See total messages at a glance

</details>

---

<details>
<summary><strong>🤖 AI-Powered Message Suggestions</strong></summary>

<br />

> Powered by **Groq AI** (`llama-3.3-70b-versatile`) — the fastest AI inference available.

Anonymous visitors can generate creative, mood-based message suggestions before sending. Choose from **7 distinct moods**:

| Mood | Vibe |
|------|------|
| 😂 **Funny** | Playful, meme-style Gen-Z energy |
| 😍 **Flirty** | Cute, charming, respectful |
| 🌊 **Deep** | Thoughtful, meaningful conversation starters |
| 🔥 **Savage** | Witty, teasing, fun |
| 🎲 **Random** | Weird, curious, entertaining |
| 🤗 **Supportive** | Wholesome, positive, uplifting |
| 😤 **Angry** | Dramatic, expressive, but never hateful |

- Click any suggestion to **auto-fill the message box**
- **Skeleton loading** while AI generates
- Suggestions are fresh every generation

</details>

---

<details>
<summary><strong>💬 Anonymous Real-Time Chat</strong></summary>

<br />

Visitors can **instantly start a live conversation** with a registered user — no account required.

**How anonymity works:**
- Each visitor is assigned a **randomly generated persona** on first visit, stored in `localStorage`:
  - 🦊 *Silent Fox*
  - 🦅 *Shadow Falcon*
  - 🌙 *Midnight Echo*
  - 👻 *Hidden Phantom*
  - 🔐 *Neon Cipher*
- The same persona persists across browser sessions
- Identity is **never exposed** to the owner

**Chat features:**
- ⚡ Real-time via Socket.io
- 💬 Chat bubbles (left = anonymous, right = owner)
- 🔄 Auto-scroll to latest message
- 📅 Date dividers
- ⌨️ Typing indicator
- 📱 Mobile-first responsive design
- 🎨 Message entrance animations

</details>

---

<details>
<summary><strong>🔔 Push Notifications (Firebase)</strong></summary>

<br />

> Powered by **Firebase Cloud Messaging (FCM)**

Owners receive instant browser push notifications when:
- A new anonymous message arrives
- A new chat message is received in any session

**Notification capabilities:**
- 🌐 **Browser Push Notifications** — Works even when the tab is in the background
- 🔔 **Real-time Alerts** — Delivered within milliseconds
- 📱 **Background Notifications** — Via Service Worker
- 👆 **Click Navigation** — Clicking the notification opens the relevant chat
- 🎛️ **Permission Handling** — Graceful permission request UI
- 🔑 **FCM Token Management** — Tokens stored and updated in MongoDB

</details>

---

<details>
<summary><strong>📊 Dashboard</strong></summary>

<br />

The owner dashboard is a **premium command center** for managing all activity:

- 📋 **Anonymous Conversations List** — All chats with previews and timestamps
- 📥 **Message Inbox** — All one-way anonymous messages
- 🔗 **Profile Link Sharing** — Copy link with one click
- ⚙️ **Toggle Message Acceptance** — Control your inbox live
- 💬 **Open Any Chat** — Click to open full chat window
- 📈 **Stats Overview** — Total messages, accepting status

</details>

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | Full-stack React framework |
| **UI** | React 19 + TypeScript | Component-driven UI |
| **Styling** | Tailwind CSS + Custom CSS | Glassmorphism dark theme |
| **Database** | MongoDB + Mongoose | Data persistence |
| **Auth** | NextAuth.js | Session management |
| **AI** | Groq AI (Llama 3.3 70B) | Message suggestions |
| **Email** | Resend | OTP verification emails |
| **Realtime** | Socket.io | Live chat & sidebar updates |
| **Notifications** | Firebase Cloud Messaging | Push notifications |
| **Deployment** | Vercel + Render | Frontend + Socket server |
| **Validation** | Zod + React Hook Form | Type-safe form validation |

</div>

---

## 🏗 Architecture

### System Flow

```mermaid
flowchart TD
    A[👤 Anonymous Visitor] -->|visits /u/username| B[Public Profile Page]
    B -->|sends one-way message| C[POST /api/send-message]
    B -->|starts chat| D[POST /api/chat-session]
    D --> E[Socket.io Server]
    E -->|real-time message| F[(MongoDB)]
    F -->|stores session & messages| G[Owner Dashboard]
    G -->|receives notification| H[Firebase Cloud Messaging]
    H -->|push notification| I[🔔 Owner Browser]
    I -->|clicks notification| G

    J[🤖 Groq AI] -->|mood-based suggestions| B
    K[NextAuth Session] -->|protects routes| G
    L[Resend Email] -->|OTP verification| M[New User Signup]
    M --> K
```

### AI Suggestion Flow

```mermaid
sequenceDiagram
    participant V as Visitor
    participant UI as Whispr UI
    participant API as /api/suggest-messages
    participant AI as Groq AI

    V->>UI: Selects mood (e.g. "Deep")
    UI->>API: POST { mood: "deep" }
    API->>AI: Sends mood prompt
    AI-->>API: Returns 3 suggestions separated by "||"
    API-->>UI: { questions: "q1||q2||q3" }
    UI->>V: Renders 3 clickable suggestion cards
    V->>UI: Clicks suggestion → auto-fills textarea
```

### Anonymous Chat Flow

```mermaid
sequenceDiagram
    participant V as Anonymous Visitor
    participant LS as localStorage
    participant API as Next.js API
    participant DB as MongoDB
    participant SK as Socket.io
    participant O as Owner

    V->>LS: getAnonymousId() + getAnonymousName()
    V->>API: POST /api/chat-session { ownerUsername, anonymousId, anonymousName }
    API->>DB: Find or create ChatSession
    DB-->>API: { session }
    API-->>V: { sessionId }
    V->>SK: Emit chat-message { sessionId, content }
    SK->>DB: Save ChatMessage
    SK->>O: sidebar-update event
    SK->>API: Trigger Firebase notification
    API->>O: 🔔 Push notification
```

---

## 📁 Project Structure

```
whispr/
│
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── verify/[username]/page.tsx
│   ├── u/[username]/page.tsx     # Public anonymous profile page
│   ├── dashboard/
│   │   ├── page.tsx              # Owner dashboard
│   │   └── chat/
│   │       └── [[...chatSessionId]]/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── sign-up/
│       ├── verify-code/
│       ├── send-message/
│       ├── get-messages/
│       ├── delete-message/[id]/
│       ├── accept-messages/
│       ├── check-username-unique/
│       ├── suggest-messages/     # Groq AI endpoint
│       ├── chat-session/         # Create/resume anonymous chat
│       ├── chat-messages/        # Send & fetch chat messages
│       ├── ownerchat-sessions/   # Owner's session list
│       └── fetchChat-message/[id]/
│
├── components/
│   └── Navbar.tsx
│
├── context/
│   └── SocketProvider.tsx        # Socket.io client context
│
├── lib/
│   ├── dbConnect.ts
│   └── resend.ts
│
├── model/
│   ├── User.ts
│   ├── ChatSession.ts
│   └── ChatMessage.ts
│
├── schemas/
│   ├── signUpSchema.ts
│   ├── signInSchema.ts
│   └── verifySchema.ts
│
├── types/
│   └── ApiResponse.ts
│
├── helpers/
│   ├── getAnonymousId.ts
│   └── getAnonymousName.ts
│
├── emails/
│   └── VerificationEmail.tsx     # React Email template
│
├── public/
│   └── firebase-messaging-sw.js  # FCM Service Worker
│
├── server.ts                     # Custom Socket.io server
├── middleware.ts                  # Route protection
├── next.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- MongoDB Atlas account
- Groq AI API key
- Firebase project
- Resend account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/abhikhokhar/whispr.git
cd whispr

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values (see Environment Variables section)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file at the root of your project:

```env
# ── App ──────────────────────────────────────────
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# ── Database ─────────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whispr

# ── Email (Resend) ───────────────────────────────
RESEND_API_KEY=re_your_resend_api_key

# ── AI (Groq) ────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key

# ── Firebase Admin (Server-side) ─────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── Firebase Client (Public) ─────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BK...your_vapid_key

# ── Socket.io Server ─────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

> ⚠️ **Never commit your `.env.local` file.** It is already included in `.gitignore`.

---

## 🌐 Deployment

### Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Socket Server — Render

The `server.ts` file is a standalone Node.js + Socket.io server deployed separately:

1. Push your repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `node server.js`
5. Add environment variables in Render dashboard
6. Update `NEXT_PUBLIC_SOCKET_URL` in Vercel to your Render URL

---

## 💡 Why Whispr?

<div align="center">

| Feature | Whispr | Traditional Platforms |
|---------|--------|----------------------|
| **AI Message Help** | ✅ Mood-based Groq AI suggestions | ❌ No AI assistance |
| **Real-time Chat** | ✅ Socket.io powered | ❌ One-way messages only |
| **Anonymous Identity** | ✅ Persistent persona, never exposed | ⚠️ Basic anonymity |
| **Push Notifications** | ✅ Firebase FCM | ❌ None |
| **Modern UI** | ✅ Futuristic glassmorphism | ❌ Generic templates |
| **Email Verification** | ✅ OTP via Resend | ⚠️ Optional |
| **Mobile First** | ✅ Fully responsive | ⚠️ Partial |
| **Open Source** | ✅ MIT Licensed | ❌ Closed source |

</div>

> Whispr was built to solve the boring, disconnected experience of existing anonymous messaging tools — by adding AI creativity, real-time connection, and a premium design that users actually enjoy.

---

## ⚡ Performance

- 🚀 **Next.js App Router** — Server components for faster initial loads
- 🦥 **Lazy Loading** — Components and images load on demand
- ⚡ **Groq AI** — Fastest LLM inference (up to 500 tokens/sec)
- 🗄️ **MongoDB Indexed Queries** — Optimized session and message fetching
- 🎨 **CSS Animations** — GPU-accelerated transitions (no heavy animation libraries)
- 📦 **Minimal Dependencies** — Lean bundle size
- 🌐 **Edge Runtime** — AI suggestion route runs on Vercel Edge
- 📱 **Mobile First** — Designed for touch before desktop

---

## 🗺 Roadmap

<details>
<summary><strong>View upcoming features</strong></summary>

<br />

| Status | Feature | Description |
|--------|---------|-------------|
| 🔄 In Progress | **PWA Support** | Install Whispr as a mobile app |
| 📋 Planned | **End-to-End Encryption** | Zero-knowledge message storage |
| 📋 Planned | **Image Sharing** | Send images anonymously in chat |
| 📋 Planned | **AI Chat Assistant** | AI replies on behalf of the owner |
| 📋 Planned | **AI Conversation Summaries** | Daily digest of anonymous chats |
| 📋 Planned | **Group Anonymous Rooms** | Multiple visitors in one room |
| 📋 Planned | **Reporting System** | Flag inappropriate messages |
| 📋 Planned | **Chat Export / Backup** | Download chat history |
| 📋 Planned | **Android APK** | Via Capacitor or React Native |
| 📋 Planned | **Message Reactions** | React to anonymous messages |
| 💡 Idea | **Voice Messages** | Anonymous audio messages |
| 💡 Idea | **Self-Destructing Messages** | Messages that auto-delete |

</details>

---

## 🤝 Contributing

Contributions are what make the open-source community amazing. Any contribution you make is **greatly appreciated**.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'feat: add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | UI/styling changes |
| `refactor:` | Code refactoring |
| `perf:` | Performance improvements |
| `chore:` | Maintenance tasks |

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 👨‍💻 Author

<div align="center">

<br />

<img src="https://github.com/abhikhokhar.png" width="100" style="border-radius: 50%;" alt="Abhi Khokhar" />

### Abhi Khokhar

*Full-Stack Developer · Open Source Enthusiast*

<br />

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abhikhokhar)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/abhikhokhar)
[![Portfolio](https://img.shields.io/badge/Portfolio-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://abhikhokhar.dev)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abhi@example.com)

</div>

---

## ⭐ Support

If Whispr helped you or you find it interesting, please consider:

<div align="center">

⭐ **Star the repository** — it helps others discover Whispr

🍴 **Fork it** — build your own version

🐛 **Open issues** — report bugs or request features

🗣️ **Share it** — tell other developers about Whispr

</div>

---

## 📄 License

Distributed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Abhi Khokhar

```

See [LICENSE](LICENSE) for the full text.

---

<div align="center">

<br />

Made with ❤️ by [Abhi Khokhar](https://github.com/abhikhokhar)

<br />

**[⬆ Back to Top](#-whispr)**

<br />

<sub>Built with Next.js · Powered by Groq AI · Secured with NextAuth · Connected with Socket.io</sub>

</div>
