"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface PredictionResult {
  predicted_rul: number
  health_score: number
  status: "Healthy" | "Warning" | "Critical"
  confidence: number
}

export interface MachineInfo {
  machineName: string
  companyName: string
  warranty: string
  previousFailure: string
  failureCause: string
  temperature: number
  vibration: number
  current: number
}

interface PredictionContextType {
  prediction: PredictionResult | null
  machineInfo: MachineInfo | null
  isLoading: boolean
  modelTrained: boolean
  modelAccuracy: number
  trainModel: () => Promise<void>
  runPrediction: (info: MachineInfo) => Promise<void>
  clearPrediction: () => void
  predictionHistory: Array<PredictionResult & { machineInfo: MachineInfo; timestamp: Date }>
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined)

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [modelTrained, setModelTrained] = useState(false)
  const [modelAccuracy, setModelAccuracy] = useState(0)
  const [predictionHistory, setPredictionHistory] = useState<
    Array<PredictionResult & { machineInfo: MachineInfo; timestamp: Date }>
  >([])

  const trainModel = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/train", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setModelTrained(true)
        setModelAccuracy(data.accuracy)
      }
    } catch (error) {
      console.error("Training failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const runPrediction = useCallback(async (info: MachineInfo) => {
    setIsLoading(true)
    setMachineInfo(info)
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: info.temperature,
          vibration: info.vibration,
          current: info.current,
        }),
      })
      const data = await res.json()
      setPrediction(data)
      setPredictionHistory((prev) => [
        { ...data, machineInfo: info, timestamp: new Date() },
        ...prev,
      ])
    } catch (error) {
      console.error("Prediction failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearPrediction = useCallback(() => {
    setPrediction(null)
    setMachineInfo(null)
  }, [])

  return (
    <PredictionContext.Provider
      value={{
        prediction,
        machineInfo,
        isLoading,
        modelTrained,
        modelAccuracy,
        trainModel,
        runPrediction,
        clearPrediction,
        predictionHistory,
      }}
    >
      {children}
    </PredictionContext.Provider>
  )
}

export function usePrediction() {
  const context = useContext(PredictionContext)
  if (context === undefined) {
    throw new Error("usePrediction must be used within a PredictionProvider")
  }
  return context
}
