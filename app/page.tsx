import MultiStepPromptBuilder from "@/components/multi-step-prompt-builder"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Multi-Step Prompt Builder | Image Description Generator",
  description: "Build detailed image prompts through a guided step-by-step process",
  openGraph: {
    title: "Multi-Step Prompt Builder",
    description: "Build detailed image prompts through a guided step-by-step process",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Multi-Step Prompt Builder",
      },
    ],
  },
}

export default function Home() {
  return <MultiStepPromptBuilder />
}

