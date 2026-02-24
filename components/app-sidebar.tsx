"use client"

import { useAuth } from "@/lib/auth-context"
import { usePrediction } from "@/lib/prediction-context"
import { cn } from "@/lib/utils"
import {
  Cog,
  LayoutDashboard,
  ClipboardEdit,
  BarChart3,
  History,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface AppSidebarProps {
  currentView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "predict", label: "New Prediction", icon: ClipboardEdit },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
  { id: "alerts", label: "Alerts", icon: Bell },
]

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { prediction } = usePrediction()
  const [collapsed, setCollapsed] = useState(false)

  const hasAlert = prediction && prediction.predicted_rul <= 10

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center size-8 rounded-lg bg-sidebar-primary shrink-0">
          <Cog className="size-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground truncate">
            TurbineAI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const showBadge = item.id === "alerts" && hasAlert

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {showBadge && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-critical animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="flex flex-col gap-1 px-3 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.role}</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex-1 justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 shrink-0"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
