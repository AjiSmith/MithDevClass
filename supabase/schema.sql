-- ============================================================
-- SmartClass Management Web-App — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Enum peran
create type user_role as enum ('developer', 'walikelas', 'sekretaris', 'bendahara');

-- Profil pengguna (terhubung ke auth.users bawaan Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'sekretaris',
  created_at timestamptz default now()
);

create table students (
  id bigint generated always as identity primary key,
  no_absen int not null,
  nama text not null,
  kelas text not null default '6A',
  created_at timestamptz default now()
);

create table subjects (
  id bigint generated always as identity primary key,
  nama text not null,
  guru text not null
);

create table attendance (
  id bigint generated always as identity primary key,
  student_id bigint references students(id) on delete cascade,
  tanggal date not null,
  status text check (status in ('hadir','izin','sakit','alpha')) not null,
  updated_at timestamptz default now(),
  unique (student_id, tanggal)
);

create table class_funds (
  id bigint generated always as identity primary key,
  student_id bigint references students(id) on delete cascade,
  nominal numeric not null,
  catatan text,
  created_at timestamptz default now()
);

create table grades (
  id bigint generated always as identity primary key,
  student_id bigint references students(id) on delete cascade,
  subject_id bigint references subjects(id) on delete cascade,
  tugas numeric default 0,
  uts numeric default 0,
  uas numeric default 0,
  unique (student_id, subject_id)
);

-- Trigger otomatis: buat baris `profiles` setiap ada user baru daftar
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'sekretaris');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table students enable row level security;
alter table subjects enable row level security;
alter table attendance enable row level security;
alter table class_funds enable row level security;
alter table grades enable row level security;

create policy "profiles - user baca profil sendiri"
on profiles for select using (auth.uid() = id);

create policy "students - baca untuk semua yang login"
on students for select using (auth.role() = 'authenticated');

create policy "students - tulis khusus developer"
on students for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "students - update khusus developer"
on students for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "students - hapus khusus developer"
on students for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);

create policy "subjects - baca untuk semua yang login"
on subjects for select using (auth.role() = 'authenticated');
create policy "subjects - kelola khusus developer"
on subjects for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "subjects - update khusus developer"
on subjects for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "subjects - hapus khusus developer"
on subjects for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'developer')
);

create policy "attendance - baca wali kelas, sekretaris, developer"
on attendance for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('walikelas','developer','sekretaris'))
);
create policy "attendance - tulis sekretaris & developer"
on attendance for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('sekretaris','developer'))
);
create policy "attendance - update sekretaris & developer"
on attendance for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('sekretaris','developer'))
);

create policy "funds - baca wali kelas, bendahara, developer"
on class_funds for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('walikelas','developer','bendahara'))
);
create policy "funds - tulis bendahara & developer"
on class_funds for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('bendahara','developer'))
);

create policy "grades - baca wali kelas & developer"
on grades for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('walikelas','developer'))
);
create policy "grades - tulis wali kelas & developer"
on grades for insert with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('walikelas','developer'))
);
create policy "grades - update wali kelas & developer"
on grades for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('walikelas','developer'))
);

-- ============================================================
-- (Opsional) Data contoh — hapus/isi ulang sesuai kelasmu
-- ============================================================
insert into subjects (nama, guru) values
  ('Matematika', 'Andi Wijaya'),
  ('Bahasa Indonesia', 'Rina Kartika'),
  ('IPA', 'Joko Susilo'),
  ('IPS', 'Sari Handayani'),
  ('Bahasa Inggris', 'Nadia Putri');

insert into students (no_absen, nama, kelas) values
  (1, 'Ahmad Fauzi', '6A'),
  (2, 'Bunga Citra', '6A'),
  (3, 'Cahyo Nugroho', '6A'),
  (4, 'Dinda Permata', '6A'),
  (5, 'Eka Saputra', '6A');

-- Setelah membuat akun lewat Authentication → Users, jalankan (ganti UUID):
-- update profiles set role = 'developer',  full_name = 'Budi Santoso'   where id = '<uuid-developer>';
-- update profiles set role = 'walikelas',  full_name = 'Sri Wahyuni'    where id = '<uuid-walikelas>';
-- update profiles set role = 'sekretaris', full_name = 'Dewi Anggraini' where id = '<uuid-sekretaris>';
-- update profiles set role = 'bendahara',  full_name = 'Rian Pratama'   where id = '<uuid-bendahara>';
