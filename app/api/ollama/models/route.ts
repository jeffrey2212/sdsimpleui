import { type NextRequest, NextResponse } from "next/server"

interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

interface OllamaResponse {
  models: OllamaModel[]
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would call the Ollama API
    // const response = await fetch('http://localhost:11434/api/tags', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const data = await response.json();

    // For demo purposes, we'll return mock data
    const mockModels: OllamaModel[] = [
      {
        name: "llama3",
        modified_at: "2024-04-18T10:23:45Z",
        size: 4200000000,
        digest: "sha256:abc123",
        details: {
          format: "gguf",
          family: "llama",
          families: ["llama"],
          parameter_size: "8B",
          quantization_level: "Q4_K_M",
        },
      },
      {
        name: "mistral",
        modified_at: "2024-04-17T14:12:33Z",
        size: 3800000000,
        digest: "sha256:def456",
        details: {
          format: "gguf",
          family: "mistral",
          families: ["mistral"],
          parameter_size: "7B",
          quantization_level: "Q4_K_M",
        },
      },
      {
        name: "gemma",
        modified_at: "2024-04-16T09:45:21Z",
        size: 3500000000,
        digest: "sha256:ghi789",
        details: {
          format: "gguf",
          family: "gemma",
          families: ["gemma"],
          parameter_size: "7B",
          quantization_level: "Q4_K_M",
        },
      },
      {
        name: "phi3",
        modified_at: "2024-04-15T16:33:12Z",
        size: 2900000000,
        digest: "sha256:jkl012",
        details: {
          format: "gguf",
          family: "phi",
          families: ["phi"],
          parameter_size: "3.8B",
          quantization_level: "Q4_K_M",
        },
      },
    ]

    return NextResponse.json({ models: mockModels })
  } catch (error) {
    console.error("Error fetching Ollama models:", error)
    return NextResponse.json(
      { error: "Failed to fetch models", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

