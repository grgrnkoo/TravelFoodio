import UserProvider from "@/components/UserProvider";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../_lib/supabase/queries/users";
import SideMenu from "@/components/SideMenu";
import { MealPreferencesProvider } from "@/components/MealPreferencesProvider";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    let userId = null;
    let userProfile = null;

    try {
        const authData = await auth();
        userId = authData.userId;
        if (userId) {
            // Lazy sync: fetches from DB, creates from Clerk if missing
            userProfile = await ensureUserExists(userId);
        }
    } catch (error) {
        console.error("Error fetching auth or user:", error);
    }

    // Dashboard page
    return (
        <UserProvider value={{ userId, userProfile }}>
            <MealPreferencesProvider>
                <div className="flex w-full min-h-full mt-[65px] px-36">
                    <div className="flex w-full mx-4">
                        <SideMenu className="mr-8 min-w-[25%]" />
                        {children}
                    </div>
                </div>
            </MealPreferencesProvider>
        </UserProvider>
    );
}