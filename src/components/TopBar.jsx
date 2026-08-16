import React, { useRef } from 'react'

export default function TopBar({
  t, lang, setLang, theme, setTheme,
  fileName, onOpenFile,
  canUndo, canRedo, onUndo, onRedo,
  search, setSearch,
  selectMode, onToggleSelectMode,
  hasChannels, onExportClick,
}) {
  const inputRef = useRef(null)

  return (
    <div className="sticky top-0 z-20 bg-base-900/95 backdrop-blur border-b border-base-700 shadow-md" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => inputRef.current?.click()}
          className="min-h-[44px] px-4 rounded-xl bg-sky-600 active:bg-sky-700 text-white font-medium text-sm shrink-0 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          {t('openFile')}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".sdx,.xml,.json,text/plain,application/xml,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onOpenFile(f)
            e.target.value = ''
          }}
        />
        <div className="flex-1 min-w-0 text-xs text-slate-400 truncate font-mono px-1">
          {fileName || t('noFile')}
        </div>
        <button
          disabled={!canUndo}
          onClick={onUndo}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-base-800 disabled:opacity-30 active:bg-base-700 text-slate-200 text-xl shrink-0 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          aria-label={t('undo')}
        >
          ↶
        </button>
        <button
          disabled={!canRedo}
          onClick={onRedo}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-base-800 disabled:opacity-30 active:bg-base-700 text-slate-200 text-xl shrink-0 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          aria-label={t('redo')}
        >
          ↷
        </button>
      </div>

      {hasChannels && (
        <div className="flex items-center gap-2 px-3 pb-2.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-base-850 border border-base-700 text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <button
            onClick={onToggleSelectMode}
            className={`min-h-[44px] px-3.5 rounded-xl text-sm font-semibold shrink-0 transition-all active:scale-95 ${
              selectMode ? 'bg-sky-600 text-white' : 'bg-base-800 text-slate-200'
            }`}
          >
            {selectMode ? t('exitSelectMode') : t('selectMode')}
          </button>
          <button
            onClick={onExportClick}
            className="min-h-[44px] px-3.5 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold shrink-0 shadow-sm active:scale-95 transition-transform"
          >
            {t('export')}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 pb-2 text-xs">
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          className="min-h-[36px] px-3 rounded-lg bg-base-850 text-slate-300 border border-base-700 font-medium active:scale-95 transition-transform"
        >
          {lang === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="min-h-[36px] px-3 rounded-lg bg-base-850 text-slate-300 border border-base-700 font-medium active:scale-95 transition-transform"
        >
          {theme === 'dark' ? `🌙 ${t('dark')}` : `☀️ ${t('light')}`}
        </button>
      </div>
    </div>
  )
}
