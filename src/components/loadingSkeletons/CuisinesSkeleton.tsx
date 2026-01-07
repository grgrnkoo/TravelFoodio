import { Card, CardContent } from "@/components/ui/card";

export default function CuisinesSkeleton() {
    return (
        <div className="w-full px-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="h-6 w-32 rounded-md bg-muted animate-pulse" />
                            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

