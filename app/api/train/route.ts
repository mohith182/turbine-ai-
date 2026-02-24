import { NextResponse } from "next/server"
import { trainModel } from "@/lib/ml-model"

export async function POST() {
  try {
    const result = trainModel()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Training failed: ${error}` },
      { status: 500 }
    )
  }
}
