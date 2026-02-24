"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PredictionProvider } from "@/lib/prediction-context"
import { LoginPage } from "@/components/login-page"
import { AppShell } from "@/components/app-shell"

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <PredictionProvider>
      <AppShell />
    </PredictionProvider>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
