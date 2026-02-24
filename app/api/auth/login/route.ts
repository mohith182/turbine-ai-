import { NextResponse } from "next/server"

// Mock users for demo purposes
const MOCK_USERS = [
  { email: "admin@turbineai.com", password: "admin123", name: "Admin User", role: "Administrator" },
  { email: "engineer@turbineai.com", password: "eng123", name: "Field Engineer", role: "Engineer" },
  { email: "demo@turbineai.com", password: "demo123", name: "Demo User", role: "Viewer" },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
