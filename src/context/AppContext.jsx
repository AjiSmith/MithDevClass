import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, tone = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  // Keep session in sync with Supabase Auth (login, logout, token refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Load the role/profile row that drives RBAC once we have a session
  useEffect(() => {
    if (!session) { setProfile(null); setLoading(false); return }
    let active = true
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return
        if (error) toast('Gagal memuat profil pengguna.', 'warn')
        setProfile(data)
        setLoading(false)
      })
    return () => { active = false }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => { await supabase.auth.signOut() }

  const user = profile ? { ...profile, email: session?.user?.email } : null

  return (
    <AppContext.Provider value={{ session, user, loading, toast, toasts, logout }}>
      {children}
    </AppContext.Provider>
  )
}
