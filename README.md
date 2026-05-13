# 🚀 SkillSync AI - Career Intelligence Platform

> **AI-powered career development platform** with real-time market insights, peer mock interviews, and personalized mentorship.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

## ✨ Features

### 🧠 AI Career Mentor
- GPT-4 powered conversational career advisor
- Personalized advice based on your profile and market data
- Session history and actionable insights

### 📊 Real-Time Market Intelligence
- Live salary trends and job demand analytics
- Interactive charts (Recharts)
- Skill demand heatmap with radar visualization
- 30-day historical data tracking

### 🤝 Peer Mock Interviews
- Schedule interviews with matched peers
- WebRTC video calls via Socket.io
- Post-interview feedback and ratings
- Smart peer matching based on skills

### 📄 ATS Resume Analyzer
- PDF upload and parsing
- AI-powered resume scoring
- Keyword analysis and optimization suggestions
- Format and content scoring

### 💬 Real-Time Messaging
- Socket.io powered instant messaging
- Conversation history
- Typing indicators
- Mobile-responsive chat interface

### 🔍 Job Board
- Advanced search and filtering
- Skill-based job matching
- Application tracking
- Recruiter profiles

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  Node.js API    │────▶│   PostgreSQL    │
│   Tailwind CSS  │     │   Express       │     │   (Prisma ORM)  │
│   Framer Motion │     │   Socket.io     │     │                 │
│   Recharts      │     │   JWT Auth      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │      Redis      │
                        │   (Sessions)    │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/ravigithubcse/SkillSync-AI.git
cd SkillSync-AI

# Copy environment variables
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:5173
# API: http://localhost:3001
# Database: localhost:5432
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install

# Setup database
cp .env.example .env
# Edit .env with your database credentials

npx prisma migrate dev
npx prisma db seed

npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
SkillSync-AI/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # JWT, Redis, Socket, Logger
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Demo data
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks & stores
│   │   ├── lib/             # API client, utils
│   │   └── types/           # TypeScript types
│   └── Dockerfile
├── nginx/
│   └── nginx.conf           # Reverse proxy config
└── docker-compose.yml
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/skillsync"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key"
OPENAI_API_KEY="sk-your-openai-key"  # Optional
FRONTEND_URL="http://localhost:5173"
```

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | demo@skillsync.ai | password123 |
| Recruiter | recruiter@techcorp.com | password123 |

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** + custom design system
- **Framer Motion** (animations)
- **TanStack Query** (data fetching)
- **Zustand** (state management)
- **Recharts** (data visualization)
- **Socket.io Client** (real-time)
- **React Dropzone** (file uploads)

### Backend
- **Node.js** + Express
- **TypeScript**
- **Prisma ORM** + PostgreSQL
- **Socket.io** (WebSockets)
- **Redis** (sessions/cache)
- **JWT** authentication
- **OpenAI API** integration
- **Winston** logging
- **Helmet** + CORS security

### DevOps
- **Docker** + Docker Compose
- **Nginx** reverse proxy
- **GitHub Actions** ready

## 📊 Database Schema

The platform uses a comprehensive schema with:
- **Users** (Job Seekers & Recruiters)
- **Skills** with market demand tracking
- **Job Postings** with requirements
- **Applications** with match scoring
- **Mentor Sessions** with AI conversations
- **Mock Interviews** with peer matching
- **Messages** with real-time delivery
- **Market Data** with historical trends

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/applications/my` - My applications

### AI Mentor
- `POST /api/mentor/chat` - Chat with AI mentor
- `GET /api/mentor/sessions` - Chat history

### Market Data
- `GET /api/market/dashboard` - Market overview
- `GET /api/market/demand-heatmap` - Skill demand

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- The React & Node.js communities
- All contributors and testers

---

**Built with ❤️ for the tech community**

> *"Your career is a marathon, not a sprint. Let AI be your training partner."*
