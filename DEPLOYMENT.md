# 🚀 Deployment Guide - Supabase + Vercel

## 📋 Prerequisites

1. **Supabase Account**: Create at [supabase.com](https://supabase.com)
2. **Vercel Account**: Create at [vercel.com](https://vercel.com)
3. **Node.js 18+**: Ensure you have Node.js installed

## 🔧 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `omiam-pizza`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users

### 2. Get Environment Variables
After project creation, go to Settings > API and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Schema
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🚀 Vercel Deployment

### 1. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

### 2. Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_production_url
```

### 3. Build Settings
The `vercel.json` file is already configured with optimal settings for Next.js + Supabase.

## 🔍 Local Development

### 1. Setup Environment
```bash
# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## 🛠️ Common Issues & Solutions

### Database Connection Issues
- Ensure DATABASE_URL is correct
- Check if IP is allowed in Supabase settings
- Verify RLS policies are properly configured

### Authentication Issues
- Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Check if auth policies allow the intended operations
- Verify middleware matcher patterns

### Build Issues
- Ensure all environment variables are set in Vercel
- Check for Node.js version compatibility (18+)
- Verify all dependencies are installed

## 📊 Monitoring

### Supabase Dashboard
- Monitor database usage
- Check authentication logs
- Review API usage

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track deployment success rates

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for automated deployments:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Next Steps

1. **Custom Domain**: Add custom domain in Vercel settings
2. **SSL**: Automatic SSL with Vercel
3. **CDN**: Global CDN automatically configured
4. **Database Backups**: Configure automatic backups in Supabase
5. **Monitoring**: Set up alerts for database and API usage

## 📞 Support

- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Issues**: Create GitHub issue for this repository