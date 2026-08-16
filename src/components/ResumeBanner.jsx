import React from 'react'

export default function ResumeBanner({ t, info, onResume, onDiscard }) {
  if (!info) return null
  const time = new Date(info.timestamp).toLocaleString()
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm bg-base-900 border border-base-700 rounded-2xl p-5">
        <h3 className="text-base font-semibold mb-1">{t('resumeTitle')}</h3>
        <p className="text-xs text-slate-400 mb-1">{info.fileName}</p>
        <p className="text-xs text-slate-500 mb-4">{t('resumeBody')} {time}</p>
        <div className="flex gap-2">
          <button onClick={onDiscard} className="flex-1 touch-target rounded-lg bg-base-800 text-sm font-medium">
            {t('discardBtn')}
          </button>
          <button onClick={onResume} className="flex-1 touch-target rounded-lg bg-sky-600 text-sm font-medium">
            {t('resumeBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
