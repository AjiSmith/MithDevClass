import { Icon } from './Icon'

export function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in glass-strong rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 ${
            t.tone === 'ok' ? 'text-emerald-300' : 'text-pink-300'
          }`}
        >
          <Icon name={t.tone === 'ok' ? 'check' : 'close'} size={15} /> {t.message}
        </div>
      ))}
    </div>
  )
}
