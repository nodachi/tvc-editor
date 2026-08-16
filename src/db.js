import Dexie from 'dexie'

export const db = new Dexie('tv-channel-editor')
db.version(1).stores({
  autosave: 'id', // single row keyed 'current'
})

export async function saveAutosave(state) {
  await db.autosave.put({ id: 'current', ...state, timestamp: Date.now() })
}

export async function loadAutosave() {
  return db.autosave.get('current')
}

export async function clearAutosave() {
  await db.autosave.delete('current')
}
