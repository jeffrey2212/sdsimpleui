import { type NextRequest, NextResponse } from "next/server"

interface GenerateOptionsRequest {
  step: string
  selections: Record<
    string,
    {
      id: string
      label: string
      description: string
    }
  >
  reroll?: boolean
}

interface StepOption {
  id: string
  label: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    const { step, selections, reroll = false }: GenerateOptionsRequest = await request.json()

    if (!step) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 })
    }

    // In a real implementation, you would use an LLM or other AI system to generate
    // contextually relevant options based on the current step and previous selections

    // For demo purposes, we'll return mock data
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate options based on the step and previous selections
    const options = generateMockOptions(step, selections, reroll)

    return NextResponse.json({ options })
  } catch (error) {
    console.error("Error generating options:", error)
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 })
  }
}

// Helper function to generate mock options based on the current step and previous selections
function generateMockOptions(step: string, selections: Record<string, StepOption>, reroll = false): StepOption[] {
  // Add some randomness for reroll
  const seed = reroll ? Math.random() : 0.5

  // Base options for each step
  const baseOptions: Record<string, StepOption[]> = {
    subject: [
      { id: "portrait", label: "Human Portrait", description: "A detailed portrait of a person" },
      { id: "landscape", label: "Landscape", description: "A scenic natural environment" },
      { id: "animal", label: "Animal", description: "A creature from the animal kingdom" },
      { id: "still-life", label: "Still Life", description: "An arrangement of inanimate objects" },
      { id: "architecture", label: "Architecture", description: "Buildings or architectural elements" },
      { id: "abstract", label: "Abstract", description: "Non-representational forms and patterns" },
    ],
    details: [
      { id: "intricate", label: "Intricate Details", description: "Complex and elaborate features" },
      { id: "minimalist", label: "Minimalist Details", description: "Simple, clean, and uncluttered" },
      { id: "textured", label: "Rich Textures", description: "Detailed surface patterns and textures" },
      { id: "weathered", label: "Weathered Look", description: "Showing signs of age and use" },
      { id: "ornate", label: "Ornate Decoration", description: "Elaborate and decorative elements" },
      { id: "geometric", label: "Geometric Patterns", description: "Regular shapes and mathematical forms" },
    ],
    setting: [
      { id: "urban", label: "Urban Environment", description: "City streets and buildings" },
      { id: "nature", label: "Natural Setting", description: "Forests, mountains, or other natural landscapes" },
      { id: "fantasy", label: "Fantasy World", description: "Imaginary and magical environments" },
      { id: "underwater", label: "Underwater", description: "Beneath the ocean surface" },
      { id: "space", label: "Outer Space", description: "Cosmic scenes beyond Earth" },
      { id: "indoor", label: "Indoor Scene", description: "Inside a building or room" },
    ],
    style: [
      { id: "photorealistic", label: "Photorealistic", description: "Resembling a high-quality photograph" },
      { id: "impressionist", label: "Impressionist", description: "Capturing light and atmosphere over detail" },
      { id: "surrealist", label: "Surrealist", description: "Dreamlike and unexpected juxtapositions" },
      { id: "digital-art", label: "Digital Art", description: "Modern computer-generated aesthetic" },
      { id: "watercolor", label: "Watercolor", description: "Soft, transparent color washes" },
      { id: "pop-art", label: "Pop Art", description: "Bold colors and popular culture imagery" },
    ],
    mood: [
      { id: "serene", label: "Serene", description: "Peaceful and calm atmosphere" },
      { id: "dramatic", label: "Dramatic", description: "Intense and emotionally charged" },
      { id: "mysterious", label: "Mysterious", description: "Enigmatic and intriguing" },
      { id: "joyful", label: "Joyful", description: "Happy and uplifting" },
      { id: "melancholic", label: "Melancholic", description: "Thoughtful and slightly sad" },
      { id: "ethereal", label: "Ethereal", description: "Delicate and otherworldly" },
    ],
    elements: [
      { id: "water", label: "Water Elements", description: "Rivers, lakes, or ocean" },
      { id: "foliage", label: "Lush Foliage", description: "Plants, trees, and greenery" },
      { id: "sky", label: "Dramatic Sky", description: "Clouds, stars, or atmospheric effects" },
      { id: "people", label: "People", description: "Human figures or crowds" },
      { id: "animals", label: "Animals", description: "Wildlife or domestic creatures" },
      { id: "light-rays", label: "Light Rays", description: "Beams of light creating atmosphere" },
    ],
    composition: [
      { id: "symmetrical", label: "Symmetrical", description: "Balanced elements on both sides" },
      { id: "rule-of-thirds", label: "Rule of Thirds", description: "Key elements at intersection points" },
      { id: "diagonal", label: "Diagonal Lines", description: "Dynamic angles across the image" },
      { id: "framing", label: "Natural Framing", description: "Subject framed by surrounding elements" },
      { id: "leading-lines", label: "Leading Lines", description: "Lines that guide the eye to the subject" },
      { id: "minimalist", label: "Minimalist", description: "Simple composition with few elements" },
    ],
  }

  // Customize options based on previous selections
  let options = [...baseOptions[step]]

  // Apply some context-aware modifications based on previous selections
  if (selections.subject) {
    const subjectId = selections.subject.id

    if (step === "details") {
      // Customize details based on subject
      if (subjectId === "portrait") {
        options = [
          { id: "expressive", label: "Expressive Face", description: "Strong emotional expression" },
          { id: "profile", label: "Profile View", description: "Side view of the face" },
          { id: "close-up", label: "Close-up", description: "Detailed view of facial features" },
          ...options.slice(0, 3),
        ]
      } else if (subjectId === "landscape") {
        options = [
          { id: "mountains", label: "Mountains", description: "Towering peaks and valleys" },
          { id: "coastline", label: "Coastline", description: "Where land meets sea" },
          { id: "rolling-hills", label: "Rolling Hills", description: "Gentle undulating terrain" },
          ...options.slice(0, 3),
        ]
      }
    } else if (step === "setting") {
      // Customize setting based on subject
      if (subjectId === "portrait") {
        options = [
          { id: "studio", label: "Studio Setting", description: "Professional photography backdrop" },
          { id: "street", label: "Street Scene", description: "Urban environment with character" },
          { id: "home", label: "Home Environment", description: "Comfortable domestic setting" },
          ...options.slice(0, 3),
        ]
      }
    } else if (step === "style") {
      // Customize style based on subject
      if (subjectId === "portrait") {
        options = [
          { id: "portrait-photography", label: "Portrait Photography", description: "Professional portrait style" },
          { id: "painterly", label: "Painterly Portrait", description: "Brushstroke-like texture" },
          { id: "fashion", label: "Fashion Photography", description: "Stylish and trendy aesthetic" },
          ...options.slice(0, 3),
        ]
      } else if (subjectId === "landscape") {
        options = [
          { id: "landscape-photography", label: "Landscape Photography", description: "Professional landscape style" },
          { id: "plein-air", label: "Plein Air Painting", description: "Outdoor painting style" },
          { id: "panoramic", label: "Panoramic", description: "Wide, sweeping view" },
          ...options.slice(0, 3),
        ]
      }
    }
  }

  // Shuffle options if rerolling
  if (reroll) {
    options = options.sort(() => seed - 0.5)
  }

  return options.slice(0, 6)
}

