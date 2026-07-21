import {
  Home, Users, BookOpen, CheckCircle2, Wallet, GraduationCap,
  LogOut, Menu, X, Download, Pencil, Trash2, Plus, Sparkles,
} from 'lucide-react'

const MAP = {
  home: Home,
  users: Users,
  book: BookOpen,
  check: CheckCircle2,
  wallet: Wallet,
  grad: GraduationCap,
  logout: LogOut,
  menu: Menu,
  close: X,
  download: Download,
  edit: Pencil,
  trash: Trash2,
  plus: Plus,
  sparkle: Sparkles,
}

export function Icon({ name, size = 18, className = '' }) {
  const Cmp = MAP[name]
  if (!Cmp) return null
  return <Cmp size={size} className={className} strokeWidth={1.8} />
}
