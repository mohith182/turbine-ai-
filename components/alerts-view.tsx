"use client"

import { usePrediction } from "@/lib/prediction-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  Bell,
  BellOff,
  AlertTriangle,
  XOctagon,
  Clock,
} from "lucide-react"

interface AlertsViewProps {
  onNavigate: (view: string) => void
}

export function AlertsView({ onNavigate }: AlertsViewProps) {
  const { predictionHistory } = usePrediction()

  const alerts = predictionHistory
    .filter((p) => p.predicted_rul <= 10)
    .map((p, i) => ({
      ...p,
      id: i,
      severity: p.predicted_rul <= 1 ? ("critical" as const) : ("warning" as const),
    }))

  const criticalAlerts = alerts.filter((a) => a.severity === "critical")
  const warningAlerts = alerts.filter((a) => a.severity === "warning")

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-muted-foreground">
          Active maintenance alerts and notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={criticalAlerts.length > 0 ? "border-critical/30" : ""}>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-critical/10 flex items-center justify-center shrink-0">
              <XOctagon className="size-6 text-critical" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-foreground">{criticalAlerts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={warningAlerts.length > 0 ? "border-warning/30" : ""}>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6 text-warning" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-foreground">{warningAlerts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <BellOff className="size-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-center">
              No active alerts. All monitored turbines are operating within normal parameters.
            </p>
            <Button onClick={() => onNavigate("predict")} variant="outline">
              Run a Prediction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-critical uppercase tracking-wider">
                Critical Alerts
              </h2>
              {criticalAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className="border-critical/30 bg-critical/5"
                >
                  <XOctagon className="size-4 text-critical" />
                  <AlertTitle className="text-critical font-semibold">
                    CRITICAL: {alert.machineInfo.machineName} - RUL {alert.predicted_rul} cycles
                  </AlertTitle>
                  <AlertDescription>
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-critical/80">
                        Immediate shutdown and maintenance required. Risk of catastrophic failure.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {alert.timestamp.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-critical border-critical/30">
                          RUL: {alert.predicted_rul}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Warning Alerts */}
          {warningAlerts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-warning uppercase tracking-wider">
                Warning Alerts
              </h2>
              {warningAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className="border-warning/30 bg-warning/5"
                >
                  <AlertTriangle className="size-4 text-warning" />
                  <AlertTitle className="text-warning font-semibold">
                    WARNING: {alert.machineInfo.machineName} - RUL {alert.predicted_rul} cycles
                  </AlertTitle>
                  <AlertDescription>
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-warning/80">
                        Schedule preventive maintenance soon. Degradation detected in sensor readings.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {alert.timestamp.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-warning border-warning/30">
                          RUL: {alert.predicted_rul}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
