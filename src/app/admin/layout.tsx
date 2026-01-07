import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@lib/adminAuth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const authData = await auth();
    
    if (!authData.userId) {
        redirect("/sign-in");
    }

    const admin = await isAdmin(authData.userId);
    
    if (!admin) {
        redirect("/user");
    }

    return (
        <div className="flex min-h-screen mt-16 w-full">
            <AdminNav />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}

