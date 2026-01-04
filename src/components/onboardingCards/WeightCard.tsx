'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";


interface WeightCardProps {
    weightUnit: string;
    setWeightUnit: (unit: string) => void;
    weight: string;
    setWeight: (weight: string) => void;
    weightError: string;
    setWeightError: (weightError: string) => void;
}

// Weight options
const weightOptionsKg = Array.from({ length: 111 }, (_, i) => i + 40) // 40kg to 150kg
const weightOptionsLbs = Array.from({ length: 241 }, (_, i) => i + 90) // 90lbs to 330lbs

export default function WeightCard({ weightUnit, setWeightUnit, weight, setWeight, weightError, setWeightError }: WeightCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>What's your weight?</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="flex flex-row-reverse justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={weightUnit === "kg" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setWeightUnit("kg")}
                            className="w-12 cursor-pointer"
                        >
                            kg
                        </Button>
                        <Button
                            variant={weightUnit === "lbs" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setWeightUnit("lbs")}
                            className="w-12 cursor-pointer"
                        >
                            lbs
                        </Button>
                    </div>
                    <div className="space-y-2 flex-grow w-full pr-4">
                        <Select
                            value={weight}
                            onValueChange={(value) => {
                                setWeight(value)
                                setWeightError("")
                            }}
                        >
                            <SelectTrigger
                                id="weight"
                                className={`w-full cursor-pointer ${weightError ? "border-destructive" : ""}`}
                            >
                                <SelectValue placeholder={`Select weight in ${weightUnit}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {(weightUnit === "kg" ? weightOptionsKg : weightOptionsLbs).map((w) => (
                                    <SelectItem
                                        key={w}
                                        value={w.toString()}
                                        className="cursor-pointer"
                                    >
                                        {w} {weightUnit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <span className="text-xs font-medium text-destructive flex items-center w-full mt-4">
                    {weightError ? (
                        <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {weightError}
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