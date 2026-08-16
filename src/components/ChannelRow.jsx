import React, { useRef } from 'react'

function TypeBadge({ type, t }) {
  const isRadio = type === 'RADIO'
  return (
    <span
      className={`text-xs font-mono px-2 py-1 rounded shrink-0 ${
        isRadio ? 'bg-violet-500/20 text-violet-300' : 'bg-sky-500/20 text-sky-300'
      }`}
    >
      {isRadio ? t('radio') : t('tv')}
    </span>
  )
}

export default function ChannelRow({ style, channel, selectMode, selected, onToggle, onEdit, onLongPressSelect, t }) {
  const timerRef = useRef(null)
  const isLongPressRef = useRef(false)

  const handleTouchStart = () => {
    isLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      if (navigator.vibrate) {
        try { navigator.vibrate(50) } catch (e) {}
      }
      onLongPressSelect(channel.id)
    }, 450)
  }

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const handleClick = (e) => {
    if (isLongPressRef.current) {
      e.preventDefault()
      e.stopPropagation()
      isLongPressRef.current = false
      return
    }
    if (selectMode) {
      onToggle(channel.id)
    } else {
      onEdit(channel.id)
    }
  }

  return (
    <div
      style={style}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 border-b border-base-800 active:bg-base-800/80 transition-colors select-none touch-manipulation cursor-pointer ${
        selected ? 'bg-sky-500/15 border-l-4 border-l-sky-500' : ''
      }`}
    >
      {selectMode && (
        <div 
          className="flex items-center justify-center p-2 -ml-2 shrink-0 touch-target"
          onClick={(e) => {
            e.stopPropagation()
            onToggle(channel.id)
          }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => {}}
            className="w-6 h-6 shrink-0 accent-sky-500 cursor-pointer pointer-events-none"
          />
        </div>
      )}
      <span className="font-mono text-sm font-semibold text-slate-400 w-12 shrink-0 text-right tabular-nums">
        {channel.number}
      </span>
      <div className="flex-1 min-w-0 py-2">
        <div className="truncate text-base font-medium text-slate-100 leading-snug">{channel.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {channel._uncertain && (
            <span className="text-xs text-amber-400 font-bold">⚠</span>
          )}
          {channel.satellite && (
            <span className="text-xs text-slate-400 truncate font-mono">{channel.satellite}</span>
          )}
        </div>
      </div>
      <TypeBadge type={channel.type} t={t} />
      {channel.encrypted === true && (
        <span className="text-xs font-mono px-2 py-1 rounded bg-rose-500/20 text-rose-300 shrink-0">🔒</span>
      )}
    </div>
  )
}
