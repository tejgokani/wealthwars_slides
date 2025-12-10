# Quick Setup Guide

## Fix "Supabase is not configured" Error

To fix the error you're seeing, you need to create a `.env.local` file with your Supabase credentials.

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### Step 2: Create .env.local File

In your project root directory (`/Users/tejgokani/Desktop/FC WW/PPT Softwarre/`), create a file named `.env.local` with this content:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Project URL (looks like: `https://xxxxx.supabase.co`)
- `your_anon_key_here` with your anon/public key (a long string)

### Step 3: Restart the Development Server

After creating `.env.local`:
1. Stop your current dev server (Ctrl+C)
2. Run `npm run dev` again
3. The error should be gone!

### Step 4: Set Up Database

1. In Supabase, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click **Run** to create the table
4. You're ready to upload CSV files!

## Example .env.local File

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.example
```

**Note:** Never commit `.env.local` to git - it contains your secret keys!
