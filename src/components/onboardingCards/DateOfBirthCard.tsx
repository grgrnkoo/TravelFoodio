
'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";


interface DateOfBirthCardProps {
    day: string;
    setDay: (day: string) => void;
    month: string;
    setMonth: (month: string) => void;
    year: string;
    setYear: (year: string) => void;
    dobError?: string;
    setDobError: (dobError: string) => void;
}

// Generate days for dropdown
const days = Array.from({ length: 31 }, (_, i) => i + 1)

// Generate months for dropdown
const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
]

// Generate years for dropdown (100 years back from current year)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

export default function DateOfBirthCard({ day, setDay, month, setMonth, year, setYear, dobError, setDobError }: DateOfBirthCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>When were you born?</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                        <Select
                            value={day}
                            onValueChange={(value) => {
                                setDay(value);
                                if (month && year) setDobError("")
                            }
                            }
                        >
                            <SelectTrigger
                                id="day"
                                className={!day && dobError ? "border-destructive w-full cursor-pointer" : "w-full cursor-pointer"}
                            >
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                                {days.map((d) => (
                                    <SelectItem
                                        key={d}
                                        value={d.toString()}
                                        className="cursor-pointer"
                                    >
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Select
                            value={month}
                            onValueChange={(value) => {
                                setMonth(value)
                                if (day && year) setDobError("")
                            }}
                        >
                            <SelectTrigger
                                id="month"
                                className={!month && dobError ? "border-destructive w-full cursor-pointer" : "w-full cursor-pointer"}
                            >
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem
                                        key={m.value}
                                        value={m.value}
                                        className="cursor-pointer"
                                    >
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Select
                            value={year}
                            onValueChange={(value) => {
                                setYear(value)
                                if (day && month) setDobError("")
                            }}
                        >
                            <SelectTrigger
                                id="year"
                                className={!year && dobError ? "border-destructive w-full cursor-pointer" : "w-full cursor-pointer"}
                            >
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem
                                        key={y}
                                        value={y.toString()}
                                        className="cursor-pointer"
                                    >
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <span className="text-xs font-medium text-destructive flex items-center w-full mt-4">
                    {dobError ? (
                        <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {dobError}
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