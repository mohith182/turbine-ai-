"use client"

import { useEffect } from "react"
import { usePrediction } from "@/lib/prediction-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Brain,
  Database,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"

interface DashboardViewProps {
  onNavigate: (view: string) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { user } = useAuth()
  const {
    modelTrained,
    modelAccuracy,
    trainModel,
    isLoading,
    predictionHistory,
    prediction,
  } = usePrediction()

  useEffect(() => {
    if (!modelTrained) {
      trainModel()
    }
  }, [modelTrained, trainModel])

  const recentPredictions = predictionHistory.slice(0, 5)
  const criticalCount = predictionHistory.filter(
    (p) => p.status === "Critical"
  ).length
  const warningCount = predictionHistory.filter(
    (p) => p.status === "Warning"
  ).length

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name || "Engineer"}
        </h1>
        <p className="text-muted-foreground">
          Monitor turbine health and run predictive maintenance analysis
        </p>
      </div>

      {/* Model Status Banner */}
      {!modelTrained ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isLoading ? "Training ML Model..." : "Model Not Trained"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Random Forest Regressor is being trained on turbine dataset"
                    : "Train the model to start making predictions"}
                </p>
              </div>
            </div>
            {!isLoading && (
              <Button onClick={trainModel} size="sm">
                Train Model
              </Button>
            )}
            {isLoading && (
              <div className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Model Ready</p>
                <p className="text-sm text-muted-foreground">
                  Random Forest trained with R-squared: {modelAccuracy}%
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-success border-success/30">
              Active
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="size-6 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm text-muted-foreground">Predictions Run</p>
              <p className="text-2xl font-bold text-foreground">{predictionHistory.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6 text-warning" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-foreground">{warningCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-critical/10 flex items-center justify-center shrink-0">
              <TrendingDown className="size-6 text-critical" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Database className="size-6 text-success" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm text-muted-foreground">Model Accuracy</p>
              <p className="text-2xl font-bold text-foreground">
                {modelTrained ? `${modelAccuracy}%` : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full justify-start gap-3"
              onClick={() => onNavigate("predict")}
              disabled={!modelTrained}
            >
              <Zap className="size-4" />
              Run New Prediction
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate("results")}
              disabled={!prediction}
            >
              <Activity className="size-4" />
              View Latest Results
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate("history")}
              disabled={predictionHistory.length === 0}
            >
              <Clock className="size-4" />
              View Prediction History
            </Button>
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Predictions</CardTitle>
            <CardDescription>
              {recentPredictions.length === 0
                ? "No predictions yet"
                : `Last ${recentPredictions.length} prediction(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPredictions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                <Activity className="size-8 opacity-40" />
                <p className="text-sm">Run your first prediction to see results here</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentPredictions.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.machineInfo.machineName || "Unknown Machine"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        RUL: {p.predicted_rul} cycles
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        p.status === "Healthy"
                          ? "text-success border-success/30 bg-success/10"
                          : p.status === "Warning"
                          ? "text-warning border-warning/30 bg-warning/10"
                          : "text-critical border-critical/30 bg-critical/10"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
