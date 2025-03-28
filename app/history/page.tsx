import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Generation History | Gemini Image Creator",
  description: "View your previously generated images",
}

// In a real app, this would fetch from a database
// For demo purposes, we'll use static data
const generationHistory = [
  {
    id: "gen1",
    imageUrl: "/placeholder.svg?height=512&width=512&text=landscape",
    prompt:
      "Landscape in Nature with a peaceful atmosphere, with Golden Hour lighting, using Rule of Thirds composition, in vibrant colors, in the style of Digital Art, high quality, detailed, 8k resolution",
    timestamp: new Date("2023-06-15").getTime(),
  },
  {
    id: "gen2",
    imageUrl: "/placeholder.svg?height=512&width=512&text=portrait",
    prompt:
      "Portrait with dramatic lighting, using close-up composition, in dark colors, in the style of Oil Painting, high quality, detailed, 8k resolution",
    timestamp: new Date("2023-06-14").getTime(),
  },
  {
    id: "gen3",
    imageUrl: "/placeholder.svg?height=512&width=512&text=cityscape",
    prompt:
      "Cityscape in Urban from Modern era with a energetic atmosphere, with Neon lighting, using Wide Angle composition, in cool colors, in the style of 3D Render, high quality, detailed, 8k resolution",
    timestamp: new Date("2023-06-13").getTime(),
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="gemini-outline" size="sm" className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creator
            </Button>
          </Link>
          <h1 className="text-3xl font-medium">Generation History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generationHistory.map((item) => (
            <Card key={item.id} className="bg-gemini-card border-gemini-border shadow-gemini">
              <CardContent className="p-4">
                <div className="rounded-xl overflow-hidden border border-gemini-border">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={`Generated image: ${item.prompt.substring(0, 30)}...`}
                    width={512}
                    height={512}
                    className="w-full"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 p-4 pt-0">
                <p className="text-xs text-gemini-text-secondary">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-gemini-text-secondary line-clamp-3">
                  <span className="font-medium">Prompt:</span> {item.prompt}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="gemini-outline" size="sm" className="rounded-xl">
                    Regenerate
                  </Button>
                  <Button variant="gemini-outline" size="sm" className="rounded-xl">
                    Edit Prompt
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

