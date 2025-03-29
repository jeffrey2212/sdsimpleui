"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Settings, Check, AlertCircle } from "lucide-react"
import type { GenerationOptions } from "@/types/generation"
import { defaultOptions } from "@/types/generation"

interface GenerationOptionsProps {
  onOptionsChange: (options: GenerationOptions) => void
  selectedOptions?: GenerationOptions
}

export default function GenerationOptions({ 
  onOptionsChange, 
  selectedOptions = defaultOptions 
}: GenerationOptionsProps) {
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [selectedLlmModel, setSelectedLlmModel] = useState(selectedOptions.llmModel)
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState(selectedOptions.promptTemplate)
  const [selectedImageModel, setSelectedImageModel] = useState(selectedOptions.imageModel)

  // Server status states
  const [llmServerStatus, setLlmServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const [comfyServerStatus, setComfyServerStatus] = useState<"online" | "offline" | "checking">("checking")

  // Local state for options with explicit default
  const [localOptions, setLocalOptions] = useState<GenerationOptions>(() => ({
    llmModel: selectedOptions.llmModel || defaultOptions.llmModel,
    promptTemplate: selectedOptions.promptTemplate || defaultOptions.promptTemplate,
    imageModel: selectedOptions.imageModel || defaultOptions.imageModel
  }))

  // Debug logging for initial state
  useEffect(() => {
    console.log('[GenerationOptions] Initial state:', {
      selectedOptions,
      localOptions,
      models,
      llmServerStatus
    })
  }, [])

  // Update local state when props change
  useEffect(() => {
    console.log('[GenerationOptions] Props changed:', selectedOptions)
    setLocalOptions(selectedOptions)
  }, [selectedOptions])

  // Store current selections in localStorage
  useEffect(() => {
    if (localOptions) {
      localStorage.setItem('generationOptions', JSON.stringify({
        model: localOptions.llmModel,
        promptTemplate: localOptions.promptTemplate,
        imageModel: localOptions.imageModel
      }))
    }
  }, [localOptions])

  // Load saved values on mount
  useEffect(() => {
    const savedOptions = localStorage.getItem('generationOptions')
    if (savedOptions) {
      try {
        const options = JSON.parse(savedOptions)
        onOptionsChange({
          llmModel: options.model || "gemma3:latest",
          promptTemplate: options.promptTemplate || "illustrious",
          imageModel: options.imageModel || "sdxl"
        })
      } catch (error) {
        console.error('Error loading saved options:', error)
      }
    }
  }, [onOptionsChange])

  // Fetch server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch("/api/server-status")
        if (response.ok) {
          const data = await response.json()
          setLlmServerStatus(data.llmServer)
          setComfyServerStatus(data.comfyServer)
        } else {
          setLlmServerStatus("offline")
          setComfyServerStatus("offline")
        }
      } catch (error) {
        console.error("Error checking server status:", error)
        setLlmServerStatus("offline")
        setComfyServerStatus("offline")
      }
    }

    checkServerStatus()
    // Poll server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch LLM models
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/ollama/models")

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`)
        }

        const data = await response.json()
        setModels(data.models)
      } catch (err) {
        console.error("Error fetching models:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (llmServerStatus === "online") {
    fetchModels()
    }
  }, [llmServerStatus])

  const handleOptionChange = (key: keyof GenerationOptions, value: string) => {
    console.log(`[GenerationOptions] handleOptionChange called - ${key}:`, value)
    const newOptions = { 
      ...localOptions, 
      [key]: value 
    }
    console.log('[GenerationOptions] Setting new options:', newOptions)
    setLocalOptions(newOptions)
    onOptionsChange(newOptions)
  }

  return (
    <div className="bg-gemini-card border border-gemini-border rounded-2xl shadow-gemini mb-5">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gemini-blue" />
          <h3 className="text-sm font-medium text-gemini-text">Generation Options</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Server Status Indicators */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`px-2 py-0.5 text-xs flex items-center gap-1 ${
                llmServerStatus === "online"
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : llmServerStatus === "checking"
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                    : "bg-red-500/20 text-red-500 border-red-500/30"
              }`}
            >
              {llmServerStatus === "online" ? (
                <Check className="h-3 w-3" />
              ) : llmServerStatus === "checking" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              <span>LLM Server</span>
            </Badge>

            <Badge
              variant="outline"
              className={`px-2 py-0.5 text-xs flex items-center gap-1 ${
                comfyServerStatus === "online"
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : comfyServerStatus === "checking"
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                    : "bg-red-500/20 text-red-500 border-red-500/30"
              }`}
            >
              {comfyServerStatus === "online" ? (
                <Check className="h-3 w-3" />
              ) : comfyServerStatus === "checking" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              <span>ComfyUI Server</span>
            </Badge>
          </div>

          {/* Dialog-based Configuration */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="gemini-outline"
                size="sm"
                className="rounded-xl h-8 text-xs flex items-center gap-1.5"
                onClick={() => setDialogOpen(true)}
              >
                Configure
                <Settings className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gemini-card border-gemini-border">
              <DialogHeader>
                <DialogTitle className="text-gemini-text">Generation Settings</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* LLM Model Selection */}
                <div className="space-y-2">
                  <label htmlFor="llm-model" className="text-xs font-medium text-gemini-text-secondary block">
                    LLM Model
                  </label>
                  <Select
                    value={selectedLlmModel}
                    onValueChange={(value) => {
                      setSelectedLlmModel(value);
                      handleOptionChange('llmModel', value);
                    }}
                    disabled={loading || models.length === 0}
                  >
                    <SelectTrigger
                      id="llm-model"
                      className="bg-gemini-input border-gemini-border h-8 text-xs transition-colors hover:border-gemini-blue/50 focus:border-gemini-blue"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select LLM model" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-gemini-card border-gemini-border">
                      {error ? (
                        <div className="p-2 text-xs text-red-500">{error}</div>
                      ) : (
                        <>
                          <SelectItem value="deepseek-r1:1.5b" className="text-gemini-text text-xs">
                            deepseek-r1:1.5b (1.5B)
                          </SelectItem>
                          {models.map((modelName) => (
                            <SelectItem key={modelName} value={modelName} className="text-gemini-text text-xs">
                              {modelName}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Template Selection */}
                <div className="space-y-2">
                  <label htmlFor="prompt-template" className="text-xs font-medium text-gemini-text-secondary block">
                    Prompt Template
                  </label>
                  <Select 
                    value={selectedPromptTemplate} 
                    onValueChange={(value) => {
                      setSelectedPromptTemplate(value);
                      handleOptionChange('promptTemplate', value);
                    }}
                  >
                    <SelectTrigger
                      id="prompt-template"
                      className="bg-gemini-input border-gemini-border h-8 text-xs transition-colors hover:border-gemini-blue/50 focus:border-gemini-blue"
                    >
                      <SelectValue placeholder="Select prompt template" />
                    </SelectTrigger>
                    <SelectContent className="bg-gemini-card border-gemini-border">
                      <SelectItem value="illustrious" className="text-gemini-text text-xs">
                        Illustrious
                      </SelectItem>
                      <SelectItem value="flux-1d" className="text-gemini-text text-xs">
                        Flux.1 D
                      </SelectItem>
                      <SelectItem value="pony" className="text-gemini-text text-xs">
                        Pony
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Model Selection */}
                <div className="space-y-2">
                  <label htmlFor="image-model" className="text-xs font-medium text-gemini-text-secondary block">
                    Image Model
                  </label>
                  <Select 
                    value={selectedImageModel} 
                    onValueChange={(value) => {
                      setSelectedImageModel(value);
                      handleOptionChange('imageModel', value);
                    }}
                  >
                    <SelectTrigger
                      id="image-model"
                      className="bg-gemini-input border-gemini-border h-8 text-xs transition-colors hover:border-gemini-blue/50 focus:border-gemini-blue"
                    >
                      <SelectValue placeholder="Select image model" />
                    </SelectTrigger>
                    <SelectContent className="bg-gemini-card border-gemini-border">
                      <SelectItem value="sdxl" className="text-gemini-text text-xs">
                        Stable Diffusion XL
                      </SelectItem>
                      <SelectItem value="sd3" className="text-gemini-text text-xs">
                        Stable Diffusion 3
                      </SelectItem>
                      <SelectItem value="dalle3" className="text-gemini-text text-xs">
                        DALL-E 3
                      </SelectItem>
                      <SelectItem value="midjourney" className="text-gemini-text text-xs">
                        Midjourney
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button variant="gemini" className="w-full rounded-xl" onClick={() => setDialogOpen(false)}>
                    Apply Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="px-4 py-2 border-t border-gemini-border bg-gemini-input/30 rounded-b-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gemini-text-secondary">
          <span className="font-medium">Current:</span>

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedLlmModel}
          </Badge>

          <Separator orientation="vertical" className="h-3 bg-gemini-border/50" />

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedPromptTemplate}
          </Badge>

          <Separator orientation="vertical" className="h-3 bg-gemini-border/50" />

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedImageModel}
          </Badge>
        </div>
      </div>
    </div>
  )
}
