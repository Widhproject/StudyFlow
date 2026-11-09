-- StudyFlow: jalankan seluruh skrip ini di Supabase > SQL Editor
create extension if not exists pgcrypto;

create table profiles(id uuid primary key references auth.users on delete cascade, nama text, created_at timestamptz default now());
create table courses(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nama text not null, hari int not null check(hari between 1 and 7), jam_mulai time not null, jam_selesai time not null,
  ruang text, dosen text, warna text default '#5b4bd5', created_at timestamptz default now());
create table assignments(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references courses on delete set null, judul text not null, deskripsi text, deadline timestamptz not null,
  prioritas text not null default 'sedang' check(prioritas in('tinggi','sedang','rendah')),
  status text not null default 'belum' check(status in('belum','dikerjakan','selesai')), selesai_at timestamptz, created_at timestamptz default now());
create table todos(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  judul text not null, catatan text, prioritas text not null default 'sedang' check(prioritas in('tinggi','sedang','rendah')),
  deadline timestamptz, status text not null default 'belum' check(status in('belum','dikerjakan','selesai')),
  kategori text, pengulangan text not null default 'tidak' check(pengulangan in('tidak','harian','mingguan')), selesai_at timestamptz, created_at timestamptz default now());
create table exams(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references courses on delete cascade, jenis text not null default 'UTS' check(jenis in('UTS','UAS','Kuis')),
  tanggal date not null, jam time, ruang text, created_at timestamptz default now());
create table habits(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nama text not null, target_harian int not null default 1, created_at timestamptz default now());
create table habit_logs(id uuid primary key default gen_random_uuid(), habit_id uuid not null references habits on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade, tanggal date not null, selesai boolean not null default true,
  created_at timestamptz default now(), unique(habit_id,tanggal));
create table notes(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references courses on delete cascade, isi text not null, created_at timestamptz default now());
create table settings(user_id uuid primary key references auth.users on delete cascade, tema text default 'terang', waktu_pengingat int default 60, created_at timestamptz default now());

create index on assignments(course_id); create index on exams(course_id); create index on notes(course_id);
create index on habit_logs(habit_id,tanggal);

-- RLS: setiap pengguna hanya mengakses datanya sendiri
alter table profiles enable row level security;
create policy own_profiles on profiles for all using(id=auth.uid()) with check(id=auth.uid());
do $$ declare t text; begin
  foreach t in array array['courses','assignments','todos','exams','habits','habit_logs','notes','settings'] loop
    execute format('alter table %I enable row level security',t);
    execute format('create policy "own_%1$s" on %1$I for all using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
    execute format('create index on %I(user_id)',t);
    execute format('alter publication supabase_realtime add table %I',t);
  end loop;
end $$;

-- Buat profil + pengaturan otomatis saat daftar
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,nama) values(new.id,coalesce(new.raw_user_meta_data->>'nama',new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)));
  insert into settings(user_id) values(new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Hapus akun beserta seluruh datanya (cascade)
create or replace function delete_account() returns void language sql security definer set search_path=public,auth as $$
  delete from auth.users where id=auth.uid();
$$;
revoke all on function delete_account() from public,anon; grant execute on function delete_account() to authenticated;
