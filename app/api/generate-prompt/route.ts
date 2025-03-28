import { type NextRequest, NextResponse } from "next/server"

interface GeneratePromptRequest {
  selections: Record<
    string,
    {
      id: string
      label: string
      description: string
    }
  >
}

export async function POST(request: NextRequest) {
  try {
    const { selections }: GeneratePromptRequest = await request.json()

    if (!selections || Object.keys(selections).length === 0) {
      return NextResponse.json({ error: "Selections are required" }, { status: 400 })
    }

    // In a real implementation, you might use an LLM to generate a more natural-sounding prompt
    // For demo purposes, we'll use a simple template-based approach

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const prompt = generatePromptFromSelections(selections)

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 })
  }
}

// Helper function to generate a prompt from selections
function generatePromptFromSelections(selections: Record<string, { id: string; label: string; description: string }>) {
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

