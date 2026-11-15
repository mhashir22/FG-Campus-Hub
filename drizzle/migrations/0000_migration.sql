-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account ever created becomes the admin; everyone else is a regular user.
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- Shared updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  location text not null default '',
  category text not null default 'General',
  starts_at timestamptz not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Anyone can view events" on public.events for select to anon, authenticated using (true);
create policy "Admins can add events" on public.events for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update events" on public.events for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete events" on public.events for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();

-- Blog posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  cover_url text,
  author_name text not null default 'Campus Hub Team',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Anyone can read posts" on public.posts for select to anon, authenticated using (true);
create policy "Admins can add posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();

-- Sample content
insert into public.events (title, description, location, category, starts_at) values
  ('Annual Sports Gala', 'Inter-department athletics, cricket and tug of war. All students are welcome to cheer for their teams.', 'College Sports Ground', 'Sports', now() + interval '6 days'),
  ('Science Exhibition 2026', 'Students present working models and research projects. Judges from local universities will award the best three projects.', 'Main Hall', 'Academic', now() + interval '13 days'),
  ('Iqbal Day Mushaira', 'An evening of poetry celebrating Allama Iqbal, organised by the Urdu Literary Society.', 'Auditorium', 'Cultural', now() + interval '20 days'),
  ('Orientation for New Students', 'Welcome session for first-year students with campus tour and society introductions.', 'Auditorium', 'General', now() - interval '30 days');

insert into public.posts (title, content, cover_url, author_name, created_at) values
  ('Welcome to Campus Hub', E'Campus Hub is the new home for everything happening at FG Degree College Wah Cantt.\n\nHere you will find upcoming events, society news and stories written by our faculty and students. Check back often to stay up to date.', '/images/blog-welcome.jpg', 'Campus Hub Team', now() - interval '2 days'),
  ('Our Students Shine at the Inter-College Debate', E'Our debating team brought home the runner-up trophy at this year''s inter-college debate competition held in Rawalpindi.\n\nCongratulations to the team and their mentors for weeks of hard work and preparation.', '/images/blog-debate.jpg', 'Literary Society', now() - interval '5 days');