import type { Block } from '../types'

// Lenas Hüte – abgeleitet aus den Kürzel-Kärtchen der Konzeptskizze.
// Reihenfolge wie im Notizbuch: BioZ zuerst, dann die ÖMR-Blöcke.
export const BLOCKS: Block[] = [
  {
    id: 'BZ',
    name: 'BioZ / TW',
    hint: 'hinten · Podcast, Zeitung, TW 2.0, Simon, Bio auf der Wiesn, Verbundpartner',
    color: '#16a34a',
    isBioZ: true,
    keywords: [
      'podcast',
      'zeitung',
      'tw 2.0',
      'tw',
      'simon',
      'bio auf der wiesn',
      'wiesn',
      'verbundpartner',
      'bioz',
    ],
  },
  {
    id: 'Ö1',
    name: 'Koordination',
    hint: 'Lenkungskreis, Team, Abrechnung, Arbeitstreffen',
    color: '#1d4ed8',
    isBioZ: false,
    keywords: ['lenkungskreis', 'team', 'abrechnung', 'arbeitstreffen', 'koordination'],
  },
  {
    id: 'Ö2',
    name: 'bio-regional',
    hint: 'AHV, Kisterl, Byodo, Barnhouse',
    color: '#d97706',
    isBioZ: false,
    keywords: ['ahv', 'kisterl', 'kisterl', 'byodo', 'barnhouse', 'bio-regional', 'bioregional'],
  },
  {
    id: 'Ö3',
    name: 'Wertschöpfung',
    hint: 'WSK, Verarbeitung',
    color: '#7c3aed',
    isBioZ: false,
    keywords: ['wsk', 'verarbeitung', 'wertschöpfung', 'kartoffel', 'kartoffeln'],
  },
  {
    id: 'Ö4',
    name: 'Kommunen / ÖA',
    hint: 'bioregio, BioRegioTour, Presse, Homepage, Schulen',
    color: '#e11d48',
    isBioZ: false,
    keywords: [
      'bioregio',
      'bioregiotour',
      'presse',
      'homepage',
      'schulen',
      'plakate',
      'kommune',
      'kommunen',
      'öa',
    ],
  },
  {
    id: 'Ö7',
    name: 'Netzwerk ÖMR',
    hint: 'Netzwerk ÖMR Bayern',
    color: '#0d9488',
    isBioZ: false,
    keywords: ['netzwerk', 'ömr', 'omr', 'bayern'],
  },
]

export const BLOCK_BY_ID: Record<string, Block> = Object.fromEntries(
  BLOCKS.map((b) => [b.id, b]),
)

/** Praktischer Helfer: Block-Objekt zu einer id (oder undefined). */
export function getBlock(id: string | null | undefined): Block | undefined {
  if (!id) return undefined
  return BLOCK_BY_ID[id]
}
