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
    messages: ChatMessage[]
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

  export class Ollama {
    constructor(options?: OllamaOptions)
    chat(options: ChatOptions): Promise<ChatResponse>
    generate(options: GenerateOptions): Promise<GenerateResponse>
  }
}
