"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { MachineProvider } from "@/lib/machine-context"
import { LoginPage } from "@/components/login-page"
import { MainDashboard } from "@/components/main-dashboard"
import { Loader2 } from "lucide-react"

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <MachineProvider>
      <MainDashboard />
    </MachineProvider>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
