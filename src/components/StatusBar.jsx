import React from 'react'

export default function StatusBar({ t, total, filtered, saving, onReset, canReset }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-base-900 border-t border-base-800 text-[11px] text-slate-500">
      <div className="flex items-center gap-3 font-mono">
        <span>{t('totalChannels')}: {total}</span>
        {filtered !== total && <span>{t('filtered')}: {filtered}</span>}
      </div>
      <div className="flex items-center gap-2">
        {canReset && (
          <button onClick={onReset} className="text-amber-400/80 underline underline-offset-2">
            {t('resetOriginal')}
          </button>
        )}
        <span className={saving ? 'text-amber-400' : 'text-emerald-400'}>
          {saving ? t('saving') : t('savedLocally')}
        </span>
      </div>
    </div>
  )
}
