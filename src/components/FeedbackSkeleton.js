import { Card } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export default function FeedbackSkeleton({ cards }) {
    let n = 3;

    if (cards < 3) {
        n = cards;
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: n }, (_, i) => (
                <Card key={i} className="overflow-hidden">
                    <div className="p-4 pb-2 flex flex-row items-center gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <div className="p-4 pt-2">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </Card>
            ))}
        </div>
    )
}