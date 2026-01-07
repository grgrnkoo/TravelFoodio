import MenuDishSkeleton from "./MenuDishLoading";

export default function FavoriteMealsSkeleton() {
    return (
        <div className="w-full px-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <MenuDishSkeleton key={i} showLike={true} />
            ))}
        </div>
    );
}

