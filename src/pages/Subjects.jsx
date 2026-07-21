import { useState } from 'react'
import { useTable } from '../hooks/useTable'
import { supabase } from '../lib/supabaseClient'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/Modal'
import { Icon } from '../components/Icon'

export default function Subjects() {
  const { toast } = useApp()
  const { rows: subjects, setRows: setSubjects, loading } = useTable('subjects', { orderBy: 'nama' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nama: '', guru: '' })

  const save = async () => {
    if (modal.mode === 'new') {
      const { data, error } = await supabase.from('subjects').insert(form).select().single()
      if (error) { toast(error.message, 'warn'); return }
      setSubjects([...subjects, data])
      toast('Mata pelajaran ditambahkan.')
    } else {
      const { error } = await supabase.from('subjects').update(form).eq('id', modal.data.id)
      if (error) { toast(error.message, 'warn'); return }
      setSubjects(subjects.map((s) => (s.id === modal.data.id ? { ...s, ...form } : s)))
      toast('Mata pelajaran diperbarui.')
    }
    setModal(null)
  }

  const remove = async (s) => {
    const { error } = await supabase.from('subjects').delete().eq('id', s.id)
    if (error) { toast(error.message, 'warn'); return }
    setSubjects(subjects.filter((x) => x.id !== s.id))
    toast(`${s.nama} dihapus.`, 'warn')
  }

  if (loading) return <div className="text-white/40 text-sm">Memuat data mapel…</div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold">Manajemen <span className="grad-text">Mata Pelajaran</span></h1>
          <p className="text-white/45 text-sm">Kelola mapel &amp; guru pengampu (khusus Developer).</p>
        </div>
        <button
          onClick={() => { setForm({ nama: '', guru: '' }); setModal({ mode: 'new' }) }}
          className="btn-aurora rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5"
        >
          <Icon name="plus" size={16} /> Tambah Mapel
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <div key={s.id} className="glass glass-hover rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl btn-aurora flex items-center justify-center mb-3">
                <Icon name="book" size={18} />
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setForm({ nama: s.nama, guru: s.guru }); setModal({ mode: 'edit', data: s }) }}
                  className="glass rounded-lg p-1.5 text-aurora-cyan"
                >
                  <Icon name="edit" size={13} />
                </button>
                <button onClick={() => remove(s)} className="glass rounded-lg p-1.5 text-pink-300">
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
            <div className="font-display font-semibold">{s.nama}</div>
            <div className="text-white/40 text-xs mt-0.5">Guru: {s.guru}</div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Tambah Mapel' : 'Ubah Mapel'} onClose={() => setModal(null)}>
          <label className="block text-xs text-white/50 mb-1">Nama Mata Pelajaran</label>
          <input
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 mb-3 text-sm"
          />
          <label className="block text-xs text-white/50 mb-1">Guru Pengampu</label>
          <input
            value={form.guru}
            onChange={(e) => setForm({ ...form, guru: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 mb-4 text-sm"
          />
          <button onClick={save} disabled={!form.nama} className="btn-aurora w-full rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50">
            Simpan
          </button>
        </Modal>
      )}
    </div>
  )
}
