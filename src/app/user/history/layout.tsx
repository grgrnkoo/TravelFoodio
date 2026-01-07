'use client'

import { ResponsiveTabBar } from "@/components/ResponsiveTabBar"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathnameParamsArray = pathname.split('/');
    const dateOnLoad = pathnameParamsArray[pathnameParamsArray.length - 1]
    const typeParam = searchParams.get('type') || 'menus';
    const [activeType, setActiveType] = useState<'menus' | 'single-meals' | 'photo-analysis'>(typeParam as 'menus' | 'single-meals' | 'photo-analysis' || 'menus');

    const today = new Date();

    const getLast7Days = () => {
        const days = []

        for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(today.getDate() - i)

            const day = String(d.getDate()).padStart(2, '0')
            const month = String(d.getMonth() + 1).padStart(2, '0') // months are 0-based


            const formattedDateLabel = `${day}.${month}`;
            const formattedDateId = d.toISOString().split('T')[0];

            days.push({ id: formattedDateId, label: formattedDateLabel });
        }

        return days
    }

    useEffect(() => {
        const type = searchParams.get('type') || 'menus';
        if (type === 'menus' || type === 'single-meals' || type === 'photo-analysis') {
            setActiveType(type);
        }
    }, [searchParams]);

    const handleTypeChange = (type: 'menus' | 'single-meals' | 'photo-analysis') => {
        setActiveType(type);
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', type);
        // Preserve the date in the path
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDateTabClick = (tab: { id: string; label: string }) => {
        const params = new URLSearchParams(searchParams.toString());
        // Preserve the type parameter when changing dates
        if (!params.get('type')) {
            params.set('type', 'menus');
        }
        router.push(`/user/history/${tab.id}?${params.toString()}`);
    };

    const tabs = getLast7Days()

    const typeTabs = [
        { id: 'menus', label: 'Menus' },
        { id: 'single-meals', label: 'Single Meals' },
        { id: 'photo-analysis', label: 'Photo Analysis' },
    ];

    return (
        <div className="flex flex-col w-full mt-4">
            <h2
                className="mx-4 my-2 text-2xl font-bold md:hidden"
            >
                History
            </h2>
            {/* Type Tabs */}
            <div className="w-full flex justify-center items-center px-4 mb-2">
                <div className="flex space-x-1 w-full max-w-2xl bg-muted/30 rounded-lg p-1.5">
                    {typeTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTypeChange(tab.id as 'menus' | 'single-meals' | 'photo-analysis')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all flex-1",
                                activeType === tab.id 
                                    ? "bg-primary text-background shadow-sm" 
                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Date Tabs */}
            <ResponsiveTabBar
                tabs={tabs}
                defaultTab={dateOnLoad}
                usedIn='history'
                onTabClick={handleDateTabClick}
            />
            <div>
                {children}
            </div>
        </div>
    )
}