import UserProfile from "@/components/UserProfile";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

    // Dashboard page
    return (
        <div className="flex w-full max-w-[1280px] min-h-full mt-[65px]">
            <UserProfile
                className='hidden w-[450px] md:block'
                editable={true}
            />
            <div className="flex w-full mx-4">
                {children}
            </div>
        </div>
    );
}