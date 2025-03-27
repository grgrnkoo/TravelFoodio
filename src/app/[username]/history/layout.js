'use client'

import { ResponsiveTabBar } from "@/components/ResponsiveTabBar"
import { UserContext } from "@/components/UserProvider";
import { useContext } from "react";
import { usePathname } from "next/navigation";

export default function HistoryLayout({ children }) {
    const { userProfile, userProfileDynamic } = useContext(UserContext);

    const pathname = usePathname();
    const pathnameParamsArray = pathname.split('/');
    const dateOnLoad = pathnameParamsArray[pathnameParamsArray.length - 1]

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

    const tabs = getLast7Days()

    return (
        <div className="flex flex-col w-full mt-4">
            <ResponsiveTabBar
                tabs={tabs}
                username={userProfileDynamic.username}
                defaultTab={dateOnLoad}
                usedIn='history'
            />
            <div>
                {children}
            </div>
        </div>
    )
}