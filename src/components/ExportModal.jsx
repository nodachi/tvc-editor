import React, { useState } from 'react'

const FORMATS = ['sdx', 'xml', 'json']

export default function ExportModal({ t, open, defaultFormat, onExport, onClose }) {
  const [format, setFormat] = useState(defaultFormat)
  const [renumber, setRenumber] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-base-900 rounded-t-2xl border-t border-base-700 p-4"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4" />
        <h3 className="text-sm font-semibold mb-3">{t('exportAs')}</h3>

        <div className="flex gap-2 mb-4">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 touch-target rounded-lg text-sm font-mono uppercase ${
                format === f ? 'bg-sky-600' : 'bg-base-850 border border-base-700'
              }`}
            >
              .{f}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 mb-5 text-sm">
          <input
            type="checkbox"
            checked={renumber}
            onChange={(e) => setRenumber(e.target.checked)}
            className="w-5 h-5 accent-sky-500"
          />
          {t('renumberOnExport')}
        </label>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 touch-target rounded-lg bg-base-800 text-sm font-medium">
            {t('cancel')}
          </button>
          <button
            onClick={() => onExport(format, renumber)}
            className="flex-1 touch-target rounded-lg bg-emerald-600 text-sm font-medium"
          >
            {t('export')}
          </button>
        </div>
      </div>
    </div>
  )
}
