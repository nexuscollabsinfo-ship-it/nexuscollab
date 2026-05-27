# Vercel Deployment Guide - PostgreSQL Migration

## Problem
Your local environment works perfectly with PostgreSQL, but Vercel deployment shows MySQL syntax errors. This is because Vercel doesn't have access to your `.env` file (which is correctly gitignored).

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project (nexuscollab)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add DATABASE_URL
Add the following environment variable:

**Name:** `DATABASE_URL`

**Value:** 
```
postgresql://postgres.kpvmlqtyrsfuwjmezijb:%40Rr866433030517656@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Important:** Make sure to select all environments (Production, Preview, Development)

### Step 3: Add Other Required Variables
Also add these if not already present:

**Name:** `APP_ID`
**Value:** `myapp`

**Name:** `APP_SECRET`
**Value:** `change_this_secret_key` (or your actual secret)

**Name:** `KIMI_AUTH_URL`
**Value:** `https://placeholder.example.com`

**Name:** `KIMI_OPEN_URL`
**Value:** `https://placeholder.example.com`

### Step 4: Redeploy
After adding the environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋯** (three dots) menu
4. Select **Redeploy**
5. Check "Use existing Build Cache" is **UNCHECKED** (force fresh build)
6. Click **Redeploy**

## Alternative: Force Redeploy via Git

If the above doesn't work, force a new deployment:

```bash
git commit --allow-empty -m "Force Vercel rebuild with PostgreSQL"
git push
```

## Verify Deployment

After redeployment, check:
1. The build logs should show successful PostgreSQL connection
2. No MySQL backtick syntax errors
3. API endpoints should work correctly

## Troubleshooting

If you still see errors:

1. **Check Vercel Build Logs:**
   - Look for "DATABASE_URL" in the logs
   - Verify it's using the PostgreSQL connection string

2. **Clear Build Cache:**
   - In Vercel dashboard, go to Settings → General
   - Scroll to "Build & Development Settings"
   - Clear the build cache

3. **Check Node Modules:**
   - Verify `package.json` has `pg` (not `mysql2`)
   - Ensure `drizzle-orm` is using PostgreSQL dialect

## Current Status

✅ Local development works perfectly
✅ All 29 API tests pass locally
✅ PostgreSQL schema is correct (lowercase columns)
✅ Code is committed to git
❌ Vercel needs DATABASE_URL environment variable

## Next Steps

1. Set DATABASE_URL in Vercel dashboard (see Step 2 above)
2. Redeploy with fresh build cache
3. Test the deployed API endpoints
