'use client'

import { useEffect, useState } from 'react'
import { fetchCountry } from '../../../_lib/fetchCountry'

export function useUserCountry() {
  const [country, setCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('userCountry')

    fetchCountry()
      .then((data) => {
        const detected = data?.code

        // First time or changed country
        if (detected && stored && stored !== detected) {
          const shouldUpdate = confirm(
            `We detected your country as ${detected}. Do you want to update it?`
          )

          if (shouldUpdate) {
            localStorage.setItem('userCountry', detected)
            setCountry(detected)
          } else {
            setCountry(stored)
          }
        } else {
          // First time, or stored matches
          const final = stored || detected || null
          if (final) {
            localStorage.setItem('userCountry', final)
          }
          setCountry(final)
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Location fetch failed', err)
        setError('Unable to detect location.')
        setCountry(stored || null)
        setLoading(false)
      })
  }, [])

  const changeCountry = (code: string) => {
    localStorage.setItem('userCountry', code)
    setCountry(code)
  }

  return {
    country,         // e.g. "ID"
    loading,         // true while fetching
    error,           // if any
    changeCountry,   // call this to override manually
  }
}
