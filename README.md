# SmartClass Management Web-App

Proyek Vite + React + TailwindCSS + Supabase, sudah dipecah sesuai struktur folder
Fase 1, lengkap dengan integrasi Supabase asli (bukan mock) untuk Auth, RBAC,
CRUD Siswa/Mapel, Absensi auto-save, Kas Kelas (onBlur), Nilai (Enter), dan
Dashboard analitik — tema **Aurora Gradient** animasi penuh.

## Jalankan dalam 5 langkah

```bash
# 1. Install dependency
npm install

# 2. Buat proyek di https://app.supabase.com, lalu jalankan supabase/schema.sql
#    di SQL Editor Supabase (buat 4 akun lewat Authentication → Users,
#    lalu jalankan query update role di bagian bawah schema.sql)

# 3. Salin .env.example menjadi .env dan isi kredensial Supabase kamu
cp .env.example .env

# 4. Jalankan secara lokal
npm run dev

# 5. Build untuk produksi
npm run build
```

## Struktur folder

```
src/
├─ lib/            # supabaseClient.js, constants.js (peran, nav, warna status)
├─ context/        # AppContext.jsx — sesi login, profil/peran, toast
├─ hooks/          # useTable.js — hook fetch generik untuk halaman CRUD sederhana
├─ components/     # Icon, Navbar, Modal, Toasts, StatCard, ProtectedRoute
├─ pages/          # Login, Dashboard, Students, Subjects, Attendance, Funds, Grades
├─ App.jsx         # Routing + RBAC + background Aurora
└─ main.jsx        # Entry point
supabase/
└─ schema.sql      # Skema tabel + RLS + trigger, siap tempel ke SQL Editor
```

## Deploy

Konfigurasi `vercel.json` dan `netlify.toml` sudah disertakan (rewrite SPA).
Untuk panduan deploy super rinci (Vercel & Netlify, env var, custom domain,
troubleshooting), lihat **SmartClass-Panduan-Detail-Init-Deploy.md** yang sudah
dikirim sebelumnya di percakapan ini.

Akun demo (buat manual lewat Supabase Authentication → Users, sesuai
komentar di akhir `supabase/schema.sql`):

| Peran | Username contoh |
|---|---|
| Developer | developer@smartclass.sch.id |
| Wali Kelas | walikelas@smartclass.sch.id |
| Sekretaris | sekretaris@smartclass.sch.id |
| Bendahara | bendahara@smartclass.sch.id |
