DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  sector TEXT NOT NULL,
  base_price BIGINT NOT NULL,
  revenue_2022 DECIMAL(15, 2) NOT NULL,
  revenue_2023 DECIMAL(15, 2) NOT NULL,
  growth_rate TEXT NOT NULL CHECK (growth_rate IN ('LOW', 'MEDIUM', 'HIGH')),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_company_name ON companies(company_name);

INSERT INTO companies (
  company_name,
  origin_country,
  sector,
  base_price,
  revenue_2022,
  revenue_2023,
  growth_rate,
  logo_url
) VALUES (
  'SEATRIUM MARINE SYSTEMS',
  'CORALIS',
  'AGRICULTURE',
  25000000,
  73876542.4,
  75432542.4,
  'MEDIUM',
  NULL
);
