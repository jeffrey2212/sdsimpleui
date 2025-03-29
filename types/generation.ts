export interface GenerationOptions {
  llmModel: string
  promptTemplate: string
  imageModel: string
}

export const defaultOptions: GenerationOptions = {
  llmModel: "gemma3:1b",
  promptTemplate: "illustrious",
  imageModel: "sdxl"
}
