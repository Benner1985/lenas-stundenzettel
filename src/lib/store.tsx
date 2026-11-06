import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Entry, Rule, WeekGoal } from '../types'
import { SEED_ENTRIES } from '../data/seed'
import { DEFAULT_GOAL } from './week'
import { learnRule, suggestBlock } from './rules'
import { supabase, DOC_ID, TABLE } from './supabase'

// Zentraler, einfacher Zustand der App. Alles liegt lokal im Browser
// (localStorage), damit der Prototyp ohne Server funktioniert.

// v3: sauberer Fresh Start – alte lokale Stände werden verworfen
const STORAGE_KEY = 'lenas-stundenzettel.v3'

interface State {
  entries: Entry[]
  rules: Rule[]
  goal: WeekGoal
}

type Action =
  | { type: 'addEntry'; entry: Omit<Entry, 'id'> }
  | { type: 'updateEntry'; id: string; patch: Partial<Entry> }
  | { type: 'removeEntry'; id: string }
  | { type: 'answerQuestion'; id: string; blockId: string; always: boolean }
  | { type: 'setGoal'; goal: WeekGoal }
  | { type: 'addRule'; keyword: string; blockId: string }
  | { type: 'removeRule'; keyword: string }
  | { type: 'clearEntries' }
  | { type: 'hydrate'; data: Partial<State> }
  | { type: 'hydrateMerge'; data: Partial<State> }

function uid(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const INITIAL: State = { entries: SEED_ENTRIES, rules: [], goal: DEFAULT_GOAL }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addEntry': {
      const entry: Entry = { ...action.entry, id: uid() }
      return { ...state, entries: [...state.entries, entry] }
    }
    case 'updateEntry': {
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e,
        ),
      }
    }
    case 'removeEntry': {
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) }
    }
    case 'answerQuestion': {
      const entry = state.entries.find((e) => e.id === action.id)
      const rules = action.always && entry
        ? learnRule(state.rules, entry.title, action.blockId)
        : state.rules
      return {
        ...state,
        rules,
        entries: state.entries.map((e) =>
          e.id === action.id
            ? { ...e, blockId: action.blockId, needsReview: false }
            : e,
        ),
      }
    }
    case 'setGoal':
      return { ...state, goal: action.goal }
    case 'addRule':
      return { ...state, rules: learnRule(state.rules, action.keyword, action.blockId) }
    case 'removeRule':
      return {
        ...state,
        rules: state.rules.filter((r) => r.keyword !== action.keyword.toLowerCase().trim()),
      }
    case 'clearEntries':
      return { ...state, entries: [] }
    case 'hydrate':
      // Stand aus der Cloud übernehmen (Live-Update eines anderen Geräts)
      return {
        entries: action.data.entries ?? [],
        rules: action.data.rules ?? [],
        goal: action.data.goal ?? state.goal,
      }
    case 'hydrateMerge': {
      // Beim Start: lokalen Stand und Cloud ZUSAMMENFÜHREN (nichts geht verloren)
      const byId = new Map(state.entries.map((e) => [e.id, e]))
      for (const e of action.data.entries ?? []) byId.set(e.id, e)
      const rmap = new Map(state.rules.map((r) => [r.keyword, r]))
      for (const r of action.data.rules ?? []) rmap.set(r.keyword, r)
      return {
        entries: [...byId.values()],
        rules: [...rmap.values()],
        goal: action.data.goal ?? state.goal,
      }
    }
    default:
      return state
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>
      // mit Vorgaben zusammenführen (ältere Stände kennen z. B. goal nicht)
      return {
        entries: parsed.entries ?? SEED_ENTRIES,
        rules: parsed.rules ?? [],
        goal: parsed.goal ?? DEFAULT_GOAL,
      }
    }
  } catch {
    // ignorieren – privater Modus o. Ä.
  }
  return INITIAL
}

interface StoreValue extends State {
  addEntry: (entry: Omit<Entry, 'id'>) => void
  updateEntry: (id: string, patch: Partial<Entry>) => void
  removeEntry: (id: string) => void
  answerQuestion: (id: string, blockId: string, always: boolean) => void
  setGoal: (goal: WeekGoal) => void
  addRule: (keyword: string, blockId: string) => void
  removeRule: (keyword: string) => void
  clearEntries: () => void
  /** Offene "Welcher Hut?"-Fragen, älteste zuerst. */
  openQuestions: Entry[]
  /** Automatik-Vorschlag für einen freien Text. */
  suggest: (title: string) => ReturnType<typeof suggestBlock>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  // true, sobald der erste Stand aus der Cloud geladen wurde
  const [ready, setReady] = useState(false)
  // zuletzt mit der Cloud abgeglichener Inhalt (verhindert Echo-Schleifen)
  const echoRef = useRef<string>('')
  // Kennung dieses Geräts/Tabs – um eigene Schreibvorgänge zu erkennen
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2))
  // Echtzeit-Ereignisse erst nach dem ersten Laden/Zusammenführen zulassen
  const initialDoneRef = useRef(false)

  // Immer lokal sichern (Offline-Puffer)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Speichern nicht möglich – App läuft trotzdem weiter.
    }
  }, [state])

  // nur die inhaltlichen Felder vergleichen (ohne Geräte-Kennung)
  function contentOf(d: { entries?: unknown; rules?: unknown; goal?: unknown }): string {
    return JSON.stringify({ entries: d.entries, rules: d.rules, goal: d.goal })
  }

  // 1) Beim Start: Stand aus der Cloud laden + auf Änderungen horchen
  useEffect(() => {
    let active = true
    supabase
      .from(TABLE)
      .select('data')
      .eq('id', DOC_ID)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        if (data?.data) {
          // Start: lokalen Stand mit der Cloud zusammenführen (kein Datenverlust)
          echoRef.current = contentOf(data.data)
          dispatch({ type: 'hydrateMerge', data: data.data as Partial<State> })
        }
      })
      .then(() => {
        if (!active) return
        initialDoneRef.current = true
        setReady(true)
      })

    const channel = supabase
      .channel(`app_data_${DOC_ID}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${DOC_ID}` },
        (payload) => {
          if (!initialDoneRef.current) return // erst nach dem ersten Laden/Merge
          const remote = (payload.new as { data?: Record<string, unknown> })?.data
          if (!remote) return
          if (remote.client === clientIdRef.current) return // eigenes Echo
          const content = contentOf(remote)
          if (content === echoRef.current) return // inhaltlich nichts Neues
          echoRef.current = content
          dispatch({ type: 'hydrate', data: remote as Partial<State> })
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  // 2) Änderungen in die Cloud schreiben (erst nach dem ersten Laden)
  useEffect(() => {
    if (!ready) return
    const content = contentOf(state)
    if (content === echoRef.current) return // nichts Neues gegenüber dem letzten Sync
    const timer = setTimeout(() => {
      echoRef.current = content
      supabase
        .from(TABLE)
        .upsert({
          id: DOC_ID,
          data: {
            entries: state.entries,
            rules: state.rules,
            goal: state.goal,
            client: clientIdRef.current,
          },
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          // offline o. Ä. – lokaler Stand bleibt; nächster Upsert schreibt alles erneut
          if (error) echoRef.current = ''
        })
    }, 500)
    return () => clearTimeout(timer)
  }, [state, ready])

  const value = useMemo<StoreValue>(() => {
    const openQuestions = state.entries
      .filter((e) => e.needsReview)
      .sort((a, b) => a.date.localeCompare(b.date))
    return {
      ...state,
      openQuestions,
      addEntry: (entry) => dispatch({ type: 'addEntry', entry }),
      updateEntry: (id, patch) => dispatch({ type: 'updateEntry', id, patch }),
      removeEntry: (id) => dispatch({ type: 'removeEntry', id }),
      answerQuestion: (id, blockId, always) =>
        dispatch({ type: 'answerQuestion', id, blockId, always }),
      setGoal: (goal) => dispatch({ type: 'setGoal', goal }),
      addRule: (keyword, blockId) => dispatch({ type: 'addRule', keyword, blockId }),
      removeRule: (keyword) => dispatch({ type: 'removeRule', keyword }),
      clearEntries: () => dispatch({ type: 'clearEntries' }),
      suggest: (title) => suggestBlock(title, state.rules),
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore muss innerhalb von <StoreProvider> stehen')
  return ctx
}
