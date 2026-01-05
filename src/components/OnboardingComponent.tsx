"use client"

import { JSX } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocation } from "@/components/providers/LocationProvider"
import NameCard from "./onboardingCards/NameCard"
import DateOfBirthCard from "./onboardingCards/DateOfBirthCard"
import GoalsCard from "./onboardingCards/GoalsCard"
import LocationCard from "./onboardingCards/LocationCard"
import RestrictionsCard from "./onboardingCards/RestrictionsCard"
import OthersCard from "./onboardingCards/OthersCard"
import WeightCard from "./onboardingCards/WeightCard"
import HeightCard from "./onboardingCards/HeightCard"

export default function OnboardingComponent({ firstStep, nameFromSession }: { firstStep: 1 | 0, nameFromSession?: string }): JSX.Element {
    const locationFromIp = useLocation();

    const searchParams = useSearchParams()
    const router = useRouter()
    const totalSteps = 7;
    const [step, setStep] = useState(firstStep || Number(searchParams.get("step")) || 0)
    const [disabled, setDisabled] = useState(false)

    // Form state
    const [name, setName] = useState(searchParams.get("name") || "")
    const [day, setDay] = useState(searchParams.get("day") || "")
    const [month, setMonth] = useState(searchParams.get("month") || "")
    const [year, setYear] = useState(searchParams.get("year") || "")
    const [location, setLocation] = useState(searchParams.get("location") || locationFromIp || "")
    const [goal, setGoal] = useState(searchParams.get("goal") || "")
    const [customGoal, setCustomGoal] = useState("")
    const [dietaryRestrictions, setDietaryRestrictions] = useState(searchParams.get("dietaryRestrictions") || "")
    const [otherInfo, setOtherInfo] = useState(searchParams.get("otherInfo") || "")
    const [weight, setWeight] = useState(searchParams.get("weight") || "")
    const [weightUnit, setWeightUnit] = useState(searchParams.get("weightUnit") || "kg")
    const [height, setHeight] = useState(searchParams.get("height") || "")
    const [heightUnit, setHeightUnit] = useState(searchParams.get("heightUnit") || "cm")

    // Error states
    const [nameError, setNameError] = useState("")
    const [dobError, setDobError] = useState("")
    const [locationError, setLocationError] = useState("")
    const [goalError, setGoalError] = useState("")
    const [weightError, setWeightError] = useState("")
    const [heightError, setHeightError] = useState("")

    // Load customGoal from localStorage on mount (client-side only)
    useEffect(() => {
        const stored = localStorage.getItem("customGoal");
        if (stored && stored !== "undefined" && goal === "custom") {
            setCustomGoal(stored);
        }
        if (goal !== "custom") {
            localStorage.removeItem("customGoal");
        }
    }, []);

    // Update URL with search params
    useEffect(() => {
        const params = new URLSearchParams()
        params.set("step", step.toString())
        if (!nameFromSession && name) params.set("name", name)
        if (day) params.set("day", day)
        if (month) params.set("month", month)
        if (year) params.set("year", year)
        if (location) params.set("location", location)
        if (goal) params.set("goal", goal)
        if (dietaryRestrictions) params.set("dietaryRestrictions", dietaryRestrictions)
        if (otherInfo) params.set("otherInfo", otherInfo)
        if (weight) params.set("weight", weight)
        if (weightUnit) params.set("weightUnit", weightUnit)
        if (height) params.set("height", height)
        if (heightUnit) params.set("heightUnit", heightUnit)

        const url = `/user/onboarding?${params.toString()}`
        router.replace(url)
    }, [step, otherInfo])

    // Validation functions
    const validateCurrentStep = () => {
        switch (step) {
            case 0:
                if (!name.trim()) {
                    setNameError("Please enter your name")
                    return false
                }
                setNameError("")
                return true
            case 1:
                if (!day || !month || !year) {
                    setDobError("Please select your complete date of birth")
                    return false
                }
                setDobError("")
                return true
            case 2:
                if (!location.trim()) {
                    setLocationError("Please enter your location")
                    return false
                }
                setLocationError("")
                return true
            case 3:
                if (!goal) {
                    setGoalError("Please select a goal")
                    return false
                }
                if (goal === "custom" && !customGoal.trim()) {
                    setGoalError("Please enter your custom goal")
                    return false
                }
                setGoalError("")
                return true
            case 4:
                // Dietary restrictions are optional
                return true
            case 5:
                if (!weight) {
                    setWeightError("Please select your weight")
                    return false
                }
                setWeightError("")
                return true
            case 6:
                if (!height) {
                    setHeightError("Please select your height")
                    return false
                }
                setHeightError("")
                return true
            case 7:
                // Other info is optional
                return true
            default:
                return true
        }
    }

    const handleNext = () => {
        if (validateCurrentStep()) {
            if(goal === "custom" && customGoal.trim()) {
                localStorage.setItem('customGoal', customGoal);
            }
            if (step < totalSteps) {
                setStep(step + 1)
            } else {
                // Onboarding complete - redirect to dashboard or home
                router.push(`/user/onboarding/completed?${new URLSearchParams(Object.fromEntries(searchParams)).toString()}`)
                setDisabled(true)
            }
        }
    }

    const handlePrevious = () => {
        if (step > firstStep) {
            setStep(step - 1)
        }
    }

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700"></span>
                    <span className="text-sm font-medium text-slate-700 select-none">{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>

            <Card className="border-slate-200 shadow-lg flex flex-col justify-between transition-all duration-300">
                {step === 0 && (
                    <NameCard
                        name={name}
                        setName={setName}
                        nameError={nameError}
                        setNameError={setNameError}
                    />
                )}

                {step === 1 && (
                    <DateOfBirthCard
                        day={day}
                        setDay={setDay}
                        month={month}
                        setMonth={setMonth}
                        year={year}
                        setYear={setYear}
                        dobError={dobError}
                        setDobError={setDobError}
                    />
                )}

                {step === 2 && (
                    <LocationCard
                        location={location}
                        setLocation={setLocation}
                        locationError={locationError}
                        setLocationError={setLocationError}
                    />
                )}

                {step === 3 && (
                    <GoalsCard
                        goal={goal}
                        setGoal={setGoal}
                        customGoal={customGoal}
                        setCustomGoal={setCustomGoal}
                        goalError={goalError}
                        setGoalError={setGoalError}
                    />
                )}

                {step === 4 && (
                    <RestrictionsCard
                        dietaryRestrictions={dietaryRestrictions}
                        setDietaryRestrictions={setDietaryRestrictions}
                    />
                )}

                {step === 5 && (
                    <WeightCard
                        weight={weight}
                        setWeight={setWeight}
                        weightUnit={weightUnit}
                        setWeightUnit={setWeightUnit}
                        weightError={weightError}
                        setWeightError={setWeightError}
                    />
                )}

                {step === 6 && (
                    <HeightCard
                        height={height}
                        setHeight={setHeight}
                        heightUnit={heightUnit}
                        setHeightUnit={setHeightUnit}
                        heightError={heightError}
                        setHeightError={setHeightError}
                    />
                )}

                {step === 7 && (
                    <OthersCard
                        otherInfo={otherInfo}
                        setOtherInfo={setOtherInfo}
                    />
                )}

                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={step === firstStep}
                        className="cursor-pointer"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="cursor-pointer"
                        disabled={disabled}
                    >
                        {step === totalSteps ? "Complete" : "Next"}
                        {step !== totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
