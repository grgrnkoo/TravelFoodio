'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AuthErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred')

  useEffect(() => {
    const errorMessages = {
      Configuration: 'There is a problem with the server configuration.',
      AccessDenied: 'You do not have permission to sign in.',
      Verification: 'The verification link may have been used or has expired.',
      OAuthSignin: 'Error in the OAuth sign-in process.',
      OAuthCallback: 'Error in the OAuth callback process.',
      OAuthCreateAccount: 'Could not create OAuth provider account.',
      EmailCreateAccount: 'Could not create email provider account.',
      Callback: 'Error in the OAuth callback.',
      OAuthAccountNotLinked: 'This email is already associated with another account.',
      EmailSignin: 'Error sending the email verification link.',
      CredentialsSignin: 'The credentials you provided were invalid.',
      SessionRequired: 'You must be signed in to access this page.',
      Default: 'An authentication error occurred.',
    }

    setErrorMessage(errorMessages[error] || errorMessages['Default'])
  }, [error])

  return <p className="text-muted-foreground">{errorMessage}</p>
}
