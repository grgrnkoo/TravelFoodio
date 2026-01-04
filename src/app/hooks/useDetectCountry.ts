import { useEffect, useState } from "react"
import { fetchCountry } from "../../../_lib/fetchCountry"
import countries from "../../../public/countries.json"
import { getFlagEmoji } from "../../../_lib/getFlagEmoji"

export function useDetectCountry(onCountryChange?: (countryCode: string) => void) {
    const [userCountry, setUserCountry] = useState<string | null>(null)
    const [displayCountry, setDisplayCountry] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    function getCountryName(code: string): string {
        const country = countries.find((country) => country.iso_code === code)
        return country?.name || "Unknown"
    }

    useEffect(() => {
        const stored = localStorage.getItem("userCountry")

        fetchCountry().then((data) => {
            const newCountry = data?.code

            if (stored !== newCountry) {
                const shouldUpdate = confirm("Do you want to update your country?")
                if (shouldUpdate) {
                    localStorage.setItem("userCountry", newCountry)
                    setUserCountry(newCountry)
                    setDisplayCountry(getFlagEmoji(newCountry))
                    onCountryChange?.(newCountry)
                } else if (stored) {
                    setUserCountry(stored)
                    setDisplayCountry(getFlagEmoji(stored))
                }
            } else if (stored) {
                setUserCountry(stored)
                setDisplayCountry(getFlagEmoji(stored))
            }

            setLoading(false)
        })
    }, [onCountryChange])

    return { userCountry, displayCountry, loading, getCountryName }
}
