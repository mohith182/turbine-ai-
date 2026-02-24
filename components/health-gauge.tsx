"use client"

import { cn } from "@/lib/utils"

interface HealthGaugeProps {
  score: number
  status: "Healthy" | "Warning" | "Critical"
  size?: "sm" | "lg"
}

export function HealthGauge({ score, status, size = "lg" }: HealthGaugeProps) {
  const isLarge = size === "lg"
  const svgSize = isLarge ? 200 : 120
  const strokeWidth = isLarge ? 12 : 8
  const radius = (svgSize - strokeWidth) / 2
  const circumference = radius * Math.PI // half circle
  const progress = (score / 100) * circumference

  const statusColor =
    status === "Healthy"
      ? "text-success"
      : status === "Warning"
      ? "text-warning"
      : "text-critical"

  const strokeColor =
    status === "Healthy"
      ? "stroke-success"
      : status === "Warning"
      ? "stroke-warning"
      : "stroke-critical"

  const bgStrokeColor =
    status === "Healthy"
      ? "stroke-success/15"
      : status === "Warning"
      ? "stroke-warning/15"
      : "stroke-critical/15"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize / 2 + strokeWidth }}>
        <svg
          width={svgSize}
          height={svgSize / 2 + strokeWidth}
          viewBox={`0 0 ${svgSize} ${svgSize / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${svgSize / 2}`}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={bgStrokeColor}
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${svgSize / 2}`}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference - progress}
            className={cn(strokeColor, "transition-all duration-1000 ease-out")}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className={cn(
              "font-bold",
              statusColor,
              isLarge ? "text-4xl" : "text-2xl"
            )}
          >
            {score}
          </span>
          <span className={cn("text-muted-foreground", isLarge ? "text-sm" : "text-xs")}>
            / 100
          </span>
        </div>
      </div>
      <span
        className={cn(
          "font-semibold uppercase tracking-wider",
          statusColor,
          isLarge ? "text-sm" : "text-xs"
        )}
      >
        {status}
      </span>
    </div>
  )
}
