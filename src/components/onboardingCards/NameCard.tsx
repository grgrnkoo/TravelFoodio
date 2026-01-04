'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";


interface NameCardProps {
    name: string;
    setName: (name: string) => void;
    nameError: string | null;
    setNameError: (nameError: string) => void;
}

export default function NameCard({ name, setName, nameError, setNameError }: NameCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>What's your name?</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="flex flex-col space-y-2 w-full">
                    <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            if (e.target.value.trim()) setNameError("")
                        }}
                        className={nameError ? "border-destructive" : ""}
                    />
                </div>
                <span className="text-xs font-medium text-destructive flex items-center mt-4">
                    {nameError ? (
                        <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {nameError}
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
