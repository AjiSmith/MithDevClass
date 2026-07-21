import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { STATUS_OPTS, todayKey } from '../lib/constants'

export default function Attendance() {
  const { toast } = useApp()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([]) // [{ student_id, tanggal, status }]
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('harian') // 'harian' | 'rekap'
  const [date, setDate] = useState(todayKey())
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([
        supabase.from('students').select('*').order('no_absen'),
        supabase.from('attendance').select('student_id, tanggal, status'),
      ])
      setStudents(s.data || [])
      setAttendance(a.data || [])
      setLoading(false)
    })()
  }, [])

  // Production upsert: one call per click, no manual "submit" needed
  const mark = async (studentId, status) => {
    setSavingId(studentId)
    const { error } = await supabase
      .from('attendance')
      .upsert({ student_id: studentId, tanggal: date, status }, { onConflict: 'student_id,tanggal' })
    setSavingId(null)
    if (error) { toast(error.message, 'warn'); return }
    setAttendance((prev) => {
      const others = prev.filter((r) => !(r.student_id === studentId && r.tanggal === date))
      return [...others, { student_id: studentId, tanggal: date, status }]
    })
    toast('Absensi tersimpan otomatis.')
  }

  const recap = useMemo(() => {
    return students.map((s) => {
      const rows = attendance.filter((r) => r.student_id === s.id)
      const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
      rows.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1 })
      const total = rows.length
      const pct = total ? Math.round((counts.hadir / total) * 100) : 0
      return { ...s, ...counts, pct }
    })
  }, [students, attendance])

  const exportXlsx = () => {
    const rows = recap.map((r) => ({
      'No Absen': r.no_absen,
      'Nama': r.nama,
      'Hadir': r.hadir,
      'Izin': r.izin,
      'Sakit': r.sakit,
      'Alpha': r.alpha,
      'Persentase Kehadiran (%)': r.pct,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi')
    XLSX.writeFile(wb, `Rekap_Absensi_${todayKey()}.xlsx`)
    toast('File .xlsx berhasil diunduh.')
  }

  if (loading) return <div className="text-white/40 text-sm">Memuat data absensi…</div>

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Pengelolaan <span className="grad-text">Absensi Murid</span></h1>
          <p className="text-white/45 text-sm">Kelola kehadiran siswa.</p>
        </div>
        <div className="glass rounded-xl p-1 flex gap-1">
          <button onClick={() => setTab('harian')} className={`px-3.5 py-2 rounded-lg text-sm font-medium ${tab === 'harian' ? 'btn-aurora' : 'text-white/55'}`}>
            Harian
          </button>
          <button onClick={() => setTab('rekap')} className={`px-3.5 py-2 rounded-lg text-sm font-medium ${tab === 'rekap' ? 'btn-aurora' : 'text-white/55'}`}>
            Rekap &amp; Ekspor
          </button>
        </div>
      </div>

      {tab === 'harian' ? (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/50 text-sm">Tanggal:</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div className="space-y-2">
            {students.map((s) => {
              const current = attendance.find((r) => r.student_id === s.id && r.tanggal === date)?.status
              return (
                <div
                  key={s.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 bg-white/[0.02] border border-white/5 ${savingId === s.id ? 'save-pulse' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-6">{s.no_absen}</span>
                    <span className="font-medium text-sm">{s.nama}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {STATUS_OPTS.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => mark(s.id, o.key)}
                        style={current === o.key ? { background: o.color, color: '#05060D' } : {}}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${current === o.key ? '' : 'bg-white/6 text-white/60 hover:bg-white/12'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5">
          <div className="flex justify-end mb-4">
            <button onClick={exportXlsx} className="btn-aurora rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5">
              <Icon name="download" size={16} /> Ekspor .xlsx
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 border-b border-white/8 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Hadir</th>
                  <th className="px-4 py-3">Izin</th>
                  <th className="px-4 py-3">Sakit</th>
                  <th className="px-4 py-3">Alpha</th>
                  <th className="px-4 py-3">% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {recap.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium">{r.nama}</td>
                    <td className="px-4 py-3 text-emerald-300">{r.hadir}</td>
                    <td className="px-4 py-3 text-cyan-300">{r.izin}</td>
                    <td className="px-4 py-3 text-amber-300">{r.sakit}</td>
                    <td className="px-4 py-3 text-pink-300">{r.alpha}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: 'linear-gradient(90deg,#22D3EE,#34D399)' }}></div>
                        </div>
                        <span className="text-white/60 text-xs">{r.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
