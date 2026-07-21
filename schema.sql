-- ⚡ EFFRT Database Schema
-- Run this script in your Supabase SQL Editor to set up the database tables and real-time triggers.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. WORKSPACES
create table if not exists public.workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    invite_code text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. MEMBERS
create table if not exists public.members (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references public.workspaces(id) on delete cascade not null,
    name text not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TASKS
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references public.workspaces(id) on delete cascade not null,
    title text not null,
    assignee_id uuid references public.members(id) on delete set null,
    status text not null check (status in ('todo', 'in_progress', 'done')),
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROOF TRAIL (Immutable audit log)
create table if not exists public.proof_trail (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references public.workspaces(id) on delete cascade not null,
    member_id uuid references public.members(id) on delete cascade not null,
    action_type text not null,
    task_id uuid references public.tasks(id) on delete set null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. STANDUPS
create table if not exists public.standups (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references public.workspaces(id) on delete cascade not null,
    member_id uuid references public.members(id) on delete cascade not null,
    content text not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(member_id, date)
);

-- Enable Realtime for all tables
alter publish to supabase_realtime add table public.workspaces;
alter publish to supabase_realtime add table public.members;
alter publish to supabase_realtime add table public.tasks;
alter publish to supabase_realtime add table public.proof_trail;
alter publish to supabase_realtime add table public.standups;

-- RLS (Row Level Security) - Lite Mode for Hackathon (Allow all for demo ease, secure for production)
alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.tasks enable row level security;
alter table public.proof_trail enable row level security;
alter table public.standups enable row level security;

-- Open policies for public access (easy setup for hackathon deployment)
create policy "Allow all workspaces access" on public.workspaces for all using (true) with check (true);
create policy "Allow all members access" on public.members for all using (true) with check (true);
create policy "Allow all tasks access" on public.tasks for all using (true) with check (true);
create policy "Allow all proof_trail access" on public.proof_trail for all using (true) with check (true);
create policy "Allow all standups access" on public.standups for all using (true) with check (true);
