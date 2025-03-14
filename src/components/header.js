'use client'

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useContext, useState } from "react";
import { UserContext } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useParams } from "next/navigation";

export default function Header() {
    const session = useSession();
    const props = useParams();
    const { userProfile = null } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false); // Controls menu state

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <header className="absolute flex items-center px-8 py-4 z-10 justify-between w-full bg-white">
            {/* Logo */}
            <div>
                <Link href={userProfile ? `/${userProfile.username}` : '/'} className="text-xl font-bold">FoodSm.art</Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex gap-6 items-center">
                <Button variant="outline">
                    <Link href={`/feedback${userProfile ? `?sender=${userProfile.username}` : ''}`}>
                        Send Feedback
                    </Link>
                </Button>
                {!session.data ? (
                    <Button><Link href='/login'>Sign In</Link></Button>
                ) : (
                    <>
                        {userProfile && !props.username && <Button variant="outline"><Link href="/dashboard">Dashboard</Link></Button>}
                        <Button onClick={handleSignOut}>Sign Out</Button>
                    </>
                )}
            </nav>

            {/* Mobile Menu Button */}
            <div
                className="sm:hidden flex cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </div>


            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-16 right-8 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-4 md:hidden">
                    <Link
                        href={`/feedback${userProfile ? `?sender=${userProfile.username}` : ''}`}
                        className="block"
                        onClick={() => setIsOpen(false)}
                    >
                        Send Feedback
                    </Link>
                    {!session.data ? (
                        <Link href="/login" className="block" onClick={() => setIsOpen(false)}>Sign In</Link>
                    ) : (
                        <>
                            {userProfile && <Link href="/dashboard" className="block" onClick={() => setIsOpen(false)}>Dashboard</Link>}
                            <button onClick={handleSignOut} className="text-red-600 text-left">Sign Out</button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
