# Shipper Chat App

Enterprise-grade real-time chat application built with modern web technologies and production-ready architecture.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - High-quality UI components
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Socket.io** - Real-time WebSocket communication
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database (via Supabase)
- **Supabase Auth** - Authentication & user management

### Infrastructure
- **Supabase** - PostgreSQL database & authentication
- **Upstash Redis** - Caching & session storage
- **Railway/Render** - Hosting (supports WebSockets)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit & integration testing
- **Playwright** - End-to-end testing
- **Prisma Studio** - Database GUI

## ✨ Features

- ✅ Real-time messaging with WebSocket
- ✅ User authentication (Google OAuth & JWT)
- ✅ Online/offline presence indicators
- ✅ AI chat assistant
- ✅ Message history persistence
- ✅ Responsive design
- ✅ Type-safe codebase
- ✅ Production-ready architecture

## 🔒 Security Best Practices

### Environment Variables
Never commit sensitive data. All secrets are stored in `.env.local` (gitignored).

### Data Protection
1. **Authentication**: JWT tokens stored in httpOnly cookies
2. **Database**: Parameterized queries via Prisma (prevents SQL injection)
3. **Validation**: All inputs validated with Zod schemas
4. **HTTPS/WSS**: Secure connections in production
5. **CORS**: Configured for specific origins only
6. **Rate Limiting**: Prevents abuse (via Upstash Redis)

### Protected Data
The following files are **never** committed:
- `.env.local` - Environment variables
- `.env` - Environment configuration
- `node_modules/` - Dependencies
- `.next/` - Build artifacts
- `*.log` - Log files
- `.DS_Store` - macOS system files

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase account)
- Upstash Redis account
- Git installed

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd shipper-chat-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Database (Supabase Transaction Pooler)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Hugging Face (AI Chat)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit `.env.local` to version control!

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment

### Option 1: Railway (Recommended)

Railway supports custom Node.js servers with WebSockets.

#### Steps:
1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables in Railway dashboard
5. Railway will auto-deploy on push

#### Railway Configuration:
- **Start Command**: `npm run start`
- **Build Command**: `npm run build && npm run prisma:generate`
- **Port**: Railway auto-assigns (use `process.env.PORT`)

### Option 2: Render

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm run start`
5. Add environment variables
6. Deploy

### Option 3: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set environment variables
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_url
fly secrets set DATABASE_URL=your_db_url
# ... add all other env vars

# Deploy
fly deploy
```

## 🔐 Pre-Deployment Checklist

### Security
- [ ] All API keys in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] HTTPS/WSS enforced in production
- [ ] Database connection uses SSL

### Environment Variables
- [ ] `DATABASE_URL` uses transaction pooler with `?pgbouncer=true`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (never expose to client)
- [ ] `UPSTASH_REDIS_REST_URL` and token configured
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

### Database
- [ ] Prisma schema pushed to production database
- [ ] Supabase RLS (Row Level Security) policies configured
- [ ] Database backups enabled
- [ ] Connection pooling configured

### Testing
- [ ] Unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

## 📚 Project Structure

```
shipper-chat-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── chat/             # Chat components
│   └── ui/               # Shadcn UI components
├── lib/                   # Utilities & configurations
│   ├── prisma.ts         # Prisma client
│   ├── supabase/         # Supabase clients
│   ├── upstash.ts        # Redis client
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript types
├── prisma/               # Prisma schema
├── public/               # Static assets
├── server.js             # Custom Node.js server (Socket.io)
└── .env.local            # Environment variables (gitignored)
```

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio GUI
```

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E configuration

## 🚨 Common Issues

### WebSocket not working on Vercel
Vercel doesn't support custom Node.js servers. Deploy to Railway, Render, or Fly.io instead.

### Database connection errors
Ensure `DATABASE_URL` includes `?pgbouncer=true` for Supabase transaction pooler.

### Build fails
Run `npm run prisma:generate` before building.

### Environment variables not working
Ensure `.env.local` exists and contains all required variables. Restart dev server after changes.

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For team members:
1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Create pull request
5. Wait for review

## 📞 Support

For issues or questions, contact the development team.

---

**Built with ❤️ by Shipper Team**
# shipper-chat-app
