import { useEffect, useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'
import { StatCard } from '../components/StatCard'
import { STATUS_OPTS, rupiah } from '../lib/constants'

export default function Dashboard() {
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attendance, setAttendance] = useState([])
  const [funds, setFunds] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [s, sub, att, fund, grd] = await Promise.all([
        supabase.from('students').select('id'),
        supabase.from('subjects').select('id, nama'),
        supabase.from('attendance').select('status'),
        supabase.from('class_funds').select('nominal'),
        supabase.from('grades').select('subject_id, tugas, uts, uas'),
      ])
      setStudents(s.data || [])
      setSubjects(sub.data || [])
      setAttendance(att.data || [])
      setFunds(fund.data || [])
      setGrades(grd.data || [])
      setLoading(false)
    })()
  }, [])

  const attSummary = useMemo(() => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
    attendance.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1 })
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
    return STATUS_OPTS.map((o) => ({
      name: o.label,
      value: counts[o.key] || 0,
      pct: Math.round(((counts[o.key] || 0) / total) * 100),
      color: o.color,
    }))
  }, [attendance])

  const gradeBySubject = useMemo(() => {
    return subjects.map((sub) => {
      const rows = grades.filter((g) => g.subject_id === sub.id)
      const avg = rows.length
        ? rows.reduce((a, g) => a + (g.tugas + g.uts + g.uas) / 3, 0) / rows.length
        : 0
      return { name: sub.nama, rata: Math.round(avg) }
    })
  }, [subjects, grades])

  const totalKas = funds.reduce((a, f) => a + Number(f.nominal), 0)
  const hadirPct = attSummary.find((s) => s.name === 'Hadir')?.pct ?? 0

  if (loading) return <div className="text-white/40 text-sm">Memuat data dasbor…</div>

  return (
    <div className="fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">Analytics<span className="grad-text"> Dashboard</span></h1>
      <p className="text-white/45 text-sm mb-6">Ringkasan performa kelas.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Siswa" value={students.length} color="#22D3EE" />
        <StatCard label="Kas Terkumpul" value={rupiah(totalKas)} color="#34D399" />
        <StatCard label="Rata-rata Kehadiran" value={`${hadirPct}%`} color="#8B5CF6" />
        <StatCard label="Mata Pelajaran" value={subjects.length} color="#F472B6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Kehadiran Siswa</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={attSummary} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {attSummary.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }} />
                <Tooltip contentStyle={{ background: '#0F1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-3">Rata-rata Nilai Siswa</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={gradeBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0F1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="rata" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
