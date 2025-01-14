import { Mail } from "lucide-react"
import { MailOpen } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export default function LoginWithEmail() {
  const [hover, setHover] = useState(false);

  return (
    <Button
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? <MailOpen  className="pb-px"/> : <Mail />} Login with Email
    </Button>
  )
}