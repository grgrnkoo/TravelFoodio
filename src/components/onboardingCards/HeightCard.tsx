'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";

// Height options
const heightOptionsCm = Array.from({ length: 71 }, (_, i) => i + 140) // 140cm to 210cm
const heightOptionsFt = [
    { value: "4'7\"", label: "4'7\"" },
    { value: "4'8\"", label: "4'8\"" },
    { value: "4'9\"", label: "4'9\"" },
    { value: "4'10\"", label: "4'10\"" },
    { value: "4'11\"", label: "4'11\"" },
    { value: "5'0\"", label: "5'0\"" },
    { value: "5'1\"", label: "5'1\"" },
    { value: "5'2\"", label: "5'2\"" },
    { value: "5'3\"", label: "5'3\"" },
    { value: "5'4\"", label: "5'4\"" },
    { value: "5'5\"", label: "5'5\"" },
    { value: "5'6\"", label: "5'6\"" },
    { value: "5'7\"", label: "5'7\"" },
    { value: "5'8\"", label: "5'8\"" },
    { value: "5'9\"", label: "5'9\"" },
    { value: "5'10\"", label: "5'10\"" },
    { value: "5'11\"", label: "5'11\"" },
    { value: "6'0\"", label: "6'0\"" },
    { value: "6'1\"", label: "6'1\"" },
    { value: "6'2\"", label: "6'2\"" },
    { value: "6'3\"", label: "6'3\"" },
    { value: "6'4\"", label: "6'4\"" },
    { value: "6'5\"", label: "6'5\"" },
    { value: "6'6\"", label: "6'6\"" },
    { value: "6'7\"", label: "6'7\"" },
    { value: "6'8\"", label: "6'8\"" },
    { value: "6'9\"", label: "6'9\"" },
    { value: "6'10\"", label: "6'10\"" },
    { value: "6'11\"", label: "6'11\"" },
]

interface HeightCardProps {
    heightUnit: string;
    setHeightUnit: (unit: string) => void;
    height: string;
    setHeight: (height: string) => void;
    heightError: string;
    setHeightError: (heightError: string) => void;
}

export default function HeightCard({ heightUnit, setHeightUnit, height, setHeight, heightError, setHeightError }: HeightCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>What's your height?</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="flex flex-row-reverse justify-between items-center">
                    <div className="flex space-x-2 items-center">
                        <Button
                            variant={heightUnit === "cm" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setHeightUnit("cm")}
                            className="w-12 cursor-pointer"
                        >
                            cm
                        </Button>
                        <Button
                            variant={heightUnit === "ft" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setHeightUnit("ft")}
                            className="w-12 cursor-pointer"
                        >
                            ft
                        </Button>
                    </div>
                    <div className="space-y-2 flex-grow w-full pr-4">
                        <Select
                            value={height}
                            onValueChange={(value) => {
                                setHeight(value)
                                setHeightError("")
                            }}
                        >
                            <SelectTrigger
                                id="height"
                                className={`w-full cursor-pointer ${heightError ? "border-destructive" : ""}`}
                            >
                                <SelectValue placeholder={`Select height in ${heightUnit}`} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {(heightUnit === "cm" ? heightOptionsCm : heightOptionsFt).map((h) => (
                                    <SelectItem
                                        key={typeof h === "object" ? h.value : h}
                                        value={typeof h === "object" ? h.value : h.toString()}
                                        className="cursor-pointer"
                                    >
                                        {typeof h === "object" ? h.label : `${h} ${heightUnit}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <span className="text-xs font-medium text-destructive flex items-center w-full mt-4">
                    {heightError ? (
                        <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {heightError}
                        </>
                    ) : (
                        <div className="h-2">
                        </div>
                    )}
                </span>
            </CardContent>
        </div>
    )
}