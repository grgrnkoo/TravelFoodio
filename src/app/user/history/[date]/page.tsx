import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../../_lib/supabase/queries/users";
import { fetchMenuByDate } from "../../../../../_lib/menuActions";
import Menu from "@/components/Menu";
import MenuClass from "@/classes/MenuClass";
import RandomThinkingSvg from "@/components/RandomThinkingSvg";

export default async function HistoryByDate({ params }: { params: Promise<{ date: string }> }) {
    const awaitedParams = await params;
    const date = awaitedParams.date;

    const { userId } = await auth();
    if (!userId) return <div>Not authenticated</div>
    
    const user = await ensureUserExists(userId);
    if (!user) return <div>User not found</div>

    const { menu, status } = await fetchMenuByDate(user.id, date)
    const parsedMenu = typeof menu === 'string' ? JSON.parse(menu) : menu
    if (status !== 200 || !parsedMenu?.length) {
        return (
            <>
                <div className="w-full flex justify-center items-center my-12">
                    <RandomThinkingSvg />
                </div>
                <p className="w-full text-center mt-4">No menu generated on that date</p>
            </>
        )
    }

    const menuInstance = new MenuClass(parsedMenu)

    const totalNutrition = menuInstance.calculateTotalNutrition()

    return (
        <div>
            <Menu
                content={parsedMenu}
                totalNutrition={totalNutrition}
                showTotal={true}
            />
        </div>
    )
}