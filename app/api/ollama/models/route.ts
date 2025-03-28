import { NextRequest, NextResponse } from "next/server"

interface OllamaModelDetails {
  format: string
  family: string
  families: string[]
  parameter_size: string
  quantization_level?: string
}

interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
  details: OllamaModelDetails
}

interface OllamaResponse {
  models: OllamaModel[]
}

// Mock data for when server is unavailable
const mockModels: OllamaModel[] = [
  {
    name: "llama2",
    modified_at: "2024-03-28T10:23:45Z",
    size: 4200000000,
    digest: "sha256:abc123",
    details: {
      format: "gguf",
      family: "llama",
      families: ["llama"],
      parameter_size: "7B",
    },
  },
  {
    name: "mistral",
    modified_at: "2024-03-28T10:23:45Z",
    size: 4800000000,
    digest: "sha256:def456",
    details: {
      format: "gguf",
      family: "mistral",
      families: ["mistral"],
      parameter_size: "7B",
    },
  },
]

export async function GET(request: NextRequest) {
  try {
    const ollamaUrl = process.env.OLLAMA_URL
    if (!ollamaUrl) {
      throw new Error("OLLAMA_URL is not set")
    }

    // Try to fetch from Ollama server
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error(`Ollama server responded with status: ${response.status}`)
    }

    const data: OllamaResponse = await response.json()
    
    // Transform the data to match our model interface
    const models = data.models.map((model) => ({
      name: model.name,
      modified_at: model.modified_at,
      size: model.size,
      digest: model.digest,
      details: {
        format: model.details.format,
        family: model.details.family,
        families: model.details.families,
        parameter_size: model.details.parameter_size,
        quantization_level: model.details.quantization_level,
      },
    }))

    return NextResponse.json({ models, source: "live" })

  } catch (error) {
    console.warn("Failed to fetch from Ollama server, using mock data:", error)
    // Return mock data when server is unavailable
    return NextResponse.json({ 
      models: mockModels,
      source: "mock",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
