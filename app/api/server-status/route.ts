import { NextRequest, NextResponse } from "next/server"

// This is a mock API endpoint to check server status
export async function GET(request: NextRequest) {
  try {
    // Check Ollama server status directly
    const ollamaUrl = process.env.OLLAMA_URL || "http://jeffaiserver:11434"
    console.log("Checking Ollama status at:", ollamaUrl)
    
    let ollamaStatus = "offline"
    let ollamaError = null
    
    try {
      const ollamaResponse = await fetch(ollamaUrl)
      ollamaStatus = ollamaResponse.ok ? "online" : "offline"
    } catch (error) {
      console.error("Ollama connection error:", error)
      ollamaError = error instanceof Error ? error.message : "Unknown error"
    }
    
    // Mock ComfyUI status for now
    const comfyUIStatus = Math.random() > 0.2 ? "online" : "offline"

    return NextResponse.json({
      llmServer: ollamaStatus,
      comfyServer: comfyUIStatus,
      error: ollamaError,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking server status:", error)
    return NextResponse.json({
      llmServer: "offline",
      comfyServer: "offline",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
