import { Ollama } from "ollama"

// Create a singleton instance of the Ollama client
const ollamaUrl = process.env.OLLAMA_URL || "http://jeffaiserver:11434"
export const ollama = new Ollama({ host: ollamaUrl })

// Export types that we'll use across the application
export interface ListResponse {
  models: Array<{
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
  }>
}
