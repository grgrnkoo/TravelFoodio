import { redirect } from "next/navigation"

export default async function HistoryMain({ params }) {
    const awaitedParams = await params;
    const username = awaitedParams.username;

    const date = new Date;
    const today = date.toISOString().split('T')[0];

    redirect(`/${username}/history/${today}`);
    
    return (
        <>
            <p>Redirecting to current date...</p>
        </>
    )
}