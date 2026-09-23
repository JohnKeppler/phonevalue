import type { UserProfile } from '../engine/types'

const KEY = 'valormovil.profile.v1'

/**
 * Persistencia local compatible con Capacitor (WebView) y navegador.
 * Usa localStorage; mismo API async por si más adelante se cambia a Preferences.
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // Cuota o modo privado: fallar en silencio
  }
}

export async function loadProfile(): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserProfile
    if (
      typeof parsed?.purchasePrice !== 'number' ||
      typeof parsed?.nextBudget !== 'number' ||
      !parsed.utilization ||
      typeof parsed.utilization !== 'object'
    ) {
      return null
    }
    if (!Array.isArray(parsed.nextIntents)) {
      parsed.nextIntents = []
    }
    return parsed
  } catch {
    return null
  }
}

export async function clearProfile(): Promise<void> {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export async function hasSavedProfile(): Promise<boolean> {
  return (await loadProfile()) != null
}
