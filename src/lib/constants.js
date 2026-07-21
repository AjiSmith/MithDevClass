export const ROLE = {
  DEVELOPER: 'developer',
  WALIKELAS: 'walikelas',
  SEKRETARIS: 'sekretaris',
  BENDAHARA: 'bendahara',
}

export const ROLE_LABEL = {
  [ROLE.DEVELOPER]: 'Developer',
  [ROLE.WALIKELAS]: 'Wali Kelas',
  [ROLE.SEKRETARIS]: 'Sekretaris',
  [ROLE.BENDAHARA]: 'Bendahara',
}

// path-based nav items — used by both the desktop and mobile Navbar
export const NAV_ITEMS = [
  { key: 'dashboard',  path: '/',           label: 'Dashboard', icon: 'home',   roles: [ROLE.DEVELOPER, ROLE.WALIKELAS, ROLE.SEKRETARIS, ROLE.BENDAHARA] },
  { key: 'students',   path: '/students',   label: 'Siswa',     icon: 'users',  roles: [ROLE.DEVELOPER, ROLE.WALIKELAS, ROLE.SEKRETARIS, ROLE.BENDAHARA] },
  { key: 'subjects',   path: '/subjects',   label: 'Mapel',     icon: 'book',   roles: [ROLE.DEVELOPER] },
  { key: 'attendance', path: '/attendance', label: 'Absensi',   icon: 'check',  roles: [ROLE.DEVELOPER, ROLE.WALIKELAS, ROLE.SEKRETARIS] },
  { key: 'funds',      path: '/funds',      label: 'Kas Kelas', icon: 'wallet', roles: [ROLE.DEVELOPER, ROLE.WALIKELAS, ROLE.BENDAHARA] },
  { key: 'grades',     path: '/grades',     label: 'Nilai',     icon: 'grad',   roles: [ROLE.DEVELOPER, ROLE.WALIKELAS] },
]

export const STATUS_OPTS = [
  { key: 'hadir', label: 'Hadir', color: '#34D399' },
  { key: 'izin',  label: 'Izin',  color: '#22D3EE' },
  { key: 'sakit', label: 'Sakit', color: '#FBBF24' },
  { key: 'alpha', label: 'Alpha', color: '#F472B6' },
]

export const rupiah = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID')
export const todayKey = () => new Date().toISOString().slice(0, 10)
