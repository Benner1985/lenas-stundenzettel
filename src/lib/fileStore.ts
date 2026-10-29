// Speichert Lenas Excel-Vorlage lokal auf dem Gerät (IndexedDB).
// Die Datei verlässt das Gerät nie – sie wird nicht hochgeladen und ist
// nirgends öffentlich. So muss Lena ihre Datei nur EINMAL auswählen.

const DB_NAME = 'lenas-stundenzettel'
const STORE = 'files'
const KEY = 'excel-vorlage'

export interface StoredFile {
  name: string
  data: ArrayBuffer
  savedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveTemplate(name: string, data: ArrayBuffer): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ name, data, savedAt: Date.now() }, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadTemplate(): Promise<StoredFile | null> {
  try {
    const db = await openDB()
    const result = await new Promise<StoredFile | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve((req.result as StoredFile) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result
  } catch {
    return null
  }
}

export async function clearTemplate(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
    db.close()
  } catch {
    // ignorieren
  }
}
