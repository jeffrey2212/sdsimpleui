"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Settings, Check, AlertCircle, X } from "lucide-react"

interface OllamaModel {
  name: string
  details: {
    parameter_size: string
    family: string
  }
}

interface GenerationOptionsProps {
  onOptionsChange: (options: {
    llmModel: string
    promptTemplate: string
    imageModel: string
  }) => void
}

export default function GenerationOptions({ onOptionsChange }: GenerationOptionsProps) {
  const [llmModels, setLlmModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const configRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [selectedLlmModel, setSelectedLlmModel] = useState("deepseek-r1:1.5b")
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState("illustrious")
  const [selectedImageModel, setSelectedImageModel] = useState("sdxl")

  // Server status states
  const [llmServerStatus, setLlmServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const [comfyServerStatus, setComfyServerStatus] = useState<"online" | "offline" | "checking">("checking")

  // Handle click outside to close config panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        configRef.current &&
        !configRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsConfigOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Check server status
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
        setLlmModels(data.models)
      } catch (err) {
        console.error("Error fetching models:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Notify parent component when options change
  useEffect(() => {
    onOptionsChange({
      llmModel: selectedLlmModel,
      promptTemplate: selectedPromptTemplate,
      imageModel: selectedImageModel,
    })
  }, [selectedLlmModel, selectedPromptTemplate, selectedImageModel, onOptionsChange])

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

          {/* Custom Configuration Button and Panel */}
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="gemini-outline"
              size="sm"
              className="rounded-xl h-8 text-xs flex items-center gap-1.5"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              Configure
              <Settings className="h-3.5 w-3.5 ml-1" />
            </Button>

            {isConfigOpen && (
              <div
                ref={configRef}
                className="absolute right-0 top-full mt-2 w-[300px] bg-gemini-card border border-gemini-border rounded-xl shadow-lg p-4 z-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gemini-text">Generation Settings</h4>
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="text-gemini-text-secondary hover:text-gemini-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* LLM Model Selection */}
                  <div className="space-y-2">
                    <label htmlFor="llm-model" className="text-xs font-medium text-gemini-text-secondary block">
                      LLM Model
                    </label>
                    <Select
                      value={selectedLlmModel}
                      onValueChange={setSelectedLlmModel}
                      disabled={loading || llmModels.length === 0}
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
                            {llmModels.map((model) => (
                              <SelectItem key={model.name} value={model.name} className="text-gemini-text text-xs">
                                {model.name} ({model.details.parameter_size})
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
                    <Select value={selectedPromptTemplate} onValueChange={setSelectedPromptTemplate}>
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
                    <Select value={selectedImageModel} onValueChange={setSelectedImageModel}>
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
                </div>
              </div>
            )}
          </div>
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

