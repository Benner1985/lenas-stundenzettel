import type { Rule } from '../types'
import { BLOCKS } from '../data/blocks'

// Die "Hut-Automatik": ordnet eine Tätigkeit einem Block zu.
// Zuerst zählen die von Lena gelernten Regeln, danach die Stichworte
// der Blöcke. Ist nichts eindeutig, wandert der Eintrag in "Welcher Hut?".

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFC').trim()
}

export interface Suggestion {
  blockId: string | null
  /** true = sicher genug, um automatisch zuzuordnen. */
  confident: boolean
  /** Woher kam der Vorschlag? */
  via: 'rule' | 'keyword' | 'none'
}

export function suggestBlock(title: string, rules: Rule[]): Suggestion {
  const text = normalize(title)
  if (!text) return { blockId: null, confident: false, via: 'none' }

  // 1) Gelernte Regeln – Lenas eigene Antworten gewinnen immer.
  const ruleHit = rules
    .filter((r) => text.includes(r.keyword))
    .sort((a, b) => b.keyword.length - a.keyword.length || b.count - a.count)[0]
  if (ruleHit) {
    return { blockId: ruleHit.blockId, confident: true, via: 'rule' }
  }

  // 2) Stichworte der Blöcke. Nur eindeutig, wenn genau ein Block passt.
  const matches = BLOCKS.filter((b) =>
    b.keywords.some((kw) => text.includes(normalize(kw))),
  )
  if (matches.length === 1) {
    return { blockId: matches[0].id, confident: true, via: 'keyword' }
  }
  if (matches.length > 1) {
    // mehrere Kandidaten → Vorschlag zeigen, aber nachfragen
    return { blockId: matches[0].id, confident: false, via: 'keyword' }
  }

  return { blockId: null, confident: false, via: 'none' }
}

/** Lernt aus einer beantworteten Fragekarte eine neue Regel. */
export function learnRule(rules: Rule[], title: string, blockId: string): Rule[] {
  const keyword = normalize(title)
  if (!keyword) return rules
  const next = rules.map((r) => ({ ...r }))
  const existing = next.find((r) => r.keyword === keyword)
  if (existing) {
    existing.blockId = blockId
    existing.count += 1
    return next
  }
  next.push({ keyword, blockId, count: 1 })
  return next
}
