import React from 'react'

export default function BulkToolbar({
  t, count, onSelectAll, onDeselectAll, onSelectTV, onSelectRadio, onSelectEncrypted,
  onMove, onDelete, onClear,
}) {
  return (
    <div className="sticky bottom-0 z-20 bg-base-900/98 backdrop-blur border-t border-base-700 shadow-lg" style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
        <span className="text-sm font-bold shrink-0 text-sky-400 px-1">{count} {t('selectedCount')}</span>
        <button onClick={onSelectAll} className="shrink-0 min-h-[38px] px-3 rounded-lg bg-base-800 text-xs font-medium text-slate-200 active:bg-base-700">{t('selectAll')}</button>
        <button onClick={onSelectTV} className="shrink-0 min-h-[38px] px-3 rounded-lg bg-sky-700 text-xs font-semibold text-white active:bg-sky-800">{t('selectTV')}</button>
        <button onClick={onSelectRadio} className="shrink-0 min-h-[38px] px-3 rounded-lg bg-violet-700 text-xs font-semibold text-white active:bg-violet-800">{t('selectRadio')}</button>
        <button onClick={onSelectEncrypted} className="shrink-0 min-h-[38px] px-3 rounded-lg bg-base-800 text-xs font-medium text-slate-200 active:bg-base-700">{t('selectEncrypted')}</button>
        <button onClick={onDeselectAll} className="shrink-0 min-h-[38px] px-3 rounded-lg bg-base-800 text-xs font-medium text-slate-200 active:bg-base-700">{t('deselectAll')}</button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={onMove}
          disabled={count === 0}
          className="flex-1 min-h-[48px] rounded-xl bg-sky-600 active:bg-sky-700 text-white text-base font-bold disabled:opacity-40 disabled:pointer-events-none shadow-md active:scale-98 transition-transform"
        >
          {t('moveSelected')}
        </button>
        <button
          onClick={onDelete}
          disabled={count === 0}
          className="flex-1 min-h-[48px] rounded-xl bg-rose-600 active:bg-rose-700 text-white text-base font-bold disabled:opacity-40 disabled:pointer-events-none shadow-md active:scale-98 transition-transform"
        >
          {t('deleteSelected')}
        </button>
        <button onClick={onClear} className="min-h-[48px] px-4 rounded-xl bg-base-800 active:bg-base-700 text-slate-200 text-sm font-semibold">
          {t('clearSelection')}
        </button>
      </div>
    </div>
  )
}
