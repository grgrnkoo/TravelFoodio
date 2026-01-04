import { redirect } from "next/navigation"

export default async function PreferencesMain() {
    redirect(`/user/preferences/favoriteMeals`);

    return (
        <>
            <p>Redirecting...</p>
        </>
    )
}