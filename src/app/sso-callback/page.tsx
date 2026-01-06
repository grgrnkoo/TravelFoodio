'use client'

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const router = useRouter();

  return (
    <AuthenticateWithRedirectCallback
      fallbackRedirectUrl="/user"
      forceRedirectUrl="/user"
      continueSignUpUrl="/user/onboarding"
    />
  );
}

