import UserProfile from "@/components/UserProfile";

export default async function DashboardLayout({ children }) {

    // Dashboard page
    return (
        <div className="flex w-full mt-[55px]">
            <UserProfile />
            <div className="flex w-full mx-4">
                {children}
            </div>
        </div>
    );
}