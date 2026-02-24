"use client"

import { usePrediction } from "@/lib/prediction-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardEdit,
  BarChart3,
  History,
  Bell,
} from "lucide-react"

interface MobileNavProps {
  currentView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "predict", label: "Predict", icon: ClipboardEdit },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
  { id: "alerts", label: "Alerts", icon: Bell },
]

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  const { prediction } = usePrediction()
  const hasAlert = prediction && prediction.predicted_rul <= 10

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const showBadge = item.id === "alerts" && hasAlert

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
              {showBadge && (
                <span className="absolute top-0.5 right-1 size-2 rounded-full bg-critical animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
