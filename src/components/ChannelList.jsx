import React, { useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import ChannelRow from './ChannelRow.jsx'

const ROW_HEIGHT = 68

export default function ChannelList({ channels, selectMode, selectedIds, onToggle, onEdit, onLongPressSelect, t }) {
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
      <div ref={containerRef} className="flex-1 flex items-center justify-center text-slate-500 text-base p-4 text-center">
        {t('noResults')}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 min-h-0 w-full overflow-hidden">
      <FixedSizeList
        height={height}
        width="100%"
        itemCount={channels.length}
        itemSize={ROW_HEIGHT}
        overscanCount={10}
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
            />
          )
        }}
      </FixedSizeList>
    </div>
  )
}
