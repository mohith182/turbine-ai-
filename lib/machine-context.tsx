"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useAuthFetch } from "./auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface SensorReading {
  temperature: number
  vibration: number
  current: number
  timestamp?: string
}

interface HealthPrediction {
  rul: number
  health_score: number
  status: "healthy" | "warning" | "critical"
  risk_level: "low" | "medium" | "high"
  days_until_failure: number
  root_causes: string[]
  model_confidence: number
}

interface Machine {
  machine_id: string
  latest_readings: SensorReading
  health: HealthPrediction
  history?: SensorReading[]
}

interface Alert {
  machine_id: string
  severity: string
  status: string
  health_score: number
  days_until_failure: number
  root_causes: string[]
  message: string
  timestamp: string
}

interface DashboardStats {
  total_machines: number
  healthy: number
  warning: number
  critical: number
  average_health: number
  model_accuracy: number
}

interface MachineContextType {
  machines: Machine[]
  selectedMachine: Machine | null
  alerts: Alert[]
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
  fetchMachines: () => Promise<void>
  fetchMachine: (machineId: string) => Promise<void>
  fetchAlerts: () => Promise<void>
  fetchStats: () => Promise<void>
  searchMachine: (query: string) => Promise<void>
  clearSelection: () => void
  predict: (temp: number, vib: number, current: number) => Promise<HealthPrediction | null>
}

const MachineContext = createContext<MachineContextType | undefined>(undefined)

export function MachineProvider({ children }: { children: ReactNode }) {
  const authFetch = useAuthFetch()
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authFetch("/api/machines")
      if (res.ok) {
        const data = await res.json()
        setMachines(data)
      }
    } catch (err) {
      setError("Failed to fetch machines")
    }
    setIsLoading(false)
  }, [authFetch])

  const fetchMachine = useCallback(async (machineId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/machines/${machineId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedMachine(data)
      } else if (res.status === 404) {
        setError(`Machine ${machineId} not found`)
        setSelectedMachine(null)
      }
    } catch (err) {
      setError("Failed to fetch machine")
    }
    setIsLoading(false)
  }, [authFetch])

  const searchMachine = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSelectedMachine(null)
      return
    }
    await fetchMachine(query.toUpperCase())
  }, [fetchMachine])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await authFetch("/api/alerts")
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (err) {
      console.error("Failed to fetch alerts")
    }
  }, [authFetch])

  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error("Failed to fetch stats")
    }
  }, [authFetch])

  const predict = useCallback(async (temp: number, vib: number, current: number): Promise<HealthPrediction | null> => {
    try {
      const res = await authFetch("/api/predict", {
        method: "POST",
        body: JSON.stringify({ temperature: temp, vibration: vib, current: current })
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      console.error("Prediction failed")
    }
    return null
  }, [authFetch])

  const clearSelection = useCallback(() => {
    setSelectedMachine(null)
    setError(null)
  }, [])

  return (
    <MachineContext.Provider value={{
      machines,
      selectedMachine,
      alerts,
      stats,
      isLoading,
      error,
      fetchMachines,
      fetchMachine,
      fetchAlerts,
      fetchStats,
      searchMachine,
      clearSelection,
      predict
    }}>
      {children}
    </MachineContext.Provider>
  )
}

export function useMachine() {
  const context = useContext(MachineContext)
  if (context === undefined) {
    throw new Error("useMachine must be used within a MachineProvider")
  }
  return context
}
