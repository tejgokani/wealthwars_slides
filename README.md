# Company Slide Display Website

A Next.js website that displays company information slides with data from Supabase.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase-schema.sql` to create the companies table
4. Copy your Supabase project URL and anon key from Settings > API

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The `companies` table includes:
- `company_name` - Name of the company
- `origin_country` - Country of origin
- `sector` - Business sector
- `base_price` - Base price (BIGINT)
- `revenue_2022` - Revenue for 2022
- `revenue_2023` - Revenue for 2023
- `logo_url` - URL to company logo image (optional - displays "NO LOGO" if not provided)

## Usage

### Uploading Company Data (CSV)

1. Click the "Upload CSV" button on the main page or navigate to `/upload`
2. Download the sample CSV template to see the required format
3. Prepare your CSV file with the following columns:
   - `company_name` - Name of the company
   - `origin_country` - Country of origin
   - `sector` - Business sector
   - `base_price` - Base price (integer)
   - `revenue_2022` - Revenue for 2022 (decimal)
   - `revenue_2023` - Revenue for 2023 (decimal)
   - `logo_url` - URL to company logo image (optional - leave empty for "NO LOGO")
4. Select your CSV file and click "Import CSV"
5. The data will be automatically imported into the database

### Viewing Company Slides

1. Enter a company name in the search box
2. Click "Search" to find and display the company slide
3. The slide will automatically display with all company information in the formatted display
4. Slides are generated automatically from the database data

## Installation

```bash
npm install
```

<!-- Updated via Git Committer -->
