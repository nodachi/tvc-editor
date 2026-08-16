import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import BulkToolbar from './components/BulkToolbar.jsx'
import StatusBar from './components/StatusBar.jsx'
import ChannelList from './components/ChannelList.jsx'
import EditModal from './components/EditModal.jsx'
import MoveModal from './components/MoveModal.jsx'
import ExportModal from './components/ExportModal.jsx'
import NameFixModal from './components/NameFixModal.jsx'
import ResumeBanner from './components/ResumeBanner.jsx'
import { parseFile, exportFile, renumberSequential } from './parser.js'
import { saveAutosave, loadAutosave, clearAutosave } from './db.js'
import { t as translate } from './i18n.js'

const HISTORY_LIMIT = 50
const AUTOSAVE_DEBOUNCE = 900

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('tce_lang') || 'tr')
  const [theme, setTheme] = useState(localStorage.getItem('tce_theme') || 'dark')

  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState('sdx')
  const [meta, setMeta] = useState({})
  const [channels, setChannels] = useState([])
  const [originalChannels, setOriginalChannels] = useState([])

  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [moveOpen, setMoveOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [nameFixOpen, setNameFixOpen] = useState(false)

  const [resumeInfo, setResumeInfo] = useState(null)
  const [saving, setSaving] = useState(false)
  const autosaveTimer = useRef(null)

  const t = useCallback((k) => translate(lang, k), [lang])

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'theme-light' : ''
    localStorage.setItem('tce_theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('tce_lang', lang) }, [lang])

  // check for resumable session on launch
  useEffect(() => {
    loadAutosave().then((rec) => {
      if (rec && rec.channels && rec.channels.length) setResumeInfo(rec)
    })
  }, [])

  // debounced autosave whenever channels change (after a file is loaded)
  useEffect(() => {
    if (!fileName || channels.length === 0) return
      setSaving(true)
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
        autosaveTimer.current = setTimeout(() => {
          saveAutosave({ fileName, format, meta, channels, originalChannels }).then(() => setSaving(false))
        }, AUTOSAVE_DEBOUNCE)
        return () => clearTimeout(autosaveTimer.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels])

  const loadParsed = (name, fmt, parsedChannels, parsedMeta, keepAsOriginal = true) => {
    setFileName(name)
    setFormat(fmt)
    setMeta(parsedMeta || {})
    setChannels(parsedChannels)
    if (keepAsOriginal) setOriginalChannels(parsedChannels)
      setPast([])
      setFuture([])
      setSelectedIds(new Set())
      setSelectMode(false)
      setSearch('')
  }

  const onOpenFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const buf = reader.result
      // SATCODX .sdx dosyaları genelde Windows-1254 (Türkçe); UTF-8 isimleri bozar
      let content
      if (buf instanceof ArrayBuffer) {
        const lower = (file.name || '').toLowerCase()
        const encoding = lower.endsWith('.sdx') ? 'windows-1254' : 'utf-8'
        try {
          content = new TextDecoder(encoding).decode(buf)
        } catch {
          content = new TextDecoder('utf-8', { fatal: false }).decode(buf)
        }
      } else {
        content = String(buf)
      }
      const result = parseFile(file.name, content)
      loadParsed(file.name, result.format, result.channels, result.meta)
    }
    // Binary oku; encoding'i yukarıda seçiyoruz
    reader.readAsArrayBuffer(file)
  }

  const commit = useCallback((updater) => {
    setChannels((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setPast((p) => {
        const np = [...p, prev]
        return np.length > HISTORY_LIMIT ? np.slice(np.length - HISTORY_LIMIT) : np
      })
      setFuture([])
      return next
    })
  }, [])

  const onUndo = () => {
    setPast((p) => {
      if (p.length === 0) return p
        const prevState = p[p.length - 1]
        setFuture((f) => [channels, ...f])
        setChannels(prevState)
        return p.slice(0, -1)
    })
  }
  const onRedo = () => {
    setFuture((f) => {
      if (f.length === 0) return f
        const nextState = f[0]
        setPast((p) => [...p, channels])
        setChannels(nextState)
        return f.slice(1)
    })
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return channels
      const q = search.trim().toLowerCase()
      return channels.filter((c) => c.name.toLowerCase().includes(q) || String(c.number).includes(q))
  }, [channels, search])

  const uncertainCount = useMemo(() => channels.filter((c) => c._uncertain).length, [channels])

  // ---- selection ----
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const onLongPressSelect = (id) => {
    setSelectMode(true)
    setSelectedIds((prev) => new Set(prev).add(id))
  }
  const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c.id)))
  const deselectAll = () => setSelectedIds(new Set())
  const selectEncrypted = () => {
    const ids = filtered.filter((c) => c.encrypted === true).map((c) => c.id)
    setSelectedIds(new Set(ids))
  }
  const selectRadio = () => setSelectedIds(new Set(filtered.filter((c) => c.type === 'RADIO').map((c) => c.id)))
  const selectTV = () => setSelectedIds(new Set(filtered.filter((c) => c.type === 'TV').map((c) => c.id)))

  // ---- single edit ----
  const editingChannel = channels.find((c) => c.id === editingId) || null
  const onSaveEdit = (id, patch) => {
    commit((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, _edited: true } : c)))
    setEditingId(null)
  }
  const onDeleteOne = (id) => {
    commit((prev) => prev.filter((c) => c.id !== id))
    setEditingId(null)
  }

  // ---- bulk actions ----
  const onBulkDelete = () => {
    if (selectedIds.size === 0) return
      const count = selectedIds.size
      if (!window.confirm(`${count} ${t('deleteConfirm')}`)) return
        commit((prev) => {
          const remaining = prev.filter((c) => !selectedIds.has(c.id))
          return remaining.map((c, i) => ({ ...c, number: i + 1 }))
        })
        setSelectedIds(new Set())
  }

  const onBulkMove = (targetPos) => {
    commit((prev) => {
      const selected = prev.filter((c) => selectedIds.has(c.id))
      const rest = prev.filter((c) => !selectedIds.has(c.id))
      const idx = Math.max(0, Math.min(targetPos - 1, rest.length))
      const merged = [...rest.slice(0, idx), ...selected, ...rest.slice(idx)]
      return merged.map((c, i) => ({ ...c, number: i + 1 }))
    })
    setMoveOpen(false)
    setSelectedIds(new Set())
  }

  // ---- reset to original ----
  const onReset = () => {
    if (!window.confirm(t('resetConfirm'))) return
      commit(() => originalChannels)
      setSelectedIds(new Set())
  }

  // ---- name-fix (fixed-width column adjuster) ----
  const sampleRawLines = useMemo(
    () => channels.slice(0, 6).map((c) => c.raw).filter(Boolean),
                                 [channels]
  )
  const applyColumnFix = ({ start, end }) => {
    const raw = channels.map((c) => c.raw).join('\n')
    const result = parseFile(fileName, raw)
    if (result.format === 'sdx') {
      const reparsed = channels.map((c, i) => {
        const name = (c.raw || '').slice(start, end).trim() || c.name
        return { ...c, name, _mode: 'fixed', _columnMap: { start, end }, _uncertain: false }
      })
      commit(() => reparsed)
      setMeta((m) => ({ ...m, columnMap: { start, end } }))
    }
    setNameFixOpen(false)
  }

  // ---- export ----
  const onExport = (fmt, renumber) => {
    const dataChannels = renumber ? renumberSequential(channels) : channels
    const content = exportFile(fmt, dataChannels, meta)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const base = (fileName || 'channels').replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = url
    a.download = `${base}_edited.${fmt}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  // ---- resume / discard ----
  const onResumeSession = () => {
    if (!resumeInfo) return
      loadParsed(resumeInfo.fileName, resumeInfo.format, resumeInfo.channels, resumeInfo.meta, false)
      setOriginalChannels(resumeInfo.originalChannels || resumeInfo.channels)
      setResumeInfo(null)
  }
  const onDiscardSession = () => {
    clearAutosave()
    setResumeInfo(null)
  }

  return (
    <div className="flex flex-col h-full bg-base-950">
    <TopBar
    t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
    fileName={fileName} onOpenFile={onOpenFile}
    canUndo={past.length > 0} canRedo={future.length > 0} onUndo={onUndo} onRedo={onRedo}
    search={search} setSearch={setSearch}
    selectMode={selectMode}
    onToggleSelectMode={() => { setSelectMode((s) => !s); setSelectedIds(new Set()) }}
    hasChannels={channels.length > 0}
    onExportClick={() => setExportOpen(true)}
    />

    {channels.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-slate-500">
      <p className="text-sm">{t('dropHint')}</p>
      </div>
    ) : (
      <ChannelList
      channels={filtered}
      selectMode={selectMode}
      selectedIds={selectedIds}
      onToggle={toggleSelect}
      onEdit={(id) => setEditingId(id)}
      onLongPressSelect={onLongPressSelect}
      t={t}
      />
    )}

    {channels.length > 0 && uncertainCount > 0 && (
      <button
      onClick={() => setNameFixOpen(true)}
      className="mx-3 mb-2 text-left text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2"
      >
      ⚠ {uncertainCount} {t('parseWarning')} — {t('nameFixTitle')}
      </button>
    )}

    {channels.length > 0 && (
      <StatusBar
      t={t}
      total={channels.length}
      filtered={filtered.length}
      saving={saving}
      onReset={onReset}
      canReset={originalChannels.length > 0}
      />
    )}

    {selectMode && (
      <BulkToolbar
      t={t}
      count={selectedIds.size}
      onSelectAll={selectAll}
      onDeselectAll={deselectAll}
      onSelectTV={selectTV}
      onSelectRadio={selectRadio}
      onSelectEncrypted={selectEncrypted}
      onMove={() => setMoveOpen(true)}
      onDelete={onBulkDelete}
      onClear={() => setSelectedIds(new Set())}
      />
    )}

    <EditModal
    t={t}
    channel={editingChannel}
    onSave={onSaveEdit}
    onDelete={onDeleteOne}
    onClose={() => setEditingId(null)}
    />
    <MoveModal
    t={t}
    open={moveOpen}
    max={channels.length}
    onConfirm={onBulkMove}
    onClose={() => setMoveOpen(false)}
    />
    <ExportModal
    t={t}
    open={exportOpen}
    defaultFormat={format}
    onExport={onExport}
    onClose={() => setExportOpen(false)}
    />
    <NameFixModal
    t={t}
    open={nameFixOpen}
    sampleLines={sampleRawLines}
    initialStart={meta.columnMap?.start}
    initialEnd={meta.columnMap?.end}
    onApply={applyColumnFix}
    onClose={() => setNameFixOpen(false)}
    />
    <ResumeBanner
    t={t}
    info={resumeInfo}
    onResume={onResumeSession}
    onDiscard={onDiscardSession}
    />
    </div>
  )
}
