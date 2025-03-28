"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface DebugDialogProps {
  children: React.ReactNode
}

export function DebugDialog({ children }: DebugDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    console.log("Opening dialog")
    setIsOpen(true)
  }

  const handleClose = () => {
    console.log("Closing dialog")
    setIsOpen(false)
  }

  return (
    <div>
      <Button
        variant="gemini-outline"
        size="sm"
        className="rounded-xl h-8 text-xs flex items-center gap-1.5"
        onClick={handleOpen}
      >
        <span className="hidden sm:inline">Configure</span>
        <Settings className="h-3.5 w-3.5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative z-50 bg-gemini-card border border-gemini-border rounded-lg p-4 w-[90%] max-w-md max-h-[85vh] overflow-auto">
            <button
              className="absolute top-2 right-2 text-gemini-text-secondary hover:text-gemini-text"
              onClick={handleClose}
            >
              ✕
            </button>
            <div className="pt-5">{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}

