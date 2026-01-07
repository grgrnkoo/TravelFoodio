import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SideMenuSkeleton() {
    return (
        <Card className="mx-auto mb-8 shadow-lg max-w-[300px] border-0 overflow-hidden mt-4 ml-8 h-fit">
            <CardHeader className="relative pb-0 pt-6">
                <div className="absolute inset-0 h-24 bg-gradient-to-r from-primary/20 to-primary/40" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-2">
                        <div className="absolute inset-0 rounded-full bg-background/80 blur-sm -m-1" />
                        <div className="rounded-full bg-muted h-[100px] w-[100px] border-4 border-background relative z-10 animate-pulse" />
                    </div>
                    <div className="h-6 w-32 rounded-md bg-muted animate-pulse mb-2" />
                </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-2">
                {Array.from({ length: 11 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-10 w-full rounded-md bg-muted animate-pulse"
                    />
                ))}
            </CardContent>
        </Card>
    );
}

