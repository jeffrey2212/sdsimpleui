import type { CategoryOption, Keyword } from "./types"

// Function to generate options for a category
export async function generateOptionsForCategory(category: string, reroll = false): Promise<CategoryOption[]> {
  // In a real implementation, this would call an LLM API
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Add a random seed for rerolling to get different options
  const seed = reroll ? Math.random() : 0

  // Return predefined options based on the category
  switch (category) {
    case "subject":
      return [
        { id: "portrait", label: "Portrait", category: "subject" },
        { id: "landscape", label: "Landscape", category: "subject" },
        { id: "animal", label: "Animal", category: "subject" },
        { id: "cityscape", label: "Cityscape", category: "subject" },
        { id: "still-life", label: "Still Life", category: "subject" },
        { id: "abstract", label: "Abstract", category: "subject" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "style":
      return [
        { id: "photorealistic", label: "Photorealistic", category: "style" },
        { id: "oil-painting", label: "Oil Painting", category: "style" },
        { id: "watercolor", label: "Watercolor", category: "style" },
        { id: "digital-art", label: "Digital Art", category: "style" },
        { id: "pixel-art", label: "Pixel Art", category: "style" },
        { id: "3d-render", label: "3D Render", category: "style" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "lighting":
      return [
        { id: "natural", label: "Natural Light", category: "lighting" },
        { id: "golden-hour", label: "Golden Hour", category: "lighting" },
        { id: "dramatic", label: "Dramatic", category: "lighting" },
        { id: "soft", label: "Soft", category: "lighting" },
        { id: "neon", label: "Neon", category: "lighting" },
        { id: "backlit", label: "Backlit", category: "lighting" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "composition":
      return [
        { id: "symmetrical", label: "Symmetrical", category: "composition" },
        { id: "rule-of-thirds", label: "Rule of Thirds", category: "composition" },
        { id: "minimalist", label: "Minimalist", category: "composition" },
        { id: "dynamic", label: "Dynamic", category: "composition" },
        { id: "close-up", label: "Close-up", category: "composition" },
        { id: "wide-angle", label: "Wide Angle", category: "composition" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "mood":
      return [
        { id: "peaceful", label: "Peaceful", category: "mood" },
        { id: "mysterious", label: "Mysterious", category: "mood" },
        { id: "joyful", label: "Joyful", category: "mood" },
        { id: "melancholic", label: "Melancholic", category: "mood" },
        { id: "energetic", label: "Energetic", category: "mood" },
        { id: "ethereal", label: "Ethereal", category: "mood" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "color":
      return [
        { id: "vibrant", label: "Vibrant", category: "color" },
        { id: "monochromatic", label: "Monochromatic", category: "color" },
        { id: "pastel", label: "Pastel", category: "color" },
        { id: "dark", label: "Dark", category: "color" },
        { id: "warm", label: "Warm", category: "color" },
        { id: "cool", label: "Cool", category: "color" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "setting":
      return [
        { id: "urban", label: "Urban", category: "setting" },
        { id: "nature", label: "Nature", category: "setting" },
        { id: "fantasy", label: "Fantasy", category: "setting" },
        { id: "futuristic", label: "Futuristic", category: "setting" },
        { id: "indoor", label: "Indoor", category: "setting" },
        { id: "underwater", label: "Underwater", category: "setting" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    case "time":
      return [
        { id: "modern", label: "Modern", category: "time" },
        { id: "vintage", label: "Vintage", category: "time" },
        { id: "medieval", label: "Medieval", category: "time" },
        { id: "ancient", label: "Ancient", category: "time" },
        { id: "futuristic", label: "Futuristic", category: "time" },
        { id: "timeless", label: "Timeless", category: "time" },
      ].sort(() => (reroll ? seed - 0.5 : 0))
    default:
      return []
  }
}

// Function to enhance the prompt with context and style suggestions
export function enhancePrompt(keywords: Keyword[]): string {
  if (!keywords.length) return ""

  // Group keywords by category
  const groupedKeywords = keywords.reduce(
    (acc, keyword) => {
      if (!acc[keyword.category]) {
        acc[keyword.category] = []
      }
      acc[keyword.category].push(keyword.label)
      return acc
    },
    {} as Record<string, string[]>,
  )

  // Build the prompt with natural language structure
  const promptParts = []

  // Add subject first (if available)
  if (groupedKeywords.subject && groupedKeywords.subject.length > 0) {
    promptParts.push(groupedKeywords.subject.join(" and "))
  }

  // Add setting (if available)
  if (groupedKeywords.setting && groupedKeywords.setting.length > 0) {
    promptParts.push(`in ${groupedKeywords.setting.join(" and ")}`)
  }

  // Add time period (if available)
  if (groupedKeywords.time && groupedKeywords.time.length > 0) {
    promptParts.push(`from ${groupedKeywords.time.join(" and ")} era`)
  }

  // Add mood (if available)
  if (groupedKeywords.mood && groupedKeywords.mood.length > 0) {
    promptParts.push(`with a ${groupedKeywords.mood.join(" and ")} atmosphere`)
  }

  // Add lighting (if available)
  if (groupedKeywords.lighting && groupedKeywords.lighting.length > 0) {
    promptParts.push(`with ${groupedKeywords.lighting.join(" and ")} lighting`)
  }

  // Add composition (if available)
  if (groupedKeywords.composition && groupedKeywords.composition.length > 0) {
    promptParts.push(`using ${groupedKeywords.composition.join(" and ")} composition`)
  }

  // Add color (if available)
  if (groupedKeywords.color && groupedKeywords.color.length > 0) {
    promptParts.push(`in ${groupedKeywords.color.join(" and ")} colors`)
  }

  // Add style (if available)
  if (groupedKeywords.style && groupedKeywords.style.length > 0) {
    promptParts.push(`in the style of ${groupedKeywords.style.join(" and ")}`)
  }

  // Add custom keywords (if available)
  if (groupedKeywords.custom && groupedKeywords.custom.length > 0) {
    promptParts.push(groupedKeywords.custom.join(", "))
  }

  // Add default quality enhancers (if available)
  if (groupedKeywords.default && groupedKeywords.default.length > 0) {
    promptParts.push(groupedKeywords.default.join(", "))
  } else {
    // Add some default quality enhancers if none were selected
    promptParts.push("high quality, detailed")
  }

  // Add a final quality enhancer
  promptParts.push("8k resolution")

  // Join everything into a coherent prompt
  return promptParts.join(", ")
}

