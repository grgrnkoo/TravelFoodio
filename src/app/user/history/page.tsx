import { redirect } from "next/navigation"

export default async function HistoryMain() {
    const date = new Date;
    const today = date.toISOString().split('T')[0];

    redirect(`/user/history/${today}`);

    return (
        <>
            <p>Redirecting to current date...</p>
        </>
    )
}