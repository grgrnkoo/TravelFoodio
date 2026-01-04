'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";


interface LocationCardProps {
    location: string;
    setLocation: (location: string) => void;
    locationError: string;
    setLocationError: (locationError: string) => void;
}

export default function LocationCard({ location, setLocation, locationError, setLocationError }: LocationCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>Where are you located?</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="space-y-2">
                    <Input
                        id="location"
                        placeholder="Enter your city or region"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value)
                            if (e.target.value.trim()) setLocationError("")
                        }}
                        className={locationError ? "border-destructive" : ""}
                    />
                </div>
                <span className="text-xs font-medium text-destructive flex items-center w-full mt-4">
                    {locationError ? (
                        <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {locationError}
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