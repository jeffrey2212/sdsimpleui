"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, X, RefreshCw, Wand2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { generateOptionsForCategory, enhancePrompt } from "@/lib/prompt-utils"
import type { CategoryOption, Keyword } from "@/lib/types"
// Replace the import for OptionsSection
import OptionsSection from "@/components/options-section-debug"

// Primary categories
const primaryCategories = [
  { id: "subject", label: "Subject", description: "What is the main focus of your image?" },
  { id: "style", label: "Style", description: "What artistic style should the image have?" },
  { id: "lighting", label: "Lighting", description: "How should the scene be lit?" },
  { id: "composition", label: "Composition", description: "How should elements be arranged?" },
  { id: "mood", label: "Mood", description: "What feeling or atmosphere should the image convey?" },
  { id: "color", label: "Color", description: "What color palette should be used?" },
  { id: "setting", label: "Setting", description: "Where does the scene take place?" },
  { id: "time", label: "Time Period", description: "When does the scene take place?" },
]

// Default options that appear in every sub-category
const defaultOptions = [
  { id: "high-quality", label: "High Quality", category: "default" },
  { id: "detailed", label: "Detailed", category: "default" },
]

export default function PromptBuilder() {
  const [activeCategory, setActiveCategory] = useState("subject")
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([...defaultOptions])
  const [customKeyword, setCustomKeyword] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")
  const [generationOptions, setGenerationOptions] = useState({
    llmModel: "",
    promptTemplate: "illustrious",
    imageModel: "",
  })

  // Refs for category tabs scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)

  // Check if tabs need scroll buttons
  const checkScrollButtons = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  // Scroll tabs left or right
  const scrollTabs = useCallback(
    (direction: "left" | "right") => {
      if (tabsContainerRef.current) {
        const scrollAmount = 200
        const newScrollLeft =
          direction === "left"
            ? tabsContainerRef.current.scrollLeft - scrollAmount
            : tabsContainerRef.current.scrollLeft + scrollAmount

        tabsContainerRef.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        })

        // Update scroll buttons after scrolling
        setTimeout(checkScrollButtons, 300)
      }
    },
    [checkScrollButtons],
  )

  // Add scroll event listener to tabs container
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current
    if (tabsContainer) {
      tabsContainer.addEventListener("scroll", checkScrollButtons)
      // Initial check
      checkScrollButtons()

      return () => {
        tabsContainer.removeEventListener("scroll", checkScrollButtons)
      }
    }
  }, [checkScrollButtons])

  // Check scroll buttons on window resize
  useEffect(() => {
    window.addEventListener("resize", checkScrollButtons)
    return () => {
      window.removeEventListener("resize", checkScrollButtons)
    }
  }, [checkScrollButtons])

  // Load options when category changes
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true)
      try {
        const options = await generateOptionsForCategory(activeCategory)
        setCategoryOptions(options)
      } catch (error) {
        console.error("Error loading options:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [activeCategory])

  // Update enhanced prompt whenever selected keywords change
  useEffect(() => {
    setEnhancedPrompt(enhancePrompt(selectedKeywords))
  }, [selectedKeywords])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleOptionClick = (option: CategoryOption) => {
    // Check if the option is already selected
    const isSelected = selectedKeywords.some((kw) => kw.id === option.id)

    if (isSelected) {
      // Remove the option if already selected
      setSelectedKeywords(selectedKeywords.filter((kw) => kw.id !== option.id))
    } else {
      // Add the option if not already selected
      setSelectedKeywords([...selectedKeywords, option])
    }
  }

  const handleRemoveKeyword = (keywordId: string) => {
    // Don't allow removing default options
    if (defaultOptions.some((opt) => opt.id === keywordId)) return

    setSelectedKeywords(selectedKeywords.filter((kw) => kw.id !== keywordId))
  }

  const handleAddCustomKeyword = () => {
    if (!customKeyword.trim()) return

    const newKeyword = {
      id: `custom-${Date.now()}`,
      label: customKeyword.trim(),
      category: "custom",
    }

    setSelectedKeywords([...selectedKeywords, newKeyword])
    setCustomKeyword("")
  }

  const handleRerollOptions = async () => {
    setLoading(true)

    try {
      const options = await generateOptionsForCategory(activeCategory, true)
      setCategoryOptions(options)
    } catch (error) {
      console.error("Error rerolling options:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
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
      // Fallback to placeholder for demo purposes
      setGeneratedImage("/placeholder.svg?height=512&width=512")
    } finally {
      setIsGenerating(false)
    }
  }

  // Check if an option is selected
  const isOptionSelected = (optionId: string) => {
    return selectedKeywords.some((kw) => kw.id === optionId)
  }

  // Handle options change from the OptionsSection component
  const handleOptionsChange = useCallback(
    (options: {
      llmModel: string
      promptTemplate: string
      imageModel: string
    }) => {
      setGenerationOptions(options)
    },
    [],
  )

  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-gemini-blue" />
          <h1 className="text-3xl font-medium">Gemini Image Creator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left panel - Categories and Options */}
          <div className="lg:col-span-2 space-y-5">
            {/* Options Section - Always visible on all screen sizes */}
            <OptionsSection onOptionsChange={handleOptionsChange} />

            {/* Categories and Keywords Section */}
            <Card className="bg-gemini-card border-gemini-border shadow-gemini">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium text-gemini-text">Choose Categories & Keywords</CardTitle>
                <CardDescription className="text-gemini-text-secondary">
                  Select from the categories below to build your prompt
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs
                  defaultValue="subject"
                  value={activeCategory}
                  onValueChange={handleCategoryChange}
                  className="w-full"
                >
                  <div className="relative">
                    {/* Left scroll button */}
                    {showLeftScroll && (
                      <button
                        onClick={() => scrollTabs("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gemini-card/80 hover:bg-gemini-hover rounded-full p-1 backdrop-blur-sm"
                        aria-label="Scroll categories left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}

                    {/* Scrollable tabs container */}
                    <div ref={tabsContainerRef} className="w-full overflow-x-auto scrollbar-hide pb-2 px-6">
                      <TabsList className="w-max justify-start bg-gemini-input h-auto p-1">
                        {primaryCategories.map((category) => (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="rounded-full py-1.5 px-3 data-[state=active]:bg-gemini-blue data-[state=active]:text-black"
                          >
                            {category.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Right scroll button */}
                    {showRightScroll && (
                      <button
                        onClick={() => scrollTabs("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gemini-card/80 hover:bg-gemini-hover rounded-full p-1 backdrop-blur-sm"
                        aria-label="Scroll categories right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {primaryCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gemini-text-secondary">{category.description}</h3>
                          <Button
                            variant="gemini-outline"
                            size="sm"
                            onClick={handleRerollOptions}
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

                        {loading ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-h-[200px] place-content-center">
                            <div className="col-span-full flex justify-center">
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-gemini-blue/20 blur-xl animate-pulse"></div>
                                <Loader2 className="h-8 w-8 animate-spin text-gemini-blue relative z-10" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {/* Dynamic options */}
                              {categoryOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleOptionClick(option)}
                                  className={`p-3 rounded-xl text-left transition-all ${
                                    isOptionSelected(option.id)
                                      ? "bg-gemini-selected border border-gemini-blue/50"
                                      : "bg-gemini-input border border-transparent hover:bg-gemini-hover"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}

                              {/* Only show default options if we're not in the default category */}
                              {activeCategory !== "default" &&
                                defaultOptions.map((option) => (
                                  <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option)}
                                    className={`p-3 rounded-xl text-left transition-all ${
                                      isOptionSelected(option.id)
                                        ? "bg-gemini-selected border border-gemini-blue/50"
                                        : "bg-gemini-input border border-transparent hover:bg-gemini-hover"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Input
                                placeholder="Add custom keyword..."
                                value={customKeyword}
                                onChange={(e) => setCustomKeyword(e.target.value)}
                                className="bg-gemini-input border-gemini-border rounded-xl"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddCustomKeyword()
                                  }
                                }}
                              />
                              <Button
                                variant="gemini-outline"
                                onClick={handleAddCustomKeyword}
                                disabled={!customKeyword.trim()}
                                className="rounded-xl"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced prompt preview */}
            {enhancedPrompt && (
              <Card className="bg-gemini-card border-gemini-border shadow-gemini">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-medium text-gemini-text">Prompt Preview</CardTitle>
                  <CardDescription className="text-gemini-text-secondary">
                    Your prompt will be enhanced with additional context
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gemini-input rounded-2xl">
                    <p className="text-sm text-gemini-text">{enhancedPrompt}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right panel - Selected Keywords and Generation */}
          <div className="lg:col-span-1">
            <Card className="bg-gemini-card border-gemini-border shadow-gemini mb-6 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-medium text-gemini-text">Selected Keywords</CardTitle>
                <CardDescription className="text-gemini-text-secondary">
                  {selectedKeywords.length} keywords selected
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 min-h-[100px]">
                  {selectedKeywords.length === 0 ? (
                    <p className="text-gemini-text-secondary text-sm">
                      No keywords selected. Click on options to add them.
                    </p>
                  ) : (
                    selectedKeywords.map((keyword) => (
                      <Badge
                        key={keyword.id}
                        variant="gemini"
                        className={`px-3 py-1.5 flex items-center gap-1 ${
                          keyword.category === "default" ? "bg-gemini-blue/20" : ""
                        }`}
                      >
                        {keyword.label}
                        <button
                          onClick={() => handleRemoveKeyword(keyword.id)}
                          className={`ml-1 rounded-full hover:bg-gemini-hover p-0.5 ${
                            keyword.category === "default" ? "invisible" : ""
                          }`}
                          aria-label={`Remove ${keyword.label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                <Separator className="my-4 bg-gemini-border" />

                <Button
                  variant="gemini"
                  onClick={handleGenerateImage}
                  disabled={selectedKeywords.length === 0 || isGenerating}
                  className="w-full rounded-xl"
                >
                  {isGenerating ? (
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
                  <p className="text-xs text-gemini-text-secondary mt-2 text-center">
                    {generationOptions.imageModel && (
                      <span className="block mb-1">
                        Model: {generationOptions.imageModel} | Template: {generationOptions.promptTemplate}
                      </span>
                    )}
                    Prompt: {enhancedPrompt}
                  </p>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

