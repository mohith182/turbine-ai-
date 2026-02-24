"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Cog, Shield } from "lucide-react"

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Login failed")
    }
    setLoading(false)
  }

  const fillDemo = () => {
    setEmail("admin@turbineai.com")
    setPassword("admin123")
    setError("")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-sidebar-primary">
            <Cog className="size-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">TurbineAI</span>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight text-sidebar-foreground text-balance">
            Predictive Maintenance Intelligence Platform
          </h1>
          <p className="text-sidebar-foreground/70 text-lg leading-relaxed max-w-md">
            Monitor turbine health, predict remaining useful life, and prevent costly downtime with ML-powered insights.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sidebar-foreground/80">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-sm">Real-time sensor monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-foreground/80">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-sm">Random Forest ML predictions</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-foreground/80">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-sm">Automated failure alerts</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/40">
          TurbineAI Predictive Maintenance v1.0
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary">
              <Cog className="size-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">TurbineAI</span>
          </div>

          <Card className="border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Sign In</CardTitle>
              <CardDescription>Access the maintenance dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@turbineai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="size-4" />
                      Sign In
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-3">Demo Credentials</p>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={fillDemo}
                  type="button"
                >
                  Use Demo Account
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                  admin@turbineai.com / admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
