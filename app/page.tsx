import PromptBuilder from "@/components/prompt-builder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "LLM Image Prompt Refiner | Build AI Image Prompts",
  description: "Build prompts for text-to-image generation with a Easy to use interface",
  openGraph: {
    title: "LLM Image Prompt Refiner",
    description: "Build prompts for text-to-image generation with a Easy to use interface",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gemini Image Creator",
      },
    ],
  },
}

export default function Home() {
  return <PromptBuilder />
}

