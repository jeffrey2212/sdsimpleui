import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gemini-blue/20 blur-xl animate-pulse"></div>
        <Loader2 className="h-12 w-12 animate-spin text-gemini-blue relative z-10" />
      </div>
      <p className="mt-4 text-gemini-text-secondary">Loading...</p>
    </div>
  )
}

