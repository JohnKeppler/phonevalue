import { useState } from 'react'
import type { UserProfile } from './engine/types'
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

  if (screen === 'onboarding' || !profile) {
    return <Onboarding onComplete={handleComplete} />
  }

  if (screen === 'recommendations') {
    return (
      <Recommendations profile={profile} onBack={() => setScreen('dashboard')} />
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
