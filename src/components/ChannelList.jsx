import React, { useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import ChannelRow from './ChannelRow.jsx'

const ROW_HEIGHT = 60
export { ROW_HEIGHT }

export default function ChannelList({
  channels, selectMode, selectedIds, onToggle, onEdit, onLongPressSelect, t,
  reorderMode, dragId, onDragStart, outerRef, listRef,
}) {
  const containerRef = useRef(null)
  const [height, setHeight] = useState(400)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setHeight(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (channels.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        {t('noResults')}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 min-h-0">
      <FixedSizeList
        ref={listRef}
        outerRef={outerRef}
        height={height}
        width="100%"
        itemCount={channels.length}
        itemSize={ROW_HEIGHT}
        overscanCount={8}
      >
        {({ index, style }) => {
          const channel = channels[index]
          return (
            <ChannelRow
              key={channel.id}
              style={style}
              channel={channel}
              selectMode={selectMode}
              selected={selectedIds.has(channel.id)}
              onToggle={onToggle}
              onEdit={onEdit}
              onLongPressSelect={onLongPressSelect}
              t={t}
              reorderMode={reorderMode}
              dragging={dragId === channel.id}
              onDragStart={onDragStart}
            />
          )
        }}
      </FixedSizeList>
    </div>
  )
}
