import React, { useState } from 'react'

export default function MoveModal({ t, open, max, onConfirm, onClose }) {
  const [pos, setPos] = useState(1)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-base-900 rounded-t-2xl border-t border-base-700 p-4"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4" />
        <h3 className="text-sm font-semibold mb-3">{t('moveTitle')}</h3>
        <label className="block text-xs text-slate-400 mb-1">{t('movePosition')} (1-{max})</label>
        <input
          autoFocus
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={pos}
          onChange={(e) => setPos(Math.min(max, Math.max(1, parseInt(e.target.value, 10) || 1)))}
          className="w-full touch-target px-3 rounded-lg bg-base-850 border border-base-700 text-base mb-4 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 touch-target rounded-lg bg-base-800 text-sm font-medium">
            {t('cancel')}
          </button>
          <button
            onClick={() => onConfirm(pos)}
            className="flex-1 touch-target rounded-lg bg-sky-600 text-sm font-medium"
          >
            {t('moveConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
