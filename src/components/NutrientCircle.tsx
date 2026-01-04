'use client'

import { cn } from "@/lib/utils"

interface NutrientCircleProps {
    name: string
    consumed: number
    goal: number
    color: string
    size?: "normal" | "large"
    isLoaded: boolean
    onboarding: boolean
}

export function NutrientCircle({ name, consumed, goal, color, size = "normal", isLoaded = true, onboarding = false }: NutrientCircleProps) {
    const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
    const animatedPercentage = isLoaded ? percentage : 5

    // SVG parameters
    const radius = size === "large" ? 80 : 60
    const strokeWidth = size === "large" ? 22 : 18
    const circumference = 2 * Math.PI * radius

    // We want the circle to be open at the bottom (280 degrees filled when complete)
    const maxAngle = 280
    const startAngle = (360 - maxAngle) / 2
    const endAngle = startAngle + maxAngle
    const arcLength = (circumference * maxAngle) / 360;

    // Calculate the arc path
    const startPoint = polarToCartesian(radius, startAngle)
    const endPoint = polarToCartesian(radius, endAngle)
    const largeArcFlag = maxAngle > 180 ? 1 : 0

    // Calculate the filled portion of the arc
    const fillAngle = (maxAngle * animatedPercentage) / 100
    const fillEndAngle = startAngle + fillAngle
    const fillEndPoint = polarToCartesian(radius, fillEndAngle)
    const fillLargeArcFlag = fillAngle > 180 ? 1 : 0

    // Helper function to convert polar coordinates to cartesian
    function polarToCartesian(radius: number, angleInDegrees: number) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
        return {
            x: radius + radius * Math.cos(angleInRadians),
            y: radius + radius * Math.sin(angleInRadians),
        }
    }

    const strokeDashoffset = circumference * (1 - animatedPercentage / 100);

    return (
        <div
            className={cn("relative flex flex-col items-center justify-center overflow-visible", size === "large" ? "w-64 h-64" : "w-48 h-48")}
        >
            <svg width={radius * 2} height={radius * 2} className="transform -rotate-180 overflow-visible">
                {/* Background arc */}
                <path
                    d={`M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`}
                    fill="none"
                    stroke={"#e5e7eb"}
                    strokeWidth={strokeWidth}
                // strokeLinecap="round"
                />

                {/* Filled arc */}
                <path
                    d={`M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${fillLargeArcFlag} 1 ${fillEndPoint.x} ${fillEndPoint.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    // strokeLinecap="round"
                    style={{
                        transition: `${'stroke-dashoffset 1.5s ease-out'}`,
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset
                    }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className={cn("font-bold transition-all duration-1000", size === "large" ? "text-4xl" : "text-2xl")}>
                    {isLoaded ? consumed : ''}
                </p>
                {
                    !onboarding &&
                    <p className="text-gray-400 text-sm">
                        /{goal}
                    </p>
                }
                <p className="text-gray-500 font-medium">{isLoaded ? name : 'Loading...'}</p>
            </div>
        </div>
    )
}
