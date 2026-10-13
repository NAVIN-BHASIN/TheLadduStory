# The Laddu Story: Supabase & Cloudflare Pages Deployment Guide

This guide walks you through connecting your **Free Supabase PostgreSQL Database** and deploying your web app to **Cloudflare Pages** for zero-cost hosting.

---

## Part 1: Setting Up Your Free Supabase Database (5 Minutes)

### Step 1: Create a Free Project on Supabase
1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (Sign in with your GitHub or Google account).
2. Click **New Project**:
   - **Name:** `TheLadduStory-OMS`
   - **Database Password:** Choose a strong password (save it).
   - **Region:** `South Asia (Mumbai)` (or the closest Indian region for the fastest latency).
   - **Pricing Plan:** Free ($0/month).
3. Click **Create new project** and wait ~1–2 minutes for provisioning.

---

### Step 2: Execute the Database Schema
1. In your Supabase Dashboard sidebar, click **SQL Editor** (icon with `>_`).
2. Click **New query**.
3. Open the file [`schema/supabase_schema.sql`](file:///c:/Users/navin/TheLadduStory/schema/supabase_schema.sql) in this repository, copy all the SQL code, and paste it into the query window.
4. Click **Run** (green button).
5. You will see:
   - Tables created: `products`, `orders`, `order_items`, `customers`.
   - All 11 artisanal products pre-seeded with prices, tags, and stock counts.
   - Row Level Security (RLS) policies enabled.
   - Realtime replication activated.

---

### Step 3: Get Your API Keys
1. In your Supabase Dashboard, click the **Settings** (gear icon) ➔ **API**.
2. Find:
   - **Project URL:** (e.g., `https://abcdefghijklm.supabase.co`)
   - **anon public key:** (starts with `eyJhbGciOiJIUzI1Ni...`)

---

### Step 4: Connect Supabase in The Laddu Story Admin Terminal
You have **two simple options** to connect:

#### Option A: In the Web App UI (Zero Code, Easiest)
1. Open your app and click **Staff & Kitchen Login** (PIN: `1234`).
2. In the top navigation bar, click the button **🟡 Connect Supabase DB**.
3. Paste your **Project URL** and **Anon Public Key**.
4. Click **Save & Connect Supabase**.
5. The button instantly turns **🟢 Supabase Active** and live WebSocket sync is enabled!

#### Option B: Via Environment File
Create a `.env` file inside `admin-desktop/`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## Part 2: Deploying to Cloudflare Pages (100% Free Web Hosting)

Cloudflare Pages provides unlimited bandwidth, automatic free SSL certificates, and 5 Indian edge server locations (Mumbai, Delhi, Bangalore, Chennai, Hyderabad).

### Step 1: Push Code to GitHub
Ensure your latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "Add Supabase real-time sync, Cloudflare Pages rules, and Google Sheets dual-write"
git push origin main
```

---

### Step 2: Connect to Cloudflare Pages
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and create a free account (or log in).
2. In the left menu, select **Workers & Pages** ➔ click **Create application** ➔ select the **Pages** tab.
3. Click **Connect to Git** ➔ authorize GitHub ➔ select your repository: `TheLadduStory/theladdustory.github.io`.
4. Configure Build Settings:
   - **Project name:** `theladdustory`
   - **Production branch:** `main`
   - **Framework preset:** `Vite` (or None)
   - **Root directory:** `admin-desktop`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**.
6. Cloudflare will build and publish your site in ~30 seconds. Your free live site URL will be:  
   👉 `https://theladdustory.pages.dev`

---

### Step 3: Connecting Your Custom Domain (`TheLadduStory.in`)
When you are ready to point your own domain:
1. In Cloudflare Pages, go to your project ➔ **Custom domains** tab ➔ click **Set up a custom domain**.
2. Type `TheLadduStory.in` (and `www.TheLadduStory.in`).
3. Cloudflare will give you the exact DNS records (CNAME or Nameservers).
4. Go to your domain registrar (GoDaddy, BigRock, Namecheap) and paste the DNS records.
5. Cloudflare automatically generates a free SSL certificate. Your brand will be live at `https://TheLadduStory.in` at **₹0 hosting cost**.

---

## Part 3: Verifying the Solution & Google Sheets Backup

1. **Dual-Write Guarantee:**
   - Every order placed via the web storefront is inserted into **Supabase** (for instant real-time kitchen tracking) **AND** submitted to **Google Forms / Apps Script** in the background. Your Google Sheet ledger will keep receiving rows as usual.
2. **Instant Status Write-Backs:**
   - When kitchen staff changes an order status (`RECEIVED` ➔ `PACKED` ➔ `DISPATCHED` ➔ `DELIVERED`), the change is committed directly to Supabase via ACID transaction, instantly updating the customer's tracking stepper without page refresh.
3. **One-Click CSV Backup:**
   - In the Staff Admin panel, click **📥 Export CSV Backup** anytime to download a spreadsheet of all orders that can be opened in Google Sheets or Excel.
