import { type NextRequest, NextResponse } from "next/server"
import { ollama, type ListResponse } from "@/lib/ollama-client"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Fetching Ollama models ===")
    
    const response = await ollama.list()
    console.log("Raw models response:", JSON.stringify(response, null, 2))

    // Transform the response to include only model names
    const models = response.models.map(model => model.name)

    console.log("Transformed models for UI:", models)
    return NextResponse.json({ models })

  } catch (error) {
    console.error("Error fetching models:", error)
    
    // Return mock data in case of error
    return NextResponse.json(
      { 
        models: ["llama2"],
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    )
  }
}
