# StudyFlow – Daily Tracker Mahasiswa (React + Vite + Supabase)

## Setup Supabase
1. Buat proyek di https://supabase.com → New project.
2. **SQL Editor** → New query → tempel isi `schema.sql` → Run (membuat tabel, indeks, RLS, trigger profil, fungsi hapus akun, dan realtime).
3. **Authentication → Providers**: Email aktif (opsional matikan "Confirm email" saat uji coba). Aktifkan **Google**: buat OAuth Client ID di Google Cloud Console, isi Client ID/Secret, dan daftarkan Callback URL yang ditampilkan Supabase sebagai Authorized redirect URI.
4. **Authentication → URL Configuration**: isi Site URL & Redirect URLs (`http://localhost:5173` dan domain produksi) agar reset password/Google bekerja.
5. **Project Settings → API**: salin Project URL dan anon public key.

## Jalankan
```
cp .env.example .env    # isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
npm install
npm run dev             # http://localhost:5173
```
Jangan pernah memakai `service_role` key di frontend. Keamanan data dijaga RLS (`user_id = auth.uid()`).

## Struktur
`src/lib.jsx` (klien, helper, Crud/form) · `src/pages.jsx` (semua halaman) · `src/App.jsx` (auth, realtime, navigasi) · `src/styles.css` (tema terang/gelap)
