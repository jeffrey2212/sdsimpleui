"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, RefreshCw, ArrowLeft, ArrowRight, Check, Wand2, Edit, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import GenerationOptions from "./generation-options"

// Define the steps in our prompt building process
const STEPS = [
  { id: "subject", label: "Subject", description: "Choose the main subject of your image" },
  { id: "details", label: "Details", description: "Add specific details about your subject" },
  { id: "setting", label: "Setting", description: "Select where your scene takes place" },
  { id: "style", label: "Style", description: "Choose an artistic style for your image" },
  { id: "mood", label: "Mood", description: "Set the emotional tone of your image" },
  { id: "elements", label: "Elements", description: "Add supporting elements to your scene" },
  { id: "composition", label: "Composition", description: "Determine how elements are arranged" },
]

interface StepOption {
  id: string
  label: string
  description: string
}

export default function MultiStepPromptBuilder() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, StepOption>>({})
  const [options, setOptions] = useState<StepOption[]>([])
  const [loading, setLoading] = useState(false)
  const [assembledPrompt, setAssembledPrompt] = useState("")
  const [editedAssembledPrompt, setEditedAssembledPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [activePromptTab, setActivePromptTab] = useState("original")
  const [generationOptions, setGenerationOptions] = useState({
    llmModel: "deepseek-r1:1.5b",
    promptTemplate: "illustrious",
    imageModel: "sdxl",
  })

  const currentStep = STEPS[currentStepIndex]
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Generate options based on current step and previous selections
  const generateOptions = async (reroll = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: currentStep.id,
          selections,
          reroll,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate options: ${response.status}`)
      }

      const data = await response.json()
      setOptions(data.options)
    } catch (error) {
      console.error("Error generating options:", error)
      setError(error instanceof Error ? error.message : "Failed to load options. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Generate the assembled prompt based on all selections
  const generateAssembledPrompt = () => {
    if (Object.keys(selections).length === 0) return ""

    const parts = []

    // Subject (always first)
    if (selections.subject) {
      parts.push(selections.subject.label)
    }

    // Details
    if (selections.details) {
      parts.push(`with ${selections.details.label}`)
    }

    // Setting
    if (selections.setting) {
      parts.push(`in ${selections.setting.label}`)
    }

    // Elements
    if (selections.elements) {
      parts.push(`featuring ${selections.elements.label}`)
    }

    // Composition
    if (selections.composition) {
      parts.push(`with ${selections.composition.label} composition`)
    }

    // Style
    if (selections.style) {
      parts.push(`in the style of ${selections.style.label}`)
    }

    // Mood
    if (selections.mood) {
      parts.push(`with a ${selections.mood.label} mood`)
    }

    // Add quality enhancers
    parts.push("high quality, detailed, 8k resolution")

    return parts.join(", ")
  }

  // Enhance the prompt with more descriptive language
  const enhancePrompt = async () => {
    setIsEnhancing(true)
    try {
      // Use the edited prompt if available, otherwise use the assembled prompt
      const promptToEnhance = editedAssembledPrompt || assembledPrompt

      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToEnhance,
          options: generationOptions,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to enhance prompt: ${response.status}`)
      }

      const data = await response.json()

      // Set the enhanced prompt, overwriting any previous version
      setEnhancedPrompt(data.enhancedPrompt)

      // Switch to the enhanced tab
      setActivePromptTab("enhanced")
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      setError("Failed to enhance prompt. Please try again.")
    } finally {
      setIsEnhancing(false)
    }
  }

  // Handle option selection
  const handleSelectOption = (option: StepOption) => {
    // Update selections
    const newSelections = {
      ...selections,
      [currentStep.id]: option,
    }
    setSelections(newSelections)

    // Move to next step or complete the process
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // We're at the last step, mark as complete
      setIsComplete(true)
    }
  }

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // Handle reroll of options
  const handleReroll = () => {
    generateOptions(true)
  }

  // Generate image from the prompt
  const handleGenerateImage = async () => {
    setGeneratingImage(true)
    try {
      // Use the enhanced prompt if available, otherwise use the edited or assembled prompt
      const promptToUse =
        activePromptTab === "enhanced" && enhancedPrompt ? enhancedPrompt : editedAssembledPrompt || assembledPrompt

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          options: generationOptions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Error generating image:", error)
      setError("Failed to generate image. Please try again.")
      // Fallback to placeholder for demo purposes
      const imageId = encodeURIComponent((editedAssembledPrompt || assembledPrompt).substring(0, 20))
      setGeneratedImage(`/api/images/${imageId}`)
    } finally {
      setGeneratingImage(false)
    }
  }

  // Reset the process to start over
  const handleReset = () => {
    setCurrentStepIndex(0)
    setSelections({})
    setAssembledPrompt("")
    setEditedAssembledPrompt("")
    setEnhancedPrompt("")
    setGeneratedImage("")
    setIsComplete(false)
    setActivePromptTab("original")
  }

  // Handle options change from the GenerationOptions component
  const handleOptionsChange = useCallback((options) => {
    setGenerationOptions(options)
  }, [])

  // Load options when the step changes
  useEffect(() => {
    generateOptions()
  }, [currentStepIndex])

  // Update assembled prompt when selections change
  useEffect(() => {
    const prompt = generateAssembledPrompt()
    setAssembledPrompt(prompt)
    setEditedAssembledPrompt(prompt) // Initialize edited prompt with assembled prompt
  }, [selections])

  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-gemini-blue" />
          <h1 className="text-3xl font-medium">Prompt Builder Wizard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left panel - Step progress and options */}
          <div className="lg:col-span-2 space-y-5">
            {/* Generation Options Section */}
            <GenerationOptions onOptionsChange={handleOptionsChange} />

            {/* Progress indicator */}
            <Card className="bg-gemini-card border-gemini-border shadow-gemini">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {!isComplete ? (
                    <CardTitle className="text-xl font-medium text-gemini-text">
                      Step {currentStepIndex + 1}: {currentStep.label}
                    </CardTitle>
                  ) : (
                    <CardTitle className="text-xl font-medium text-gemini-text">Review & Enhance</CardTitle>
                  )}
                  <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
                    {!isComplete ? `${currentStepIndex + 1} of ${STEPS.length}` : "Complete"}
                  </Badge>
                </div>
                <CardDescription className="text-gemini-text-secondary">
                  {!isComplete ? currentStep.description : "Review your prompt and enhance it if desired"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <Progress value={isComplete ? 100 : progress} className="h-2" />

                <div className="flex justify-between mt-2 text-xs text-gemini-text-secondary">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${
                        index <= currentStepIndex || isComplete ? "text-gemini-blue" : ""
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${
                          index < currentStepIndex || isComplete
                            ? "bg-gemini-blue"
                            : index === currentStepIndex
                              ? "bg-gemini-blue animate-pulse"
                              : "bg-gemini-border"
                        }`}
                      />
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options or Review & Enhance */}
            <Card className="bg-gemini-card border-gemini-border shadow-gemini">
              {!isComplete ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-medium text-gemini-text">Choose an option</CardTitle>
                      <Button
                        variant="gemini-outline"
                        size="sm"
                        onClick={handleReroll}
                        disabled={loading}
                        className="rounded-full"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        )}
                        Reroll
                      </Button>
                    </div>
                    <CardDescription className="text-gemini-text-secondary">
                      Select one option to continue to the next step
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {loading ? (
                      <div className="grid place-items-center h-64">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gemini-blue/20 blur-xl animate-pulse"></div>
                          <Loader2 className="h-10 w-10 animate-spin text-gemini-blue relative z-10" />
                        </div>
                      </div>
                    ) : error ? (
                      <div className="grid place-items-center h-64">
                        <div className="text-center">
                          <p className="text-red-400 mb-4">{error}</p>
                          <Button variant="gemini-outline" onClick={() => generateOptions()}>
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                            className="bg-gemini-input hover:bg-gemini-hover border border-gemini-border hover:border-gemini-blue/50 rounded-xl p-4 text-left transition-all"
                          >
                            <h3 className="font-medium mb-1">{option.label}</h3>
                            <p className="text-xs text-gemini-text-secondary">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button
                      variant="gemini-outline"
                      onClick={handleBack}
                      disabled={currentStepIndex === 0}
                      className="rounded-xl"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <div className="flex gap-2">
                      {/* Skip to Next Step button */}
                      {currentStepIndex < STEPS.length - 1 && Object.keys(selections).length > 0 && (
                        <Button
                          variant="gemini-outline"
                          onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                          className="rounded-xl"
                        >
                          Skip
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}

                      {/* Skip to End button - only show from step 2 onwards */}
                      {currentStepIndex >= 1 && Object.keys(selections).length > 0 && (
                        <Button variant="gemini-outline" onClick={() => setIsComplete(true)} className="rounded-xl">
                          Skip to End
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-medium text-gemini-text">
                        Review & Enhance Your Prompt
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="gemini-outline"
                          size="sm"
                          onClick={() => {
                            setIsComplete(false)
                            setCurrentStepIndex(STEPS.length - 1)
                          }}
                          className="rounded-full"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                          Back to Step 7
                        </Button>
                        <Button variant="gemini-outline" size="sm" onClick={handleReset} className="rounded-full">
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Start Over
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-gemini-text-secondary">
                      Edit your prompt directly or enhance it with AI assistance
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs value={activePromptTab} onValueChange={setActivePromptTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="original" className="flex items-center gap-1">
                          <Edit className="h-3.5 w-3.5" />
                          Original
                        </TabsTrigger>
                        <TabsTrigger value="enhanced" className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5" />
                          Enhanced
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="original" className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="assembled-prompt" className="text-sm font-medium">
                            Your Assembled Prompt
                          </label>
                          <Textarea
                            id="assembled-prompt"
                            value={editedAssembledPrompt}
                            onChange={(e) => setEditedAssembledPrompt(e.target.value)}
                            placeholder="Edit your prompt here..."
                            className="min-h-[120px] bg-gemini-input border-gemini-border"
                          />
                          <p className="text-xs text-gemini-text-secondary">
                            You can edit this prompt directly to customize it further.
                          </p>
                        </div>

                        <Button
                          variant="gemini-outline"
                          onClick={enhancePrompt}
                          disabled={isEnhancing || !editedAssembledPrompt}
                          className="w-full rounded-xl"
                        >
                          {isEnhancing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Enhance Prompt
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="enhanced" className="space-y-4">
                        {enhancedPrompt ? (
                          <div className="space-y-2">
                            <label htmlFor="enhanced-prompt" className="text-sm font-medium">
                              Enhanced Prompt
                            </label>
                            <Textarea
                              id="enhanced-prompt"
                              value={enhancedPrompt}
                              onChange={(e) => setEnhancedPrompt(e.target.value)}
                              placeholder="Your enhanced prompt will appear here..."
                              className="min-h-[120px] bg-gemini-input border-gemini-border"
                            />
                            <p className="text-xs text-gemini-text-secondary">
                              This is an AI-enhanced version of your prompt. You can edit it further or click "Enhance
                              Prompt" again to generate a new version.
                            </p>

                            <Button
                              variant="gemini-outline"
                              onClick={enhancePrompt}
                              disabled={isEnhancing}
                              className="w-full rounded-xl"
                            >
                              {isEnhancing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enhancing...
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-2 h-4 w-4" />
                                  Enhance Again
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Zap className="h-12 w-12 mx-auto text-gemini-blue/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Enhanced Prompt Yet</h3>
                            <p className="text-gemini-text-secondary mb-4">
                              Click "Enhance Prompt" on the Original tab to generate an enhanced version.
                            </p>
                            <Button
                              variant="gemini-outline"
                              onClick={() => setActivePromptTab("original")}
                              className="rounded-xl"
                            >
                              Go to Original
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <Separator className="my-6 bg-gemini-border" />

                    <Button
                      variant="gemini"
                      onClick={handleGenerateImage}
                      disabled={generatingImage || (!editedAssembledPrompt && !enhancedPrompt)}
                      className="w-full rounded-xl"
                    >
                      {generatingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          </div>

          {/* Right panel - Selections and Generated Image */}
          <div className="lg:col-span-1">
            <Card className="bg-gemini-card border-gemini-border shadow-gemini mb-6 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium text-gemini-text">Your Selections</CardTitle>
                <CardDescription className="text-gemini-text-secondary">
                  {Object.keys(selections).length} of {STEPS.length} steps completed
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {STEPS.map((step) => (
                    <div key={step.id} className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                          selections[step.id] ? "bg-gemini-blue text-black" : "bg-gemini-input"
                        }`}
                      >
                        {selections[step.id] && <Check className="h-3 w-3" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{step.label}</h3>
                        {selections[step.id] ? (
                          <p className="text-sm text-gemini-blue">{selections[step.id].label}</p>
                        ) : (
                          <p className="text-xs text-gemini-text-secondary italic">Not selected yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {generatedImage && (
                  <>
                    <Separator className="my-4 bg-gemini-border" />

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Generated Image</h3>
                      <div className="rounded-2xl overflow-hidden border border-gemini-border">
                        <Image
                          src={generatedImage || "/placeholder.svg"}
                          alt="Generated from prompt"
                          width={512}
                          height={512}
                          className="w-full"
                          priority
                        />
                      </div>
                      <p className="text-xs text-gemini-text-secondary">
                        Generated using {activePromptTab === "enhanced" && enhancedPrompt ? "enhanced" : "original"}{" "}
                        prompt with {generationOptions.imageModel}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

