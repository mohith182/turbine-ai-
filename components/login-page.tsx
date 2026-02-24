"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Cog, Shield, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

type Step = "email" | "otp"

export function LoginPage() {
  const { requestOTP, verifyOTP } = useAuth()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === "otp") {
      setCanResend(true)
    }
  }, [countdown, step])

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setError("")
    setLoading(true)
    
    const result = await requestOTP(email)
    
    if (result.success) {
      setStep("otp")
      setCountdown(result.expiresIn || 300)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } else {
      setError(result.error || "Failed to send OTP")
    }
    
    setLoading(false)
  }

  const handleResendOTP = async () => {
    if (!canResend) return
    setLoading(true)
    setError("")
    
    const result = await requestOTP(email)
    
    if (result.success) {
      setCountdown(result.expiresIn || 300)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
    } else {
      setError(result.error || "Failed to resend OTP")
    }
    
    setLoading(false)
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when complete
    if (newOtp.every(d => d) && newOtp.join("").length === 6) {
      handleVerifyOTP(newOtp.join(""))
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      const newOtp = pasted.split("")
      setOtp(newOtp)
      handleVerifyOTP(pasted)
    }
  }

  const handleVerifyOTP = async (code: string) => {
    setError("")
    setLoading(true)
    
    const result = await verifyOTP(email, code)
    
    if (!result.success) {
      setError(result.error || "Invalid OTP")
      setOtp(["", "", "", "", "", ""])
      otpRefs.current[0]?.focus()
    }
    
    setLoading(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const goBack = () => {
    setStep("email")
    setError("")
    setOtp(["", "", "", "", "", ""])
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-cyan-500/20 rounded-full animate-spin-slow" style={{ animationDuration: "20s" }} />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border border-blue-500/20 rounded-full animate-spin-slow" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Cog className="size-6 text-white animate-spin-slow" style={{ animationDuration: "8s" }} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">TurbineAI</span>
        </div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <h1 className="text-5xl font-bold leading-tight text-white">
            Predictive Maintenance
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Intelligence Platform</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Monitor industrial machines, predict failures 7-14 days in advance, and prevent costly downtime with ML-powered insights.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="size-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 group-hover:scale-125 transition-transform" />
              <span className="text-sm">Real-time sensor monitoring</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="size-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 group-hover:scale-125 transition-transform" />
              <span className="text-sm">Random Forest ML predictions</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="size-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 group-hover:scale-125 transition-transform" />
              <span className="text-sm">Automated failure alerts</span>
            </div>
          </div>
        </div>
        
        <p className="relative z-10 text-sm text-slate-500">
          TurbineAI Predictive Maintenance v1.0 | MOS101
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex items-center justify-center size-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <Cog className="size-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">TurbineAI</span>
          </div>

          <Card className="border-border/50 shadow-xl backdrop-blur">
            <CardHeader className="text-center pb-2">
              {step === "email" ? (
                <>
                  <div className="mx-auto mb-4 flex items-center justify-center size-14 rounded-full bg-primary/10">
                    <Mail className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>Enter your email to receive a login code</CardDescription>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="absolute left-4 top-4"
                  >
                    <ArrowLeft className="size-4 mr-1" />
                    Back
                  </Button>
                  <div className="mx-auto mb-4 flex items-center justify-center size-14 rounded-full bg-primary/10">
                    <Shield className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                  <CardDescription>
                    Enter the 6-digit code sent to<br />
                    <span className="font-medium text-foreground">{email}</span>
                  </CardDescription>
                </>
              )}
            </CardHeader>
            
            <CardContent className="pt-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6 animate-in slide-in-from-top-2">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleRequestOTP} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        Sending Code...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="size-5" />
                        Send Login Code
                      </span>
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => setEmail("demo@example.com")}
                  >
                    Use Demo Account
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Try with demo@example.com - OTP will be shown in backend console
                  </p>
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* OTP Input */}
                  <div className="flex justify-center gap-2" onPaste={handleOTPPaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Code expires in{" "}
                        <span className="font-mono font-medium text-foreground">
                          {formatTime(countdown)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-destructive">Code expired</p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={() => handleVerifyOTP(otp.join(""))}
                    className="w-full h-12 text-base"
                    disabled={loading || otp.some(d => !d)}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="size-5" />
                        Verify & Sign In
                      </span>
                    )}
                  </Button>

                  {/* Resend */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={!canResend || loading}
                      className="text-muted-foreground"
                    >
                      {canResend ? "Resend Code" : `Resend in ${formatTime(countdown)}`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
