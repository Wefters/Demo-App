<template>
  <WebCard
    icon="Database"
    title="Web storage"
    desc="localStorage and IndexedDB keep their data between launches; sessionStorage lasts until the app closes."
  >
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="px-2 py-3 bg-surface-raised rounded-xl">
        <div class="text-xl font-bold text-text-primary">{{ visits }}</div>
        <div class="text-[11px] text-text-muted">localStorage visits</div>
      </div>
      <div class="px-2 py-3 bg-surface-raised rounded-xl">
        <div class="text-xl font-bold text-text-primary">{{ sessionVisits }}</div>
        <div class="text-[11px] text-text-muted">sessionStorage visits</div>
      </div>
      <div class="px-2 py-3 bg-surface-raised rounded-xl">
        <div class="text-xl font-bold text-text-primary">{{ notes }}</div>
        <div class="text-[11px] text-text-muted">IndexedDB notes</div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button :class="secondaryButton" @click="addNote">
        <Icons name="Database" :size="15" />
        <span>Add a note</span>
      </button>
      <button :class="secondaryButton" @click="reset">
        <Icons name="Trash2" :size="15" />
        <span>Reset</span>
      </button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of web storage: visit counters in localStorage and sessionStorage, and notes in IndexedDB. */

import { onMounted, ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logError, logSuccess } from './webLog'

const VISITS_KEY = 'wefter-demo:web-visits'
const visits = ref(0)
const sessionVisits = ref(0)
const notes = ref(0)

/** Increments a counter in `storage`, returning the new value (0 when the storage is unavailable). */
function bump(storage: Storage): number {
  try {
    const next = Number(storage.getItem(VISITS_KEY) ?? 0) + 1
    storage.setItem(VISITS_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

/** Opens the notes database, creating its store the first time. */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('wefter-demo', 1)
    request.onupgradeneeded = () =>
      request.result.createObjectStore('notes', { autoIncrement: true })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Runs `action` on the notes store and resolves with its result. */
async function withNotes<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = action(db.transaction('notes', mode).objectStore('notes'))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function countNotes() {
  notes.value = await withNotes('readonly', (store) => store.count())
}

async function addNote() {
  try {
    await withNotes('readwrite', (store) =>
      store.add({ text: 'Hello from IndexedDB', at: Date.now() }),
    )
    await countNotes()
    logSuccess('indexedDB add', { notes: notes.value })
  } catch (error) {
    logError('indexedDB add', error)
  }
}

async function reset() {
  try {
    localStorage.removeItem(VISITS_KEY)
    sessionStorage.removeItem(VISITS_KEY)
    await withNotes('readwrite', (store) => store.clear())
    visits.value = 0
    sessionVisits.value = 0
    notes.value = 0
    logSuccess('web storage reset', {})
  } catch (error) {
    logError('web storage reset', error)
  }
}

onMounted(async () => {
  visits.value = bump(localStorage)
  sessionVisits.value = bump(sessionStorage)
  try {
    await countNotes()
  } catch (error) {
    logError('indexedDB open', error)
  }
  logSuccess('web storage', {
    localStorage: visits.value,
    sessionStorage: sessionVisits.value,
    notes: notes.value,
  })
})
</script>
