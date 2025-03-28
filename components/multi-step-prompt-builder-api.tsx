"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, RefreshCw, ArrowLeft, ArrowRight, Check, Wand2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

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

export default function MultiStepPromptBuilderApi() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, StepOption>>({})
  const [options, setOptions] = useState<StepOption[]>([])
  const [loading, setLoading] = useState(false)
  const [finalPrompt, setFinalPrompt] = useState("")
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")
  const [error, setError] = useState<string | null>(null)

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
      setError("Failed to load options. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Generate the final prompt based on all selections
  const generateFinalPrompt = async () => {
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate prompt: ${response.status}`)
      }

      const data = await response.json()
      setFinalPrompt(data.prompt)
      return data.prompt
    } catch (error) {
      console.error("Error generating prompt:", error)
      // Fallback to client-side prompt generation
      return generateClientSidePrompt()
    }
  }

  // Fallback client-side prompt generation
  const generateClientSidePrompt = () => {
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

  // Handle option selection
  const handleSelectOption = async (option: StepOption) => {
    // Update selections
    const newSelections = {
      ...selections,
      [currentStep.id]: option,
    }
    setSelections(newSelections)

    // Move to next step or generate final prompt
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // We're at the last step, generate the final prompt
      await generateFinalPrompt()
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

  // Generate image from the final prompt
  const handleGenerateImage = async () => {
    setGeneratingImage(true)
    try {
      // Ensure we have the latest prompt
      const prompt = await generateFinalPrompt()

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || finalPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error("Error generating image:", error)
      // Fallback to placeholder for demo purposes
      const imageId = encodeURIComponent(finalPrompt.substring(0, 20))
      setGeneratedImage(`/api/images/${imageId}`)
    } finally {
      setGeneratingImage(false)
    }
  }

  // Load options when the step changes
  useEffect(() => {
    generateOptions()
  }, [currentStepIndex])

  // Update final prompt when selections change
  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      // Only update the prompt if we have at least one selection
      // and we're not at the last step (to avoid unnecessary API calls)
      if (currentStepIndex < STEPS.length - 1) {
        setFinalPrompt(generateClientSidePrompt())
      } else {
        generateFinalPrompt()
      }
    }
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
            {/* Progress indicator */}
            <Card className="bg-gemini-card border-gemini-border shadow-gemini">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-medium text-gemini-text">
                    Step {currentStepIndex + 1}: {currentStep.label}
                  </CardTitle>
                  <Badge variant="gemini" className="bg-gemini-blue/10 border-gemini-blue/20">
                    {currentStepIndex + 1} of {STEPS.length}
                  </Badge>
                </div>
                <CardDescription className="text-gemini-text-secondary">{currentStep.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <Progress value={progress} className="h-2" />

                <div className="flex justify-between mt-2 text-xs text-gemini-text-secondary">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center ${index <= currentStepIndex ? "text-gemini-blue" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mb-1 ${
                          index < currentStepIndex
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

            {/* Options */}
            <Card className="bg-gemini-card border-gemini-border shadow-gemini">
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

                {/* This button is just for demo purposes to allow skipping steps */}
                {currentStepIndex < STEPS.length - 1 && (
                  <Button
                    variant="gemini-outline"
                    onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                    className="rounded-xl ml-auto"
                  >
                    Skip
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Right panel - Selections and Final Prompt */}
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

                <Separator className="my-4 bg-gemini-border" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Final Prompt</h3>
                  {finalPrompt ? (
                    <div className="p-3 bg-gemini-input rounded-xl text-sm">{finalPrompt}</div>
                  ) : (
                    <p className="text-xs text-gemini-text-secondary italic">
                      Complete all steps to generate your final prompt
                    </p>
                  )}
                </div>

                <Button
                  variant="gemini"
                  onClick={handleGenerateImage}
                  disabled={Object.keys(selections).length < STEPS.length || generatingImage}
                  className="w-full rounded-xl mt-4"
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

              {generatedImage && (
                <CardFooter className="flex-col items-center pt-0">
                  <h3 className="text-sm font-medium mb-2 self-start text-gemini-text-secondary">Generated Image:</h3>
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
                  <p className="text-xs text-gemini-text-secondary mt-2 text-center">Prompt: {finalPrompt}</p>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

