import { useEffect } from "react"

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
    const body = document.body
    const html = document.documentElement

    if (locked) {
      body.style.overflow = "hidden"

      if (isMobile) {
        html.style.touchAction = "none"
      }
    } else {
      body.style.overflow = ""
      html.style.touchAction = ""
    }

    return () => {
      body.style.overflow = ""
      html.style.touchAction = ""
    }
  }, [locked])
}
