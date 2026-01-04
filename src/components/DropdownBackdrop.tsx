"use client"
import { cn } from "@/lib/utils"

export function DropdownBackdrop({ isVisible, className }: { isVisible: boolean, className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-black/5 backdrop-blur-md transition-opacity duration-200 pointer-events-none",
        className,
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    />
  )
}
