import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Entry, Rule } from '../types'
import { SEED_ENTRIES } from '../data/seed'
import { learnRule, suggestBlock } from './rules'

// Zentraler, einfacher Zustand der App. Alles liegt lokal im Browser
// (localStorage), damit der Prototyp ohne Server funktioniert.

const STORAGE_KEY = 'lenas-stundenzettel.v1'

interface State {
  entries: Entry[]
  rules: Rule[]
}

type Action =
  | { type: 'addEntry'; entry: Omit<Entry, 'id'> }
  | { type: 'updateEntry'; id: string; patch: Partial<Entry> }
  | { type: 'removeEntry'; id: string }
  | { type: 'answerQuestion'; id: string; blockId: string; always: boolean }
  | { type: 'reset' }

function uid(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const INITIAL: State = { entries: SEED_ENTRIES, rules: [] }

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
        rules,
        entries: state.entries.map((e) =>
          e.id === action.id
            ? { ...e, blockId: action.blockId, needsReview: false }
            : e,
        ),
      }
    }
    case 'reset':
      return INITIAL
    default:
      return state
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
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
  reset: () => void
  /** Offene "Welcher Hut?"-Fragen, älteste zuerst. */
  openQuestions: Entry[]
  /** Automatik-Vorschlag für einen freien Text. */
  suggest: (title: string) => ReturnType<typeof suggestBlock>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Speichern nicht möglich – App läuft trotzdem weiter.
    }
  }, [state])

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
      reset: () => dispatch({ type: 'reset' }),
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
