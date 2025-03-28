"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Server, Check, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OllamaModel {
  name: string
  details: {
    parameter_size: string
    family: string
  }
}

interface OptionsSectionProps {
  onOptionsChange: (options: {
    llmModel: string
    promptTemplate: string
    imageModel: string
  }) => void
}

export default function OptionsSection({ onOptionsChange }: OptionsSectionProps) {
  const [llmModels, setLlmModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedLlmModel, setSelectedLlmModel] = useState("")
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState("illustrious")
  const [selectedImageModel, setSelectedImageModel] = useState("sdxl")

  // Server status states
  const [llmServerStatus, setLlmServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const [comfyServerStatus, setComfyServerStatus] = useState<"online" | "offline" | "checking">("checking")

  // Check server status
  useEffect(() => {
    const checkLlmServer = async () => {
      try {
        const response = await fetch("/api/ollama/models")
        if (response.ok) {
          setLlmServerStatus("online")
        } else {
          setLlmServerStatus("offline")
        }
      } catch (error) {
        setLlmServerStatus("offline")
      }
    }

    const checkComfyServer = async () => {
      // In a real implementation, you would check the ComfyUI server status
      // For demo purposes, we'll simulate a check with a timeout
      setTimeout(() => {
        // 80% chance of being online for demo
        setComfyServerStatus(Math.random() > 0.2 ? "online" : "offline")
      }, 1500)
    }

    checkLlmServer()
    checkComfyServer()
  }, [])

  // Fetch LLM models from Ollama
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

        // Set default selection to first model if available
        if (data.models.length > 0 && !selectedLlmModel) {
          setSelectedLlmModel(data.models[0].name)
        }
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
    if (selectedLlmModel || selectedPromptTemplate || selectedImageModel) {
      onOptionsChange({
        llmModel: selectedLlmModel,
        promptTemplate: selectedPromptTemplate,
        imageModel: selectedImageModel,
      })
    }
  }, [selectedLlmModel, selectedPromptTemplate, selectedImageModel, onOptionsChange])

  // Get status badge color
  const getStatusColor = (status: "online" | "offline" | "checking") => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "offline":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "checking":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    }
  }

  // Get status icon
  const getStatusIcon = (status: "online" | "offline" | "checking") => {
    switch (status) {
      case "online":
        return <Check className="h-3 w-3" />
      case "offline":
        return <AlertCircle className="h-3 w-3" />
      case "checking":
        return <Loader2 className="h-3 w-3 animate-spin" />
    }
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
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs flex items-center gap-1 ${getStatusColor(llmServerStatus)}`}
              >
                {getStatusIcon(llmServerStatus)}
                <span className="hidden md:inline">LLM Server</span>
              </Badge>

              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs flex items-center gap-1 ${getStatusColor(comfyServerStatus)}`}
              >
                {getStatusIcon(comfyServerStatus)}
                <span className="hidden md:inline">ComfyUI Server</span>
              </Badge>
            </div>

            {/* Mobile status indicator */}
            <div className="sm:hidden">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs flex items-center gap-1 ${
                  llmServerStatus === "online" && comfyServerStatus === "online"
                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                    : "bg-red-500/20 text-red-500 border-red-500/30"
                }`}
              >
                <Server className="h-3 w-3" />
              </Badge>
            </div>
          </div>

          {/* Options Sheet (Mobile-friendly alternative to Popover/Dialog) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="gemini-outline" size="sm" className="rounded-xl h-8 text-xs flex items-center gap-1.5">
                <span className="hidden sm:inline">Configure</span>
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gemini-card border-gemini-border p-4">
              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-gemini-text">Generation Settings</h4>

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
                        llmModels.map((model) => (
                          <SelectItem key={model.name} value={model.name} className="text-gemini-text text-xs">
                            {model.name} ({model.details.parameter_size})
                          </SelectItem>
                        ))
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
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="px-4 py-2 border-t border-gemini-border bg-gemini-input/30 rounded-b-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gemini-text-secondary">
          <span className="font-medium">Current:</span>

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedLlmModel || "No LLM selected"}
          </Badge>

          <Separator orientation="vertical" className="h-3 bg-gemini-border/50" />

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedPromptTemplate}
          </Badge>

          <Separator orientation="vertical" className="h-3 bg-gemini-border/50" />

          <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
            {selectedImageModel || "No image model selected"}
          </Badge>
        </div>
      </div>
    </div>
  )
}

