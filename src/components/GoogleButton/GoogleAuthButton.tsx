import React from 'react'
import { Button } from "@/components/ui/button"
import { GoogleLogo } from "./GoogleLogo"

interface GoogleAuthButtonProps {
  onClick: () => void;
}

export function GoogleAuthButton(props: GoogleAuthButtonProps) {
  return (
    <Button variant="outline" className="w-full" onClick={props.onClick}>
      <GoogleLogo className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  )
}
