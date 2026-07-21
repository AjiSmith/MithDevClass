import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import { rupiah } from '../lib/constants'

export default function Funds() {
  const { toast } = useApp()
  const [students, setStudents] = useState([])
  const [funds, setFunds] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [s, f] = await Promise.all([
        supabase.from('students').select('*').order('no_absen'),
        supabase.from('class_funds').select('*'),
      ])
      setStudents(s.data || [])
      setFunds(f.data || [])
      setLoading(false)
    })()
  }, [])

  const totals = useMemo(() => {
    const byStudent = {}
    students.forEach((s) => {
      byStudent[s.id] = funds.filter((f) => f.student_id === s.id).reduce((a, f) => a + Number(f.nominal), 0)
    })
    return byStudent
  }, [funds, students])

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  // Production write, triggered by the input's onBlur (see JSX below) — no submit button needed
  const commit = async (studentId) => {
    const raw = drafts[studentId]
    if (raw === undefined || raw === '') return
    const nominal = Number(raw)
    if (Number.isNaN(nominal)) { toast('Nominal tidak valid.', 'warn'); return }
    const { data, error } = await supabase
      .from('class_funds')
      .insert({ student_id: studentId, nominal, catatan: 'Input manual' })
      .select()
      .single()
    if (error) { toast(error.message, 'warn'); return }
    setFunds((prev) => [...prev, data])
    setDrafts({ ...drafts, [studentId]: '' })
    toast('Nominal kas tersimpan otomatis (onBlur).')
  }

  if (loading) return <div className="text-white/40 text-sm">Memuat data kas…</div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Pengelolaan <span className="grad-text">Keuangan Kelas</span></h1>
          <p className="text-white/45 text-sm">Input nominal uang yang masuk dari siswa.</p>
        </div>
        <div className="glass rounded-xl px-4 py-2.5 text-right">
          <div className="text-white/40 text-[11px]">Total Terkumpul</div>
          <div className="font-display font-bold text-emerald-300">{rupiah(grandTotal)}</div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 border-b border-white/8 text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Total Terkumpul</th>
              <th className="px-4 py-3">Tambah Iuran (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-medium">{s.nama}</td>
                <td className="px-4 py-3 text-emerald-300">{rupiah(totals[s.id] || 0)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    placeholder="cth. 5000"
                    value={drafts[s.id] ?? ''}
                    onChange={(e) => setDrafts({ ...drafts, [s.id]: e.target.value })}
                    onBlur={() => commit(s.id)}
                    className="rounded-lg px-3 py-1.5 text-sm w-32"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
