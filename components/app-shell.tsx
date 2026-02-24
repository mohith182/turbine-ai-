"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { DashboardView } from "@/components/dashboard-view"
import { PredictionForm } from "@/components/prediction-form"
import { ResultsView } from "@/components/results-view"
import { HistoryView } from "@/components/history-view"
import { AlertsView } from "@/components/alerts-view"
import { Cog } from "lucide-react"

export function AppShell() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={setCurrentView} />
      case "predict":
        return <PredictionForm onNavigate={setCurrentView} />
      case "results":
        return <ResultsView onNavigate={setCurrentView} />
      case "history":
        return <HistoryView onNavigate={setCurrentView} />
      case "alerts":
        return <AlertsView onNavigate={setCurrentView} />
      default:
        return <DashboardView onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center justify-center size-7 rounded-md bg-primary">
              <Cog className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">TurbineAI</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Logged in as</span>
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="text-muted-foreground/50">({user?.role})</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {renderView()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  )
}
