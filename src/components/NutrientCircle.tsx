'use client'

import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

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
    
    // Use motion values for smooth animations
    const motionPercentage = useMotionValue(isLoaded ? percentage : 0)
    const springPercentage = useSpring(motionPercentage, {
        stiffness: 50,
        damping: 20,
        mass: 1,
    })
    
    // Animate percentage when consumed value changes
    useEffect(() => {
        if (isLoaded) {
            motionPercentage.set(percentage)
        }
    }, [percentage, isLoaded, motionPercentage])
    
    const animatedPercentage = useTransform(springPercentage, (value) => Math.max(0, Math.min(100, value)))

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

    // Helper function to convert polar coordinates to cartesian
    function polarToCartesian(radius: number, angleInDegrees: number) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
        return {
            x: radius + radius * Math.cos(angleInRadians),
            y: radius + radius * Math.sin(angleInRadians),
        }
    }
    
    // Animated stroke dashoffset using motion
    // Use arcLength instead of full circumference since we're only drawing 280 degrees
    const strokeDashoffset = useTransform(
        animatedPercentage,
        (value) => arcLength * (1 - value / 100)
    )

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

                {/* Filled arc - animated with motion */}
                <motion.path
                    d={`M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={arcLength}
                    style={{
                        strokeDashoffset: strokeDashoffset,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 20,
                        mass: 1,
                    }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.p 
                    className={cn("font-bold", size === "large" ? "text-4xl" : "text-2xl")}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: isLoaded ? 1 : 0, 
                        scale: isLoaded ? 1 : 0.8 
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 15,
                        duration: 0.3
                    }}
                >
                    {isLoaded ? (
                        <motion.span
                            key={consumed}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 20,
                                duration: 0.2
                            }}
                        >
                            {consumed}
                        </motion.span>
                    ) : ''}
                </motion.p>
                {
                    !onboarding &&
                    <p className="text-gray-400 text-sm">
                        /{goal}
                    </p>
                }
                <motion.p 
                    className="text-gray-500 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    {isLoaded ? name : 'Loading...'}
                </motion.p>
            </div>
        </div>
    )
}
