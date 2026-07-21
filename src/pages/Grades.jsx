import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'

export default function Grades() {
  const { toast } = useApp()
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [grades, setGrades] = useState([]) // rows: { id, student_id, subject_id, tugas, uts, uas }
  const [subjectId, setSubjectId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [s, sub, g] = await Promise.all([
        supabase.from('students').select('*').order('no_absen'),
        supabase.from('subjects').select('*').order('nama'),
        supabase.from('grades').select('*'),
      ])
      setStudents(s.data || [])
      setSubjects(sub.data || [])
      setGrades(g.data || [])
      setSubjectId(sub.data?.[0]?.id ?? null)
      setLoading(false)
    })()
  }, [])

  const gradeFor = (studentId) =>
    grades.find((g) => g.student_id === studentId && g.subject_id === subjectId) || { tugas: 0, uts: 0, uas: 0 }

  // Production write, triggered on Enter (see onKeyDown below)
  const commit = async (studentId, comp, raw) => {
    if (raw === undefined || raw === '') return
    const val = Number(raw)
    if (Number.isNaN(val)) { toast('Nilai tidak valid.', 'warn'); return }
    const prev = gradeFor(studentId)
    const payload = { student_id: studentId, subject_id: subjectId, tugas: prev.tugas, uts: prev.uts, uas: prev.uas, [comp]: val }
    const { data, error } = await supabase
      .from('grades')
      .upsert(payload, { onConflict: 'student_id,subject_id' })
      .select()
      .single()
    if (error) { toast(error.message, 'warn'); return }
    setGrades((old) => {
      const others = old.filter((g) => !(g.student_id === studentId && g.subject_id === subjectId))
      return [...others, data]
    })
    toast('Nilai tersimpan (Enter).')
  }

  const draftKey = (studentId, comp) => `${studentId}__${comp}`
  const onKey = (e, studentId, comp) => {
    if (e.key === 'Enter') {
      e.target.blur()
      commit(studentId, comp, drafts[draftKey(studentId, comp)])
    }
  }

  if (loading || subjectId === null) return <div className="text-white/40 text-sm">Memuat data nilai…</div>

  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Management <span className="grad-text">Nilai Kurikulum</span></h1>
          <p className="text-white/45 text-sm">Input nilai siswa berdasarkan kurikulum.</p>
        </div>
        <select value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))} className="rounded-xl px-3.5 py-2.5 text-sm">
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-white/8 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Tugas</th>
                <th className="px-4 py-3">UTS</th>
                <th className="px-4 py-3">UAS</th>
                <th className="px-4 py-3">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const g = gradeFor(s.id)
                const avg = Math.round((Number(g.tugas) + Number(g.uts) + Number(g.uas)) / 3)
                return (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium">{s.nama}</td>
                    {['tugas', 'uts', 'uas'].map((comp) => (
                      <td key={comp} className="px-4 py-3">
                        <input
                          type="number"
                          defaultValue={g[comp]}
                          onChange={(e) => setDrafts({ ...drafts, [draftKey(s.id, comp)]: e.target.value })}
                          onKeyDown={(e) => onKey(e, s.id, comp)}
                          className="rounded-lg px-3 py-1.5 text-sm w-20"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 font-semibold" style={{ color: avg >= 75 ? '#34D399' : '#F472B6' }}>{avg}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
