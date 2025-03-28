import PromptBuilder from "@/components/prompt-builder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gemini Image Creator | Build AI Image Prompts",
  description: "Build prompts for text-to-image generation with a Gemini-inspired interface",
  openGraph: {
    title: "Gemini Image Creator",
    description: "Build prompts for text-to-image generation with a Gemini-inspired interface",
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

