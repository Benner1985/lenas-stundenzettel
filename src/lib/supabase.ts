import { createClient } from '@supabase/supabase-js'

// Verbindung zur Online-Datenbank (Supabase). Der Publishable Key darf
// laut Supabase öffentlich sein; der Zugriff ist über die Tabelle
// "app_data" geregelt. Es gibt bewusst keinen Login.
const SUPABASE_URL = 'https://wxcqxxljzplnlhysxqep.supabase.co'
const SUPABASE_KEY = 'sb_publishable_mPW0EI-B_uxlkhm-3ci6MA_hSoiIAQC'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } },
})

// Alle Daten liegen in einer Zeile (eine gemeinsame Ablage, kein Login).
// Frische Ablage – die alte Zeile ("lena") enthielt nur Test-Daten und
// wird bewusst nicht mehr verwendet.
export const DOC_ID = 'lena-clean-start'
export const TABLE = 'app_data'
