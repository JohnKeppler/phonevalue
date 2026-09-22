import { useEffect, useRef, useState } from 'react'
import type { NextIntent, UserProfile } from './engine/types'
import { Onboarding } from './components/Onboarding'
import { Dashboard } from './components/Dashboard'
import { Recommendations } from './components/Recommendations'
import {
  clearProfile,
  loadProfile,
  saveProfile,
} from './storage/profileStore'
import { initAndroidChrome } from './native/androidChrome'

type Screen = 'loading' | 'onboarding' | 'dashboard' | 'recommendations'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedOffer, setSavedOffer] = useState<UserProfile | null>(null)
  const screenRef = useRef(screen)
  screenRef.current = screen
  const setScreenRef = useRef(setScreen)
  setScreenRef.current = setScreen

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const saved = await loadProfile()
      if (cancelled) return
      if (saved) {
        setSavedOffer(saved)
        setScreen('onboarding')
      } else {
        setScreen('onboarding')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Android hardware/gesture back: nested handlers first, then screen stack.
  useEffect(() => {
    let remove: (() => void) | undefined
    void initAndroidChrome(() => {
      const current = screenRef.current
      if (current === 'recommendations') {
        setScreenRef.current('dashboard')
        return true
      }
      // Root screens (dashboard / onboarding / loading) → exit
      return false
    }).then((cleanup) => {
      remove = cleanup
    })
    return () => {
      remove?.()
    }
  }, [])

  async function handleComplete(p: UserProfile) {
    setProfile(p)
    setSavedOffer(null)
    await saveProfile(p)
    setScreen('dashboard')
  }

  async function handleReset() {
    setProfile(null)
    setSavedOffer(null)
    await clearProfile()
    setScreen('onboarding')
  }

  function handleRemeasure() {
    setProfile((current) => {
      if (current) setSavedOffer(current)
      return null
    })
    setScreen('onboarding')
  }

  function handleRestore(saved: UserProfile) {
    setProfile(saved)
    setSavedOffer(null)
    setScreen('dashboard')
  }

  function handleIntents(nextIntents: NextIntent[]) {
    setProfile((prev) => {
      if (!prev) return prev
      const next = { ...prev, nextIntents }
      void saveProfile(next)
      return next
    })
  }

  if (screen === 'loading') {
    return (
      <div className="app-screen flex min-h-dvh items-center justify-center text-sm text-slate-400">
        Cargando…
      </div>
    )
  }

  if (screen === 'onboarding' || !profile) {
    return (
      <Onboarding
        onComplete={handleComplete}
        savedProfile={savedOffer}
        onRestore={savedOffer ? () => handleRestore(savedOffer) : undefined}
      />
    )
  }

  if (screen === 'recommendations') {
    return (
      <Recommendations
        profile={profile}
        onBack={() => setScreen('dashboard')}
        onIntentsChange={handleIntents}
      />
    )
  }

  return (
    <Dashboard
      profile={profile}
      onShowRecs={() => setScreen('recommendations')}
      onReset={handleReset}
      onRemeasure={handleRemeasure}
    />
  )
}
