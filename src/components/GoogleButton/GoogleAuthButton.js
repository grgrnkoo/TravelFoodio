import React from 'react'
import { Button } from "@/components/ui/button"
import { GoogleLogo } from "./GoogleLogo"

export function GoogleAuthButton(props) {
  return (
    <Button variant="outline" className="w-full" onClick={props.onClick}>
      <GoogleLogo className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  )
}
