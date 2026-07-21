import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { ROLE_LABEL, NAV_ITEMS } from '../lib/constants'

export function Navbar({ user, onLogout, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate()
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role))

  const handleLogout = async () => {
    await onLogout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `nav-pill flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive ? 'active text-white' : 'text-white/55 hover:text-white'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'btn-aurora font-semibold' : 'glass text-white/70'}`

  return (
    <header className="sticky top-0 z-30">
      <div className="glass border-b border-white/5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl btn-aurora flex items-center justify-center">
              <Icon name="sparkle" size={16} />
            </div>
            <span className="font-display font-bold tracking-tight">XI-3 Mith.dev</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {items.map((it) => (
              <NavLink key={it.key} to={it.path} end={it.path === '/'} className={linkClass}>
                <Icon name={it.icon} size={16} /> {it.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold">{user.full_name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-aurora-cyan">{ROLE_LABEL[user.role]}</span>
            </div>
            <button onClick={handleLogout} title="Keluar" className="glass glass-hover rounded-xl p-2 text-white/70 hover:text-white">
              <Icon name="logout" size={17} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden glass rounded-xl p-2">
              <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass border-b border-white/5 px-4 py-3 pop-in">
          <div className="grid grid-cols-2 gap-2">
            {items.map((it) => (
              <NavLink key={it.key} to={it.path} end={it.path === '/'} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                <Icon name={it.icon} size={16} /> {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
