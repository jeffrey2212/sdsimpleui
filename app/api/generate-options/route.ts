import { type NextRequest, NextResponse } from "next/server"
import { OLLAMA_PROMPTS } from "@/lib/prompts"

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
  model?: string
}

interface StepOption {
  id: string
  label: string
  description: string
}

interface GeneratedOption {
  id: string
  label: string
  description: string
}

async function generateOptionsWithOllama(
  step: string,
  selections: Record<string, StepOption>,
  model: string,
  reroll = false
): Promise<StepOption[]> {
  try {
    const context = Object.entries(selections)
      .map(([step, selection]) => `${step}: ${selection.label}`)
      .join(", ");

    const prompt = OLLAMA_PROMPTS.generateOptionsPrompt(step, context);

    console.log("=== Generating options with Ollama ===");
    console.log("Step:", step);
    console.log("Context:", context);
    console.log("Model:", model);
    console.log("Reroll:", reroll);
    console.log("Prompt:", prompt);

    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        system: OLLAMA_PROMPTS.SYSTEM_PROMPT,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate options with Ollama");
    }

    const data = await response.json();
    console.log("Raw Ollama response:", JSON.stringify(data, null, 2));
    console.log("Response text:", data.response);
    
    try {
      // More aggressive cleanup of the response
      let cleanResponse = data.response
        .replace(/```json\n?/g, "") // Remove ```json with or without newline
        .replace(/```\n?/g, "")     // Remove ``` with or without newline
        .replace(/\n/g, "")         // Remove all newlines
        .trim();
      
      // If the response starts with a single quote or backtick, try to find matching end and extract content
      if (cleanResponse.startsWith("'") || cleanResponse.startsWith("`")) {
        const match = cleanResponse.match(/^['`](.*?)['`]$/);
        if (match) {
          cleanResponse = match[1];
        }
      }

      console.log("Cleaned response:", cleanResponse);
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error("First parse attempt failed:", parseError);
        // Try wrapping in an options object if it's just an array
        if (cleanResponse.startsWith("[") && cleanResponse.endsWith("]")) {
          try {
            const parsedArray = JSON.parse(cleanResponse);
            parsedResponse = { options: parsedArray };
          } catch (arrayError) {
            console.error("Array parse attempt failed:", arrayError);
            throw parseError; // Throw the original error if both attempts fail
          }
        } else {
          throw parseError;
        }
      }

      if (!parsedResponse.options || !Array.isArray(parsedResponse.options)) {
        console.error("Invalid response structure:", parsedResponse);
        throw new Error("Response missing options array");
      }

      // Validate each option has the required fields
      const validOptions = parsedResponse.options.every((option: unknown) => 
        typeof option === 'object' &&
        option !== null &&
        typeof (option as StepOption).id === 'string' &&
        typeof (option as StepOption).label === 'string' &&
        typeof (option as StepOption).description === 'string'
      );

      if (!validOptions) {
        console.error("Invalid option structure in response:", parsedResponse.options);
        throw new Error("Invalid option structure in response");
      }

      console.log("Final parsed options:", parsedResponse.options);
      return parsedResponse.options;
    } catch (e) {
      console.error("Failed to parse Ollama response:", e);
      throw new Error("Invalid response format from Ollama");
    }
  } catch (error) {
    console.error("Error generating options with Ollama:", error);
    // Fallback to mock options if Ollama fails
    return generateMockOptions(step, selections, reroll);
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

export async function POST(request: NextRequest) {
  try {
    const { step, selections, reroll = false, model }: GenerateOptionsRequest & { model: string } = await request.json()

    if (!step) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 })
    }

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 })
    }

    // Generate options using Ollama with fallback to mock data
    const options = await generateOptionsWithOllama(step, selections, model, reroll)

    return NextResponse.json({ options })
  } catch (error) {
    console.error("Error generating options:", error)
    return NextResponse.json({ error: "Failed to generate options" }, { status: 500 })
  }
}
