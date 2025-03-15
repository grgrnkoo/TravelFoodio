import UserProfile from "@/components/UserProfile";

export default async function DashboardLayout({ children }) {

    // Dashboard page
    return (
        <div className="flex w-full mt-[65px]">
            <UserProfile
                className='hidden w-[450px] md:block'
                editable={false}
            />
            <div className="flex w-full mx-4">
                {children}
            </div>
        </div>
    );
}