import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gemini-bg text-gemini-text flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gemini-blue">404</h1>
        <h2 className="text-2xl font-medium">Page Not Found</h2>
        <p className="text-gemini-text-secondary">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button variant="gemini" className="rounded-xl">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

