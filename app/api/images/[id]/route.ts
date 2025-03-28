import { type NextRequest, NextResponse } from "next/server"

// This route serves as a proxy for generated images
// In a real implementation, you would fetch the image from your storage
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // For demo purposes, we'll return a placeholder image
    // In a real implementation, you would fetch the actual generated image

    // Redirect to a placeholder image with the ID as a parameter
    // This simulates different images for different prompts
    return NextResponse.redirect(`https://v0.dev/placeholder.svg?height=512&width=512&text=${id}`)
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 })
  }
}

