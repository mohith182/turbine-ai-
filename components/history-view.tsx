"use client"

import { usePrediction } from "@/lib/prediction-context"
import { HealthGauge } from "@/components/health-gauge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Activity,
  Clock,
  Thermometer,
  Vibrate,
  Zap,
} from "lucide-react"

interface HistoryViewProps {
  onNavigate: (view: string) => void
}

export function HistoryView({ onNavigate }: HistoryViewProps) {
  const { predictionHistory } = usePrediction()

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Prediction History</h1>
        <p className="text-muted-foreground">
          {predictionHistory.length} prediction(s) recorded this session
        </p>
      </div>

      {predictionHistory.length === 0 ? (
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Clock className="size-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-center">
              No predictions have been run yet.
            </p>
            <Button onClick={() => onNavigate("predict")}>
              Run First Prediction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {predictionHistory.map((entry, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {entry.machineInfo.machineName}
                    </CardTitle>
                    <CardDescription>
                      {entry.machineInfo.companyName
                        ? `${entry.machineInfo.companyName} - `
                        : ""}
                      {entry.timestamp.toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      entry.status === "Healthy"
                        ? "text-success border-success/30 bg-success/10"
                        : entry.status === "Warning"
                        ? "text-warning border-warning/30 bg-warning/10"
                        : "text-critical border-critical/30 bg-critical/10"
                    )}
                  >
                    {entry.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-6">
                    <HealthGauge
                      score={entry.health_score}
                      status={entry.status}
                      size="sm"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="size-3.5 text-primary" />
                        <span className="text-muted-foreground">RUL:</span>
                        <span className="font-semibold text-foreground">
                          {entry.predicted_rul} cycles
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="size-3.5 text-critical" />
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="font-medium text-foreground">
                          {entry.machineInfo.temperature}C
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Vibrate className="size-3.5 text-warning" />
                        <span className="text-muted-foreground">Vib:</span>
                        <span className="font-medium text-foreground">
                          {entry.machineInfo.vibration} mm/s
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="size-3.5 text-primary" />
                        <span className="text-muted-foreground">Cur:</span>
                        <span className="font-medium text-foreground">
                          {entry.machineInfo.current}A
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
