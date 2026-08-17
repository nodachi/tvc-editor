import React, { useRef } from 'react'

function TypeBadge({ type, t }) {
  const isRadio = type === 'RADIO'
  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
        isRadio ? 'bg-violet-500/20 text-violet-300' : 'bg-sky-500/20 text-sky-300'
      }`}
    >
      {isRadio ? t('radio') : t('tv')}
    </span>
  )
}

export default function ChannelRow({
  style, channel, selectMode, selected, onToggle, onEdit, onLongPressSelect, t,
  reorderMode, dragging, onDragStart,
}) {
  const timerRef = useRef(null)

  const handleTouchStart = () => {
    if (reorderMode) return
    timerRef.current = setTimeout(() => onLongPressSelect(channel.id), 420)
  }
  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const handleRowClick = () => {
    if (reorderMode) return
    if (selectMode) onToggle(channel.id)
    else onEdit(channel.id)
  }

  return (
    <div
      style={style}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      onClick={handleRowClick}
      className={`flex items-center gap-3 px-3 border-b border-base-800 touch-target ${
        reorderMode ? '' : 'active:bg-base-800/60'
      } ${selected ? 'bg-sky-500/10' : ''} ${
        dragging ? 'bg-base-800 shadow-lg ring-1 ring-sky-500 z-10 opacity-95 scale-[1.01]' : ''
      }`}
    >
      {selectMode && !reorderMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(channel.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 shrink-0 accent-sky-500"
        />
      )}
      <span className="font-mono text-xs text-slate-500 w-10 shrink-0 text-right tabular-nums">
        {channel.number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm text-slate-100 leading-tight">{channel.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {channel._uncertain && (
            <span className="text-[10px] text-amber-400">⚠</span>
          )}
          {channel.satellite && (
            <span className="text-[10px] text-slate-500 truncate font-mono">{channel.satellite}</span>
          )}
        </div>
      </div>
      <TypeBadge type={channel.type} t={t} />
      {channel.encrypted === true && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">🔒</span>
      )}
      {reorderMode && (
        <button
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDragStart(channel.id, e.clientY, e.pointerId, e.currentTarget)
          }}
          className="shrink-0 w-11 h-11 -mr-2 flex items-center justify-center text-slate-400 text-xl cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          aria-label="drag"
        >
          ⠿
        </button>
      )}
    </div>
  )
}
