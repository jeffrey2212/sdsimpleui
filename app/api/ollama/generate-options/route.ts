import { NextRequest, NextResponse } from "next/server"
import { ollama } from "@/lib/ollama-client"

interface GenerateOptionsRequest {
  category: string
  previousOptions?: string[]
  isReroll?: boolean
  model: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Starting generate-options request ===")
    
    const body: GenerateOptionsRequest = await request.json()
    const { category, previousOptions, isReroll, model } = body
    console.log("Request body:", { category, previousOptions, isReroll, model })

    // Construct the prompt
    const prompt = `Generate 6 single-word options for a text-to-image prompt builder.
Category: "${category}"
${isReroll ? `Previous options to avoid: ${previousOptions?.join(", ")}` : ""}

Requirements:
1. Each option MUST be exactly ONE word
2. Words should be specific and evocative
3. Words should work well in image generation prompts
4. If this is a reroll, provide completely different options

Return ONLY a JSON array with this exact format, no other text:
[
  {"id": "cat-1", "label": "word1"},
  {"id": "cat-2", "label": "word2"}
]`

    console.log("Generated prompt:", prompt)

    // Use generate method
    const response = await ollama.generate({
      model: model || "llama2",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.8, // Increase variety for rerolls
        top_p: 0.9,
      }
    })

    console.log("Raw response from Ollama:", response)
    let options = []

    try {
      // Parse the response from the LLM
      const responseText = response.response
      console.log("Response text to parse:", responseText)
      
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim()
      console.log("Cleaned text:", cleanedText)
      
      options = JSON.parse(cleanedText)
      console.log("Parsed options:", options)

      // Validate the response format
      if (!Array.isArray(options) || options.length === 0) {
        throw new Error("Invalid response format")
      }

      // Ensure we have exactly 6 options
      options = options.slice(0, 6)
      while (options.length < 6) {
        options.push({
          id: `${category}-${Date.now()}-${options.length}`,
          label: `Option ${options.length + 1}`,
        })
      }

      // Ensure each option has id and label
      options = options.map((opt, index) => ({
        id: opt.id || `${category}-${Date.now()}-${index}`,
        label: opt.label || `Option ${index + 1}`,
        category: category,
      }))
      console.log("Final processed options:", options)
    } catch (error) {
      console.error("Error parsing LLM response:", error)
      throw new Error("Failed to parse LLM response")
    }

    console.log("=== Successfully generated options ===")
    return NextResponse.json({ options, source: "llm" })

  } catch (error) {
    console.error("=== Error in generate-options ===")
    console.error("Error details:", error)
    
    // Return fallback options in case of error
    const fallbackOptions = Array.from({ length: 6 }, (_, i) => ({
      id: `fallback-${Date.now()}-${i}`,
      label: `Portrait ${i + 1}`,
      category: "subject",
    }))
    console.log("Using fallback options:", fallbackOptions)

    return NextResponse.json(
      { 
        options: fallbackOptions,
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 }
    )
  }
}
