import { redirect } from "next/navigation"

export default async function PreferencesMain({ params }) {
    const awaitedParams = await params;
    const username = awaitedParams.username;

    redirect(`/${username}/preferences/favoriteMeals`);
    
    return (
        <>
            <p>Redirecting...</p>
        </>
    )
}