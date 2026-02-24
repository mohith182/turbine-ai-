"use client"

import { useState } from "react"
import { usePrediction, type MachineInfo } from "@/lib/prediction-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Thermometer,
  Vibrate,
  Zap,
  Send,
  RotateCcw,
  Info,
} from "lucide-react"

interface PredictionFormProps {
  onNavigate: (view: string) => void
}

export function PredictionForm({ onNavigate }: PredictionFormProps) {
  const { runPrediction, isLoading, modelTrained, trainModel } = usePrediction()
  const [form, setForm] = useState<MachineInfo>({
    machineName: "",
    companyName: "",
    warranty: "",
    previousFailure: "no",
    failureCause: "",
    temperature: 70,
    vibration: 2.0,
    current: 18,
  })

  const updateField = <K extends keyof MachineInfo>(
    key: K,
    value: MachineInfo[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await runPrediction(form)
    onNavigate("results")
  }

  const handleReset = () => {
    setForm({
      machineName: "",
      companyName: "",
      warranty: "",
      previousFailure: "no",
      failureCause: "",
      temperature: 70,
      vibration: 2.0,
      current: 18,
    })
  }

  if (!modelTrained) {
    return (
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">New Prediction</h1>
          <p className="text-muted-foreground">Enter sensor data to predict remaining useful life</p>
        </div>
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Info className="size-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-center">
              The ML model needs to be trained before making predictions.
            </p>
            <Button onClick={trainModel}>Train Model Now</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">New Prediction</h1>
        <p className="text-muted-foreground">
          Enter sensor data to predict remaining useful life
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Machine Information</CardTitle>
            <CardDescription>General details about the turbine</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="machineName">Machine Name</Label>
              <Input
                id="machineName"
                placeholder="e.g., Turbine T-201"
                value={form.machineName}
                onChange={(e) => updateField("machineName", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., PowerGen Corp"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="warranty">Warranty Status</Label>
              <Select
                value={form.warranty}
                onValueChange={(val) => updateField("warranty", val)}
              >
                <SelectTrigger id="warranty" className="w-full">
                  <SelectValue placeholder="Select warranty status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="previousFailure">Previous Failure</Label>
              <Select
                value={form.previousFailure}
                onValueChange={(val) => updateField("previousFailure", val)}
              >
                <SelectTrigger id="previousFailure" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.previousFailure === "yes" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="failureCause">Failure Cause</Label>
                <Input
                  id="failureCause"
                  placeholder="e.g., Bearing wear"
                  value={form.failureCause}
                  onChange={(e) => updateField("failureCause", e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensor Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sensor Readings</CardTitle>
            <CardDescription>
              Real-time sensor data from the turbine
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Temperature */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Thermometer className="size-4 text-critical" />
                <Label htmlFor="temperature">Temperature (C)</Label>
              </div>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={form.temperature}
                onChange={(e) =>
                  updateField("temperature", parseFloat(e.target.value) || 0)
                }
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Normal: 40-70C</span>
                <span>Critical: {">"}100C</span>
              </div>
            </div>

            {/* Vibration */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Vibrate className="size-4 text-warning" />
                <Label htmlFor="vibration">Vibration (mm/s)</Label>
              </div>
              <Input
                id="vibration"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={form.vibration}
                onChange={(e) =>
                  updateField("vibration", parseFloat(e.target.value) || 0)
                }
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Normal: 0-2 mm/s</span>
                <span>Critical: {">"}5 mm/s</span>
              </div>
            </div>

            {/* Current */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <Label htmlFor="current">Current (A)</Label>
              </div>
              <Input
                id="current"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.current}
                onChange={(e) =>
                  updateField("current", parseFloat(e.target.value) || 0)
                }
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Normal: 10-20A</span>
                <span>Critical: {">"}30A</span>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isLoading || !form.machineName}
              >
                {isLoading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Predict RUL
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
