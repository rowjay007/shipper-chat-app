# Deployment Guide

## 🚀 Railway Deployment (Recommended)

Railway is the recommended platform because it supports:
- Custom Node.js servers
- WebSocket connections (Socket.io)
- Easy environment variable management
- Automatic deployments from GitHub
- Free tier available

### Step 1: Prepare Repository

Ensure your code is in a GitHub repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Sign up with GitHub"
3. Authorize Railway to access your repositories

### Step 3: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `shipper-chat-app` repository
4. Railway will detect Next.js automatically

### Step 4: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (use transaction pooler)
DATABASE_URL=postgresql://postgres.[ref]:password@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Hugging Face (optional)
HUGGINGFACE_API_KEY=your_hf_key

# App URL (Railway provides this)
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Node Environment
NODE_ENV=production
```

### Step 5: Configure Build Settings

Railway auto-detects Next.js. Verify these settings:

**Build Command:**
```bash
npm install && npm run build && npm run prisma:generate
```

**Start Command:**
```bash
npm run start
```

**Port:** Railway auto-assigns (uses `process.env.PORT` from `server.js`)

### Step 6: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Railway will provide a public URL: `https://your-app.railway.app`

### Step 7: Verify Deployment

Test these features:
- [ ] Homepage loads
- [ ] Login/registration works
- [ ] Real-time chat works
- [ ] WebSocket connection successful
- [ ] AI chat responds
- [ ] Online status updates

### Step 8: Custom Domain (Optional)

1. In Railway dashboard, go to **Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain: `chat.yourdomain.com`
4. Add CNAME record in your DNS:
   - Name: `chat`
   - Value: `your-app.railway.app`
5. Wait for DNS propagation (5-30 minutes)

---

## 🔄 Alternative: Render Deployment

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:

**Settings:**
- **Name**: `shipper-chat-app`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**:
  ```bash
  npm install && npm run build && npm run prisma:generate
  ```
- **Start Command**:
  ```bash
  npm run start
  ```

### Step 3: Environment Variables

Add all variables from `.env.local` in Render dashboard.

**Important:** Set `NEXT_PUBLIC_APP_URL` to your Render URL.

### Step 4: Deploy

Click "Create Web Service" and wait for deployment.

---

## 🪂 Alternative: Fly.io Deployment

### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login to Fly

```bash
fly auth login
```

### Step 3: Launch App

```bash
fly launch
```

Follow prompts:
- App name: `shipper-chat-app`
- Region: Choose closest to users
- PostgreSQL: No (using Supabase)
- Redis: No (using Upstash)

### Step 4: Configure fly.toml

Edit `fly.toml`:

```toml
app = "shipper-chat-app"
primary_region = "sjc"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### Step 5: Set Environment Variables

```bash
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_url
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key
fly secrets set DATABASE_URL=your_database_url
fly secrets set UPSTASH_REDIS_REST_URL=your_redis_url
fly secrets set UPSTASH_REDIS_REST_TOKEN=your_token
fly secrets set HUGGINGFACE_API_KEY=your_hf_key
```

### Step 6: Deploy

```bash
fly deploy
```

---

## 🚨 Post-Deployment Checklist

### Verify All Features
- [ ] Application loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] WebSocket connects successfully
- [ ] Real-time messaging works
- [ ] Online presence updates
- [ ] AI chat responds
- [ ] Images load correctly
- [ ] Mobile responsive design works

### Security Verification
- [ ] HTTPS enforced
- [ ] WSS (secure WebSocket) active
- [ ] No API keys exposed in client
- [ ] Environment variables set correctly
- [ ] Database connection secure (SSL)
- [ ] Rate limiting functional

### Performance Check
- [ ] Initial page load < 3 seconds
- [ ] Time to Interactive (TTI) < 5 seconds
- [ ] WebSocket latency < 100ms
- [ ] Database queries optimized
- [ ] Images optimized

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring active
- [ ] Database monitoring enabled
- [ ] WebSocket connection monitoring

---

## 🔧 Troubleshooting

### WebSocket Not Connecting

**Problem:** Socket.io fails to connect in production

**Solutions:**
1. Verify port configuration in `server.js`
2. Check Railway/Render allows WebSocket
3. Ensure `NEXT_PUBLIC_APP_URL` is correct
4. Check browser console for errors
5. Verify firewall settings

### Database Connection Errors

**Problem:** `ECONNREFUSED` or timeout errors

**Solutions:**
1. Verify `DATABASE_URL` has `?pgbouncer=true`
2. Check Supabase database is online
3. Ensure connection pooler is enabled
4. Verify Prisma client is generated
5. Check IP allowlist in Supabase

### Build Fails

**Problem:** Build errors during deployment

**Solutions:**
1. Run `npm run build` locally first
2. Check for TypeScript errors
3. Ensure all dependencies in `package.json`
4. Run `npm run prisma:generate` before build
5. Check build logs for specific errors

### Environment Variables Not Working

**Problem:** App can't access environment variables

**Solutions:**
1. Verify all variables set in platform dashboard
2. Check variable names (no typos)
3. Restart deployment after adding variables
4. Use `NEXT_PUBLIC_` prefix for client-side variables
5. Don't use quotes around values

### 502 Bad Gateway

**Problem:** Application won't start

**Solutions:**
1. Check start command: `npm run start`
2. Verify `server.js` uses correct port
3. Check application logs for errors
4. Ensure Node.js version compatibility
5. Verify all dependencies installed

---

## 📊 Monitoring & Maintenance

### Railway Monitoring

1. **Metrics Tab**: View CPU, memory, network usage
2. **Logs Tab**: Real-time application logs
3. **Deploy Tab**: Deployment history and status

### Health Checks

Add health check endpoint in `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

Use this URL: `https://your-app.railway.app/api/health`

### Uptime Monitoring

Set up external monitoring with:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

### Log Management

**Railway:** Built-in log viewer in dashboard

**External Services:**
- [Logtail](https://logtail.com)
- [Papertrail](https://papertrailapp.com)
- [LogDNA](https://logdna.com)

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub

Railway automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect push
2. Start build
3. Run tests (if configured)
4. Deploy new version
5. Switch traffic to new deployment

### Rollback

If deployment fails, Railway keeps previous version running.

To rollback manually:
1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click "Redeploy"

---

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)

---

**Ready to deploy!** Choose Railway for easiest WebSocket support.
