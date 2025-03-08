import UserProfile from "@/components/UserProfile";

export default async function DashboardLayout({ children }) {

    // Dashboard page
    return (
        <div className="flex">
            <UserProfile />
            <div>
                {children}
            </div>
        </div>
    );
}