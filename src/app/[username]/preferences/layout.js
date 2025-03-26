import { ResponsiveTabBar } from "@/components/ResponsiveTabBar"

export default function PreferencesLayout({ children }) {
    return (
        <div className="flex flex-col w-full">
            <ResponsiveTabBar />
            <div>
                {children}
            </div>
        </div>
    )
}