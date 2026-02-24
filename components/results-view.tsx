"use client"

import { usePrediction } from "@/lib/prediction-context"
import { HealthGauge } from "@/components/health-gauge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  Clock,
  Thermometer,
  Vibrate,
  Zap,
  AlertTriangle,
  XOctagon,
  ArrowLeft,
  Printer,
  Building2,
  Shield,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ResultsViewProps {
  onNavigate: (view: string) => void
}

export function ResultsView({ onNavigate }: ResultsViewProps) {
  const { prediction, machineInfo } = usePrediction()

  if (!prediction || !machineInfo) {
    return (
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Prediction Results</h1>
          <p className="text-muted-foreground">No prediction results available</p>
        </div>
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Activity className="size-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-center">
              Run a prediction first to see results here.
            </p>
            <Button onClick={() => onNavigate("predict")}>
              Run Prediction
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { predicted_rul, health_score, status, confidence } = prediction
  const isWarning = predicted_rul <= 10 && predicted_rul > 1
  const isCritical = predicted_rul <= 1

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Prediction Results</h1>
          <p className="text-muted-foreground">
            Analysis for {machineInfo.machineName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => onNavigate("predict")}>
            <ArrowLeft className="size-4" />
            New Prediction
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Critical/Warning Alert Banners */}
      {isCritical && (
        <Alert className="border-critical/30 bg-critical/10">
          <XOctagon className="size-4 text-critical" />
          <AlertTitle className="text-critical font-semibold">
            CRITICAL: Immediate Action Required
          </AlertTitle>
          <AlertDescription className="text-critical/80">
            Remaining useful life is at {predicted_rul} cycles. The turbine is at imminent risk of
            failure. Shut down immediately and schedule emergency maintenance.
          </AlertDescription>
        </Alert>
      )}
      {isWarning && !isCritical && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="size-4 text-warning" />
          <AlertTitle className="text-warning font-semibold">
            WARNING: Maintenance Required Soon
          </AlertTitle>
          <AlertDescription className="text-warning/80">
            Remaining useful life is {predicted_rul} cycles. Schedule preventive maintenance
            within the next operational window to avoid unplanned downtime.
          </AlertDescription>
        </Alert>
      )}

      {/* Main results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Gauge Card */}
        <Card className="lg:row-span-2">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Health Score</CardTitle>
            <CardDescription>Overall machine condition</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <HealthGauge score={health_score} status={status} size="lg" />
            <Separator />
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Predicted RUL</span>
                <span className="text-sm font-semibold text-foreground">
                  {predicted_rul} cycles
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="text-sm font-semibold text-foreground">
                  {confidence}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    status === "Healthy"
                      ? "text-success border-success/30 bg-success/10"
                      : status === "Warning"
                      ? "text-warning border-warning/30 bg-warning/10"
                      : "text-critical border-critical/30 bg-critical/10"
                  )}
                >
                  {status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Readings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sensor Input</CardTitle>
            <CardDescription>Values used for prediction</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-critical/10 flex items-center justify-center">
                  <Thermometer className="size-4 text-critical" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Temperature</p>
                  <p className="text-xs text-muted-foreground">Celsius</p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                {machineInfo.temperature}C
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Vibrate className="size-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Vibration</p>
                  <p className="text-xs text-muted-foreground">mm/s</p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                {machineInfo.vibration}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Current</p>
                  <p className="text-xs text-muted-foreground">Amperes</p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                {machineInfo.current}A
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Machine Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Machine Details</CardTitle>
            <CardDescription>Asset identification</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Wrench className="size-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground">Machine</span>
                <span className="text-sm font-medium text-foreground truncate">
                  {machineInfo.machineName}
                </span>
              </div>
            </div>
            {machineInfo.companyName && (
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">Company</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {machineInfo.companyName}
                  </span>
                </div>
              </div>
            )}
            {machineInfo.warranty && (
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">Warranty</span>
                  <span className="text-sm font-medium text-foreground capitalize truncate">
                    {machineInfo.warranty}
                  </span>
                </div>
              </div>
            )}
            {machineInfo.previousFailure === "yes" && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-4 text-warning shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">Previous Failure</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {machineInfo.failureCause || "Yes - Cause unspecified"}
                  </span>
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>Analyzed at {new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RUL Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RUL Timeline</CardTitle>
          <CardDescription>
            Remaining useful life in context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="relative h-8 rounded-full bg-muted overflow-hidden">
              {/* Zones */}
              <div className="absolute inset-y-0 left-0 w-[10%] bg-critical/20 border-r border-critical/30" />
              <div className="absolute inset-y-0 left-[10%] w-[20%] bg-warning/20 border-r border-warning/30" />
              <div className="absolute inset-y-0 left-[30%] w-[70%] bg-success/20" />
              {/* Indicator */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 size-6 rounded-full border-2 shadow-lg transition-all duration-1000",
                  status === "Healthy"
                    ? "bg-success border-success"
                    : status === "Warning"
                    ? "bg-warning border-warning"
                    : "bg-critical border-critical"
                )}
                style={{
                  left: `clamp(12px, ${Math.min(predicted_rul, 100)}%, calc(100% - 12px))`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Failure)</span>
              <span className="text-critical">{"<"}10 Critical</span>
              <span className="text-warning">10-30 Warning</span>
              <span className="text-success">{">"}30 Healthy</span>
              <span>100+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
