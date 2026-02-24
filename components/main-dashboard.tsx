"use client"

import { useEffect, useState, useCallback } from "react"
import { useMachine } from "@/lib/machine-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Activity,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Brain,
  Bell,
  ChevronRight,
  Loader2,
  Settings,
  RefreshCw,
} from "lucide-react"

// Simple line chart component
function MiniChart({ 
  data, 
  color, 
  label,
  unit 
}: { 
  data: number[]
  color: string
  label: string
  unit: string
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const current = data[data.length - 1] || 0
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-lg font-bold" style={{ color }}>{current.toFixed(1)}{unit}</span>
        </div>
        <div className="h-16 relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill={`url(#gradient-${label})`}
              points={`0,100 ${points} 100,100`}
            />
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

// Health gauge component
function HealthGauge({ score, status }: { score: number; status: string }) {
  const getColor = () => {
    if (status === "healthy") return "text-emerald-500"
    if (status === "warning") return "text-amber-500"
    return "text-red-500"
  }

  const getBgColor = () => {
    if (status === "healthy") return "bg-emerald-500"
    if (status === "warning") return "bg-amber-500"
    return "bg-red-500"
  }

  const getIcon = () => {
    if (status === "healthy") return <CheckCircle2 className="size-8" />
    if (status === "warning") return <AlertTriangle className="size-8" />
    return <XCircle className="size-8" />
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${score * 3.52} 352`}
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getColor()}`}>{score.toFixed(0)}%</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Health</span>
        </div>
      </div>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getBgColor()}/10`}>
        <span className={getColor()}>{getIcon()}</span>
        <span className={`font-semibold capitalize ${getColor()}`}>{status}</span>
      </div>
    </div>
  )
}

export function MainDashboard() {
  const { user, logout } = useAuth()
  const { 
    selectedMachine, 
    alerts, 
    stats, 
    isLoading, 
    error,
    fetchStats, 
    fetchAlerts, 
    searchMachine,
    clearSelection
  } = useMachine()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  // Initial data fetch
  useEffect(() => {
    fetchStats()
    fetchAlerts()
    const interval = setInterval(() => {
      fetchStats()
      fetchAlerts()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchStats, fetchAlerts])

  // Show alert popup when machine health is critical/warning
  useEffect(() => {
    if (selectedMachine && selectedMachine.health.status !== "healthy") {
      setShowAlert(true)
    }
  }, [selectedMachine])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    await searchMachine(searchQuery)
    setIsSearching(false)
  }

  const criticalAlerts = alerts.filter(a => a.severity === "high")
  const warningAlerts = alerts.filter(a => a.severity === "medium")

  // Generate chart data from machine history
  const getChartData = (field: "temperature" | "vibration" | "current") => {
    if (!selectedMachine?.history) {
      return Array(20).fill(0).map(() => Math.random() * 50 + 50)
    }
    return selectedMachine.history.slice(-20).map(h => h[field])
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Settings className="size-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">TurbineAI</span>
            </div>
            
            {/* Live Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">System Online</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Machine ID (e.g., M001, M025)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </form>

          {/* User & Notifications */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              {criticalAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {criticalAlerts.length}
                </span>
              )}
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Alert Popup */}
        {showAlert && selectedMachine && selectedMachine.health.status !== "healthy" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
            <Card className="w-full max-w-md mx-4 border-2 border-red-500/50 shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="size-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-red-500">Maintenance Alert</CardTitle>
                    <CardDescription>Machine {selectedMachine.machine_id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Machine likely to fail within <strong>{selectedMachine.health.days_until_failure} days</strong>. 
                  Schedule maintenance immediately.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Root Causes:</p>
                  <ul className="space-y-1">
                    {selectedMachine.health.root_causes.map((cause, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="size-1.5 rounded-full bg-red-500" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full" onClick={() => setShowAlert(false)}>
                  Acknowledge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="size-5 text-red-500" />
              <span className="text-red-500">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearSelection} className="ml-auto">
                Clear
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {stats && !selectedMachine && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-muted-foreground">Monitor all machines and predict failures in real-time</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Machines</p>
                      <p className="text-3xl font-bold">{stats.total_machines}</p>
                    </div>
                    <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Activity className="size-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Healthy</p>
                      <p className="text-3xl font-bold text-emerald-500">{stats.healthy}</p>
                    </div>
                    <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="size-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Warning</p>
                      <p className="text-3xl font-bold text-amber-500">{stats.warning}</p>
                    </div>
                    <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="size-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Critical</p>
                      <p className="text-3xl font-bold text-red-500">{stats.critical}</p>
                    </div>
                    <div className="size-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <XCircle className="size-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Model Status */}
            <Card className="mb-8 border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Brain className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">ML Model Active</p>
                    <p className="text-sm text-muted-foreground">
                      Random Forest Regressor • Accuracy: {stats.model_accuracy}%
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  <CheckCircle2 className="size-3 mr-1" />
                  Trained
                </Badge>
              </CardContent>
            </Card>

            {/* Alerts List */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="size-5" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>{alerts.length} machines require attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          setSearchQuery(alert.machine_id)
                          searchMachine(alert.machine_id)
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-10 rounded-lg flex items-center justify-center ${
                            alert.severity === "high" ? "bg-red-500/10" : "bg-amber-500/10"
                          }`}>
                            <AlertTriangle className={`size-5 ${
                              alert.severity === "high" ? "text-red-500" : "text-amber-500"
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{alert.machine_id}</p>
                            <p className="text-sm text-muted-foreground">{alert.root_causes[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              alert.severity === "high" ? "text-red-500" : "text-amber-500"
                            }`}>
                              {alert.days_until_failure} days
                            </p>
                            <p className="text-xs text-muted-foreground">until failure</p>
                          </div>
                          <ChevronRight className="size-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Machine Details View */}
        {selectedMachine && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    ← Back
                  </Button>
                  <h1 className="text-2xl font-bold">Machine {selectedMachine.machine_id}</h1>
                  <Badge variant="outline" className={
                    selectedMachine.health.status === "healthy" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                    selectedMachine.health.status === "warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                    "bg-red-500/10 text-red-500 border-red-500/30"
                  }>
                    {selectedMachine.health.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Real-time monitoring and predictive analysis</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => searchMachine(selectedMachine.machine_id)}>
                <RefreshCw className="size-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Health Overview */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Health Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                  <HealthGauge 
                    score={selectedMachine.health.health_score} 
                    status={selectedMachine.health.status} 
                  />
                  
                  <div className="w-full mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Remaining Useful Life</span>
                      <span className="font-bold">{selectedMachine.health.rul.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={selectedMachine.health.rul} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Days Until Failure</span>
                      <Badge variant="outline" className={
                        selectedMachine.health.days_until_failure > 14 ? "bg-emerald-500/10 text-emerald-500" :
                        selectedMachine.health.days_until_failure > 7 ? "bg-amber-500/10 text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      }>
                        <Clock className="size-3 mr-1" />
                        {selectedMachine.health.days_until_failure} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sensor Readings */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Sensor Readings</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <MiniChart 
                    data={getChartData("temperature")} 
                    color="#ef4444" 
                    label="Temperature"
                    unit="°C"
                  />
                  <MiniChart 
                    data={getChartData("vibration")} 
                    color="#f59e0b" 
                    label="Vibration"
                    unit=" mm/s"
                  />
                  <MiniChart 
                    data={getChartData("current")} 
                    color="#3b82f6" 
                    label="Current"
                    unit=" A"
                  />
                </div>

                {/* Current Readings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Latest Readings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Thermometer className="size-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedMachine.latest_readings.temperature}°C</p>
                          <p className="text-xs text-muted-foreground">Temperature</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Activity className="size-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedMachine.latest_readings.vibration}</p>
                          <p className="text-xs text-muted-foreground">Vibration (mm/s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Zap className="size-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{selectedMachine.latest_readings.current}A</p>
                          <p className="text-xs text-muted-foreground">Current</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Panel */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="size-5" />
                    Predictive Insights
                  </CardTitle>
                  <CardDescription>AI-powered analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Risk Level */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Risk Level</h4>
                      <div className={`p-4 rounded-lg ${
                        selectedMachine.health.risk_level === "low" ? "bg-emerald-500/10 border border-emerald-500/30" :
                        selectedMachine.health.risk_level === "medium" ? "bg-amber-500/10 border border-amber-500/30" :
                        "bg-red-500/10 border border-red-500/30"
                      }`}>
                        <div className="flex items-center gap-2">
                          {selectedMachine.health.risk_level === "low" ? (
                            <TrendingUp className="size-5 text-emerald-500" />
                          ) : selectedMachine.health.risk_level === "medium" ? (
                            <AlertTriangle className="size-5 text-amber-500" />
                          ) : (
                            <TrendingDown className="size-5 text-red-500" />
                          )}
                          <span className={`font-semibold uppercase ${
                            selectedMachine.health.risk_level === "low" ? "text-emerald-500" :
                            selectedMachine.health.risk_level === "medium" ? "text-amber-500" :
                            "text-red-500"
                          }`}>
                            {selectedMachine.health.risk_level} Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Root Causes */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Root Cause Analysis</h4>
                      <ul className="space-y-2">
                        {selectedMachine.health.root_causes.map((cause, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className={`size-2 rounded-full ${
                              cause.includes("Normal") ? "bg-emerald-500" : "bg-amber-500"
                            }`} />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recommendation</h4>
                      <div className="p-4 rounded-lg bg-muted/50">
                        {selectedMachine.health.status === "healthy" ? (
                          <p className="text-sm">Continue regular monitoring. No immediate action required.</p>
                        ) : selectedMachine.health.status === "warning" ? (
                          <p className="text-sm">Schedule preventive maintenance within the next {selectedMachine.health.days_until_failure} days to avoid unplanned downtime.</p>
                        ) : (
                          <p className="text-sm text-red-500 font-medium">Immediate maintenance required. Machine at high risk of failure.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Model Confidence */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Model Confidence</span>
                      <span className="text-sm font-medium">{selectedMachine.health.model_confidence}%</span>
                    </div>
                    <Progress value={selectedMachine.health.model_confidence} className="h-1 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
