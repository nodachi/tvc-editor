import React, { useRef } from 'react'

export default function TopBar({
  t, lang, setLang, theme, setTheme,
  fileName, onOpenFile,
  canUndo, canRedo, onUndo, onRedo,
  search, setSearch,
  selectMode, onToggleSelectMode,
  reorderMode, onToggleReorderMode,
  hasChannels, onExportClick,
}) {
  const inputRef = useRef(null)

  return (
    <div className="sticky top-0 z-20 bg-base-900/95 backdrop-blur border-b border-base-700" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="touch-target px-3 rounded-lg bg-sky-600 active:bg-sky-700 text-sm font-medium shrink-0"
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
        <div className="flex-1 min-w-0 text-xs text-slate-400 truncate font-mono">
          {fileName || t('noFile')}
        </div>
        <button
          disabled={!canUndo}
          onClick={onUndo}
          className="touch-target w-11 rounded-lg bg-base-800 disabled:opacity-30 active:bg-base-700 text-lg shrink-0"
          aria-label={t('undo')}
        >
          ↶
        </button>
        <button
          disabled={!canRedo}
          onClick={onRedo}
          className="touch-target w-11 rounded-lg bg-base-800 disabled:opacity-30 active:bg-base-700 text-lg shrink-0"
          aria-label={t('redo')}
        >
          ↷
        </button>
      </div>

      {hasChannels && (
        <div className="flex items-center gap-2 px-3 pb-2">
          {reorderMode ? (
            <>
              <div className="flex-1 text-xs text-sky-400 px-1">↕ {t('dragHint')}</div>
              <button
                onClick={onToggleReorderMode}
                className="touch-target px-3 rounded-lg bg-sky-600 text-sm font-medium shrink-0"
              >
                {t('exitReorderMode')}
              </button>
            </>
          ) : (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search')}
                className="flex-1 touch-target px-3 rounded-lg bg-base-850 border border-base-700 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {!selectMode && (
                <button
                  onClick={onToggleReorderMode}
                  disabled={!!search.trim()}
                  title={search.trim() ? t('reorderDisabledSearch') : undefined}
                  className="touch-target w-11 rounded-lg bg-base-800 disabled:opacity-30 active:bg-base-700 text-lg shrink-0"
                  aria-label={t('reorderMode')}
                >
                  ↕
                </button>
              )}
              <button
                onClick={onToggleSelectMode}
                className={`touch-target px-3 rounded-lg text-sm font-medium shrink-0 ${
                  selectMode ? 'bg-sky-600' : 'bg-base-800'
                }`}
              >
                {selectMode ? t('exitSelectMode') : t('selectMode')}
              </button>
              <button
                onClick={onExportClick}
                className="touch-target px-3 rounded-lg bg-emerald-600 active:bg-emerald-700 text-sm font-medium shrink-0"
              >
                {t('export')}
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 px-3 pb-2 text-xs">
        <button
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
          className="px-2 py-1 rounded bg-base-850 text-slate-400 border border-base-700"
        >
          {lang === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-2 py-1 rounded bg-base-850 text-slate-400 border border-base-700"
        >
          {theme === 'dark' ? `🌙 ${t('dark')}` : `☀️ ${t('light')}`}
        </button>
      </div>
    </div>
  )
}
