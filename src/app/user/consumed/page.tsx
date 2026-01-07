import { redirect } from "next/navigation"

export default async function ConsumedMain() {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    redirect(`/user/consumed/${today}`);

    return (
        <>
            <p>Redirecting to current date...</p>
        </>
    )
}
