import React from 'react'

export default function BulkToolbar({
  t, count, onSelectAll, onDeselectAll, onSelectEncrypted, onSelectRadio,
  onMove, onDelete, onClear,
}) {
  if (count === 0) return null
  return (
    <div className="sticky bottom-0 z-20 bg-base-900/97 backdrop-blur border-t border-base-700" style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
        <span className="text-sm font-semibold shrink-0 text-sky-400">{count} {t('selectedCount')}</span>
        <button onClick={onSelectAll} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-base-800 text-xs">{t('selectAll')}</button>
        <button onClick={onSelectRadio} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-base-800 text-xs">{t('selectRadio')}</button>
        <button onClick={onSelectEncrypted} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-base-800 text-xs">{t('selectEncrypted')}</button>
        <button onClick={onDeselectAll} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-base-800 text-xs">{t('deselectAll')}</button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-2">
        <button onClick={onMove} className="flex-1 touch-target rounded-lg bg-sky-600 active:bg-sky-700 text-sm font-medium">
          {t('moveSelected')}
        </button>
        <button onClick={onDelete} className="flex-1 touch-target rounded-lg bg-rose-600 active:bg-rose-700 text-sm font-medium">
          {t('deleteSelected')}
        </button>
        <button onClick={onClear} className="touch-target px-4 rounded-lg bg-base-800 text-sm">
          {t('clearSelection')}
        </button>
      </div>
    </div>
  )
}
