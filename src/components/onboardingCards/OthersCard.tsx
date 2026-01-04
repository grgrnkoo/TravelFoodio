'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { JSX } from "react";


interface OthersCardProps {
    otherInfo: string;
    setOtherInfo: (name: string) => void;
}

export default function OthersCard({ otherInfo, setOtherInfo }: OthersCardProps): JSX.Element {
    return (
        <div className="flex flex-col w-full justify-between">
            <CardHeader>
                <CardTitle>Any extra details? We are all ears!<span className="text-xs text-muted-foreground"> (optional)</span></CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="space-y-2">
                    <Textarea
                        id="otherInfo"
                        placeholder="It's not necessary, but it helps us understand you better."
                        value={otherInfo}
                        onChange={(e) => setOtherInfo(e.target.value)}
                        className="resize-none"
                    />
                </div>
            </CardContent>
        </div>
    )
}