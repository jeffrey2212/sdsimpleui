import { NextResponse } from "next/server"

// This is a mock API endpoint to check server status
// In a real implementation, you would check actual server status
export async function GET() {
  try {
    // Simulate checking server status
    // In a real implementation, you would check if your servers are running

    const ollamaUrl = process.env.OLLAMA_URL
    if (!ollamaUrl) {
      throw new Error("OLLAMA_URL is not set")
    }

    const ollamaUrlStatusResponse = await fetch(ollamaUrl)
    const llmServerStatus = ollamaUrlStatusResponse.ok ? "online" : "offline"
    // const llmServerStatus = Math.random() > 0.2 ? "online" : "offline"
    const comfyServerStatus = Math.random() > 0.3 ? "online" : "offline"

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

