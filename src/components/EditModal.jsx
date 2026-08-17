import React, { useEffect, useState } from 'react'

export default function EditModal({ t, lang, channel, onSave, onClose, onDelete }) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState(1)
  const [type, setType] = useState('TV')

  useEffect(() => {
    if (channel) {
      setName(channel.name)
      setNumber(channel.number)
      setType(channel.type)
    }
  }, [channel])

  if (!channel) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-base-900 rounded-t-2xl border-t border-base-700 p-4"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4" />

        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs text-slate-400">{t('channelName')}</label>
          {channel._mode === 'satcodx103' && (
            <span className={`text-[11px] font-mono ${name.length > 20 ? 'text-rose-400' : 'text-slate-500'}`}>
              {name.length}/20
            </span>
          )}
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full touch-target px-3 rounded-lg bg-base-850 border border-base-700 text-base mb-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        {channel._mode === 'satcodx103' && name.length > 20 && (
          <p className="text-[11px] text-rose-400 mb-2">
            {lang === 'tr'
              ? 'Bu format en fazla 20 karakter destekler, fazlası dışa aktarımda kesilecek.'
              : 'This format supports up to 20 characters; the rest will be cut on export.'}
          </p>
        )}
        <div className={channel._mode === 'satcodx103' && name.length > 20 ? '' : 'mb-3'} />

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">{t('channelNumber')}</label>
            <input
              type="number"
              inputMode="numeric"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
              className="w-full touch-target px-3 rounded-lg bg-base-850 border border-base-700 text-base focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">{t('channelType')}</label>
            <div className="flex gap-2">
              {['TV', 'RADIO'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setType(opt)}
                  className={`flex-1 touch-target rounded-lg text-sm font-medium ${
                    type === opt ? 'bg-sky-600' : 'bg-base-850 border border-base-700'
                  }`}
                >
                  {opt === 'TV' ? t('tv') : t('radio')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {channel._uncertain && (
          <p className="text-[11px] text-amber-400 mb-3">⚠ {t('nameFixTitle')}</p>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 touch-target rounded-lg bg-base-800 text-sm font-medium">
            {t('cancel')}
          </button>
          <button
            onClick={() => onDelete(channel.id)}
            className="touch-target px-4 rounded-lg bg-rose-600/80 text-sm font-medium"
          >
            {t('delete')}
          </button>
          <button
            onClick={() => onSave(channel.id, { name: name.trim() || channel.name, number, type })}
            className="flex-1 touch-target rounded-lg bg-sky-600 text-sm font-medium"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
