import Link from "next/link";

export default function Header() {
    return (
        // flex w-full p-8 justify-evenly items-center
        <div className={`header`}>
            <div>
                <Link href="/" className="w-fit">Menu-App</Link>
            </div>
            <div className={`loginfield`}>
                <button>Sign Up</button>
                <button>Login</button>
            </div>
        </div>
    )
}