import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Icon } from '../components/Icon'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError('Email atau password salah.')
    // On success, AppContext's onAuthStateChange listener picks up the
    // new session automatically and the router redirects away from /login.
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl btn-aurora flex items-center justify-center">
              <Icon name="close" size={20} />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight">MithDash</span>
          </div>
          <p className="text-white/50 text-sm">Web Pengelolaan data kelas XI TKJ-3.</p>
        </div>

        <form onSubmit={submit} className="glass-strong rounded-3xl p-7 shadow-2xl">
          <h1 className="font-display font-bold text-xl mb-1">LOG-IN</h1>
          <p className="text-white/40 text-xs mb-5">
            Masukkan identitas akun anda.
          </p>

          <label className="block text-xs text-white/50 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-xl px-3.5 py-2.5 mb-3 text-sm"
            placeholder="nama@sekolah.sch.id"
          />

          <label className="block text-xs text-white/50 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl px-3.5 py-2.5 mb-4 text-sm"
            placeholder="••••••••"
          />

          {error && <div className="text-xs text-pink-300 mb-3">{error}</div>}

          <button disabled={busy} className="btn-aurora w-full rounded-xl py-2.5 font-semibold text-sm disabled:opacity-60">
            {busy ? 'Memverifikasi…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
