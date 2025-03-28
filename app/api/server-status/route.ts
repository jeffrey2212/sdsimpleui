import { NextResponse } from "next/server"

// This is a mock API endpoint to check server status
export async function GET() {
  try {
    // Simulate checking server status
    // In a real implementation, you would check if your servers are running

    // For demo purposes, we'll return random status with a bias toward online
    const llmServerStatus = Math.random() > 0.2 ? "online" : "offline"
    const comfyServerStatus = Math.random() > 0.2 ? "online" : "offline"

    return NextResponse.json({
      llmServer: llmServerStatus,
      comfyServer: comfyServerStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking server status:", error)
    return NextResponse.json({ error: "Failed to check server status" }, { status: 500 })
  }
}

