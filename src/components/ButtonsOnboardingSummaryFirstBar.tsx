'use client'

import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { JSX } from "react";

interface ButtonsBarProps {
    handleChangeInfo: () => void;
    handleResetInfo: () => void;
    handleComplete: () => void;
    loading: boolean
    buttonLoading: boolean
}

export default function ButtonsOnboardingSummaryFirstBar({ handleChangeInfo, handleResetInfo, handleComplete, loading, buttonLoading }: ButtonsBarProps): JSX.Element {
    return (
        <div className="flex w-full gap-4 justify-center mt-8">
            <Button
                variant="outline"
                onClick={handleChangeInfo}
                className="cursor-pointer"
                disabled={loading}
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Change Info
            </Button>
            <Button
                variant="outline"
                onClick={handleResetInfo}
                className="cursor-pointer"
                disabled={loading}
            >
                Reset Info
            </Button>
            <Button
                variant="default"
                onClick={handleComplete}
                className="cursor-pointer"
                disabled={loading || buttonLoading}
            >
                {
                    buttonLoading ?
                        'Loading..' :
                        'Accept and Continue'
                }
            </Button>
        </div>
    )
} 