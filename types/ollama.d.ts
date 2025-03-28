declare module 'ollama' {
  export interface OllamaOptions {
    host?: string
  }

  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
  }

  export interface ChatOptions {
    model: string
    messages: Array<{ role: string; content: string }>
    stream?: boolean
    options?: {
      temperature?: number
      top_p?: number
      [key: string]: any
    }
  }

  export interface ChatResponse {
    message: {
      role: string
      content: string
    }
    done: boolean
  }

  export interface GenerateOptions {
    model: string
    prompt: string
    stream?: boolean
    options?: {
      temperature?: number
      top_p?: number
      [key: string]: any
    }
  }

  export interface GenerateResponse {
    response: string
    done: boolean
  }

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

  export class Ollama {
    constructor(options?: OllamaOptions)
    chat(options: ChatOptions): Promise<ChatResponse>
    generate(options: GenerateOptions): Promise<GenerateResponse>
    list(): Promise<ListResponse>
  }
}
