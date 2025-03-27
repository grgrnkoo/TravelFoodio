'use client'

import { ResponsiveTabBar } from "@/components/ResponsiveTabBar"
import { usePathname } from "next/navigation"

export default function PreferencesLayout({ children }) {
    const pathname = usePathname();
    const tabFromPath = pathname.split('/').pop();

    const defaultTab = tabFromPath === 'preferences' ? 'favoriteMeals' : tabFromPath;

    console.log(defaultTab);

    const tabs = [
        {id:'favoriteMeals', label:'Liked Meals'},
        {id:'dislikedMeals', label:'Disliked Meals'},
        {id:'ingredients', label:'Ingredients'},
        {id:'cuisines', label:'Cuisines'},
        {id:'generateCustom', label:'Make a Meal'}
    ]
    return (
        <div className="flex flex-col w-full mt-4">
            <ResponsiveTabBar 
                tabs={tabs}
                defaultTab={defaultTab}
                usedIn='preferences'
            />
            <div>
                {children}
            </div>
        </div>
    )
}