import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Modal'
import { Icon } from '../components/Icon'
import { ROLE } from '../lib/constants'

export default function Students() {
  const { user, toast } = useApp()
  const { rows: students, setRows: setStudents, loading } = useTable('students', { orderBy: 'no_absen' })
  const canEdit = user.role === ROLE.DEVELOPER
  const [modal, setModal] = useState(null) // { mode: 'new' | 'edit', data? }
  const [form, setForm] = useState({ nama: '', kelas: '6A' })

  // Production write — RLS on the `students` table only allows this for role = developer
  const save = async () => {
    if (modal.mode === 'new') {
      const no_absen = students.length + 1
      const { data, error } = await supabase.from('students').insert({ ...form, no_absen }).select().single()
      if (error) { toast(error.message, 'warn'); return }
      setStudents([...students, data])
      toast('Siswa baru berhasil ditambahkan.')
    } else {
      const { error } = await supabase.from('students').update(form).eq('id', modal.data.id)
      if (error) { toast(error.message, 'warn'); return }
      setStudents(students.map((s) => (s.id === modal.data.id ? { ...s, ...form } : s)))
      toast('Data siswa diperbarui.')
    }
    setModal(null)
  }

  const remove = async (s) => {
    const { error } = await supabase.from('students').delete().eq('id', s.id)
    if (error) { toast(error.message, 'warn'); return }
    setStudents(students.filter((x) => x.id !== s.id))
    toast(`${s.nama} dihapus dari direktori.`, 'warn')
  }

  const openNew = () => { setForm({ nama: '', kelas: '6A' }); setModal({ mode: 'new' }) }
  const openEdit = (s) => { setForm({ nama: s.nama, kelas: s.kelas }); setModal({ mode: 'edit', data: s }) }

  if (loading) return <div className="text-white/40 text-sm">Memuat data siswa…</div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Management <span className="grad-text">Siswa</span></h1>
          <p className="text-white/45 text-sm">User Management - CRUD Integrated.</p>
        </div>
        {canEdit && (
          <button onClick={openNew} className="btn-aurora rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5">
            <Icon name="plus" size={16} /> Tambah Siswa
          </button>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-white/8 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kelas</th>
                {canEdit && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-white/50">{s.no_absen}</td>
                  <td className="px-4 py-3 font-medium">{s.nama}</td>
                  <td className="px-4 py-3 text-white/60">{s.kelas}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(s)} className="glass-hover glass rounded-lg p-1.5 text-aurora-cyan">
                          <Icon name="edit" size={14} />
                        </button>
                        <button onClick={() => remove(s)} className="glass-hover glass rounded-lg p-1.5 text-pink-300">
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Tambah Siswa' : 'Ubah Data Siswa'} onClose={() => setModal(null)}>
          <label className="block text-xs text-white/50 mb-1">Nama Lengkap</label>
          <input
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 mb-3 text-sm"
            placeholder="Nama siswa"
          />
          <label className="block text-xs text-white/50 mb-1">Kelas</label>
          <input
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 mb-4 text-sm"
            placeholder="cth. 6A"
          />
          <button onClick={save} disabled={!form.nama} className="btn-aurora w-full rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50">
            Simpan
          </button>
        </Modal>
      )}
    </div>
  )
}
