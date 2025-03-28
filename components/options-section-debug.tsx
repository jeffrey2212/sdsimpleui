"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Server, Check, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { DebugDialog } from "./debug-dialog"

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

  // Handle model selection
  const handleLlmModelChange = (modelName: string) => {
    console.log("Selected LLM model:", modelName)
    setSelectedLlmModel(modelName)
  }

  const handlePromptTemplateChange = (template: string) => {
    console.log("Selected prompt template:", template)
    setSelectedPromptTemplate(template)
  }

  const handleImageModelChange = (model: string) => {
    console.log("Selected image model:", model)
    setSelectedImageModel(model)
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

          {/* Debug Dialog */}
          <DebugDialog>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gemini-text">Generation Settings</h4>

              {/* LLM Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gemini-text-secondary block">LLM Model</label>
                <div className="bg-gemini-input border border-gemini-border rounded-md p-2">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="p-2 text-xs text-red-500">{error}</div>
                  ) : (
                    <div className="space-y-1">
                      {llmModels.map((model) => (
                        <div
                          key={model.name}
                          className={`p-2 rounded-md text-xs cursor-pointer ${
                            selectedLlmModel === model.name
                              ? "bg-gemini-blue/20 border border-gemini-blue/50"
                              : "hover:bg-gemini-hover"
                          }`}
                          onClick={() => handleLlmModelChange(model.name)}
                        >
                          {model.name} ({model.details.parameter_size})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Template Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gemini-text-secondary block">Prompt Template</label>
                <div className="bg-gemini-input border border-gemini-border rounded-md p-2">
                  <div className="space-y-1">
                    {["illustrious", "flux-1d", "pony"].map((template) => (
                      <div
                        key={template}
                        className={`p-2 rounded-md text-xs cursor-pointer ${
                          selectedPromptTemplate === template
                            ? "bg-gemini-blue/20 border border-gemini-blue/50"
                            : "hover:bg-gemini-hover"
                        }`}
                        onClick={() => handlePromptTemplateChange(template)}
                      >
                        {template}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gemini-text-secondary block">Image Model</label>
                <div className="bg-gemini-input border border-gemini-border rounded-md p-2">
                  <div className="space-y-1">
                    {[
                      { id: "sdxl", name: "Stable Diffusion XL" },
                      { id: "sd3", name: "Stable Diffusion 3" },
                      { id: "dalle3", name: "DALL-E 3" },
                      { id: "midjourney", name: "Midjourney" },
                    ].map((model) => (
                      <div
                        key={model.id}
                        className={`p-2 rounded-md text-xs cursor-pointer ${
                          selectedImageModel === model.id
                            ? "bg-gemini-blue/20 border border-gemini-blue/50"
                            : "hover:bg-gemini-hover"
                        }`}
                        onClick={() => handleImageModelChange(model.id)}
                      >
                        {model.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DebugDialog>
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

