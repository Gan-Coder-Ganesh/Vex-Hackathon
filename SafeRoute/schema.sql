-- Enable PostGIS extension
create extension if not exists postgis;

-- Create User Reports Table
create table if not exists user_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lat double precision not null,
  long double precision not null,
  report_type text not null, -- 'flood', 'road_block'
  verification_score int default 0,
  verified_status text default 'UNVERIFIED', -- 'VERIFIED', 'UNVERIFIED'
  location geography(POINT) generated always as (st_setsrid(st_point(long, lat), 4326)) stored
);

-- Index for spatial queries
create index if not exists user_reports_geo_index on user_reports using gist (location);
