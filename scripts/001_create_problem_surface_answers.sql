-- Create table to store problem surface mapping answers
create table if not exists public.problem_surface_answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  question_1 text not null,
  answer_1 text not null,
  question_2 text not null,
  answer_2 text not null,
  question_3 text not null,
  answer_3 text not null,
  session_id text
);

-- Enable RLS
alter table public.problem_surface_answers enable row level security;

-- Policy to allow anyone to insert answers (no auth required for this use case)
create policy "allow_insert_answers" 
  on public.problem_surface_answers 
  for insert 
  with check (true);

-- Policy to allow anyone to view answers (for admin page)
create policy "allow_select_answers" 
  on public.problem_surface_answers 
  for select 
  using (true);

-- Create index on created_at for faster queries
create index if not exists problem_surface_answers_created_at_idx 
  on public.problem_surface_answers(created_at desc);
