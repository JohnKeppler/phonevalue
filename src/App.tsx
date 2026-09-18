import { useState } from 'react'
import type { NextIntent, UserProfile } from './engine/types'
import { Onboarding } from './components/Onboarding'
import { Dashboard } from './components/Dashboard'
import { Recommendations } from './components/Recommendations'

type Screen = 'onboarding' | 'dashboard' | 'recommendations'

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  function handleComplete(p: UserProfile) {
    setProfile(p)
    setScreen('dashboard')
  }

  function handleReset() {
    setProfile(null)
    setScreen('onboarding')
  }

  function handleIntents(nextIntents: NextIntent[]) {
    setProfile((prev) => (prev ? { ...prev, nextIntents } : prev))
  }

  if (screen === 'onboarding' || !profile) {
    return <Onboarding onComplete={handleComplete} />
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
    />
  )
}
