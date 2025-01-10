import Link from "next/link";

export default function Header() {
    return (
        // flex w-full p-8 justify-evenly items-center
        <div className={`header`}>
            <div>
                <Link href="/" className="w-fit">FoodSm.art</Link>
            </div>
            <div className={`loginfield`}>
                <button><Link href=''>Sign Up</Link></button>
                <button><Link href='/login'>Login</Link></button>
            </div>
        </div>
    )
}