'use client'

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const router = useRouter();

  return (
    <AuthenticateWithRedirectCallback
      afterSignInUrl="/user"
      afterSignUpUrl="/user/onboarding"
      redirectUrl="/user"
      continueSignUpUrl="/user/onboarding"
    />
  );
}

