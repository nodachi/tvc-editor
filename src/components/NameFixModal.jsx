import React, { useMemo, useState } from 'react'

export default function NameFixModal({ t, open, sampleLines, initialStart, initialEnd, onApply, onClose }) {
  const maxLen = useMemo(() => Math.max(40, ...sampleLines.map((l) => l.length)), [sampleLines])
  const [start, setStart] = useState(initialStart ?? 0)
  const [end, setEnd] = useState(initialEnd ?? Math.min(20, maxLen))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-base-900 rounded-t-2xl border-t border-base-700 p-4 max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4" />
        <h3 className="text-sm font-semibold mb-2">{t('nameFixTitle')}</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{t('nameFixBody')}</p>

        <div className="space-y-1 mb-4 font-mono text-[11px]">
          {sampleLines.slice(0, 4).map((line, i) => (
            <div key={i} className="bg-base-850 rounded px-2 py-1.5 overflow-x-auto whitespace-pre">
              <span className="text-slate-600">{line.slice(0, start)}</span>
              <span className="bg-sky-500/30 text-sky-200">{line.slice(start, end) || ' '}</span>
              <span className="text-slate-600">{line.slice(end)}</span>
            </div>
          ))}
        </div>

        <label className="block text-xs text-slate-400 mb-1">{t('columnStart')}: {start}</label>
        <input
          type="range" min={0} max={maxLen} value={start}
          onChange={(e) => setStart(Math.min(Number(e.target.value), end))}
          className="w-full mb-3 accent-sky-500"
        />
        <label className="block text-xs text-slate-400 mb-1">{t('columnEnd')}: {end}</label>
        <input
          type="range" min={0} max={maxLen} value={end}
          onChange={(e) => setEnd(Math.max(Number(e.target.value), start))}
          className="w-full mb-4 accent-sky-500"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 touch-target rounded-lg bg-base-800 text-sm font-medium">
            {t('nameFixClose')}
          </button>
          <button
            onClick={() => onApply({ start, end })}
            className="flex-1 touch-target rounded-lg bg-sky-600 text-sm font-medium"
          >
            {t('nameFixApply')}
          </button>
        </div>
      </div>
    </div>
  )
}
