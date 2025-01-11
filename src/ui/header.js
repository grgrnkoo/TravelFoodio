'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function Header() {
    const session = useSession();

    return (
        // flex w-full p-8 justify-evenly items-center
        <div className={`header`}>
            <div>
                <Link href="/" className="w-fit">FoodSm.art</Link>
            </div>
            <div className={`loginfield`}>
                {
                    !session.data ? (
                        <>
                            <button><Link href=''>Sign Up</Link></button>
                            <button><Link href='/login'>Login</Link></button>
                        </>
                    ) : (
                        <>
                            <button><Link href='/dashboard'>Dashboard</Link></button>
                            <button onClick={signOut}>Sign Out</button>
                        </>
                    )
                }
            </div>
        </div>
    )
}