import { NextResponse } from "next/server"
import { predict } from "@/lib/ml-model"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { temperature, vibration, current } = body

    if (
      temperature === undefined ||
      vibration === undefined ||
      current === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: temperature, vibration, current" },
        { status: 400 }
      )
    }

    const temp = parseFloat(temperature)
    const vib = parseFloat(vibration)
    const curr = parseFloat(current)

    if (isNaN(temp) || isNaN(vib) || isNaN(curr)) {
      return NextResponse.json(
        { error: "All sensor values must be valid numbers" },
        { status: 400 }
      )
    }

    const result = predict(temp, vib, curr)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: `Prediction failed: ${error}` },
      { status: 500 }
    )
  }
}
