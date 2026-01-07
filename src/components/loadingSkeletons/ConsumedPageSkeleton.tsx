import MenuDishSkeleton from "./MenuDishLoading";

export default function ConsumedPageSkeleton() {
    return (
        <div className="flex flex-col items-center w-full">
            {/* Nutrition bar skeleton */}
            <div className="w-full flex justify-center my-6">
                <div className="w-full max-w-lg space-y-4">
                    <div className="h-64 bg-muted rounded-lg animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-48 bg-muted rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
            {/* Menu items skeleton */}
            <div className="w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                    <MenuDishSkeleton key={i} showLike={false} />
                ))}
            </div>
        </div>
    );
}

