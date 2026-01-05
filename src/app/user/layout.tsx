import UserProvider from "@/components/UserProvider";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../_lib/supabase/queries/users";

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
            <div className="flex w-full min-h-full mt-[65px]">
                <div className="flex w-full mx-4">
                    {children}
                </div>
            </div>
        </UserProvider>
    );
}