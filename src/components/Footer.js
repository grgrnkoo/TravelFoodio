import Link from "next/link";

const Footer = () => {
    return (
        <footer className="w-full text-gray-500 py-6 text-center">
            <div className="container mx-auto px-4">
                <p className="text-sm mb-2">&copy; {new Date().getFullYear()} FoodSm.art. All rights reserved.</p>
                <div className="mt-2 flex flex-col sm:flex-row justify-center items-center space-x-4">
                    <div className="flex justify-center items-center space-x-4">
                        <span className="text-gray-500 text-sm">Author</span>
                        <span className="text-gray-500">:</span>
                        <span className="text-gray-500 text-sm">Oleg Grigorenko</span>
                        <span className="text-gray-500 hidden sm:flex">:</span>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <Link href="https://x.com/grgrnkoo" className="text-gray-400 hover:text-gray-500 text-sm">Twitter</Link>
                        <span className="text-gray-500">:</span>
                        <Link href="https://linkedin.com/in/oleg-grigorenko-991664117" className="text-gray-400 hover:text-gray-500 text-sm">LinkedIn</Link>
                        <span className="text-gray-500">:</span>
                        <Link href="https://t.me/grgrnkoo" className="text-gray-400 hover:text-gray-500 text-sm">Telegram</Link>
                    </div>
                </div>
                <div className="w-[300px] h-[1px] bg-slate-200 mx-auto my-2" />
                <div className="mt-2 flex justify-center items-center space-x-4">
                    <Link href="/privacy" className="text-gray-400 hover:text-gray-500 text-sm">Privacy Policy</Link>
                    <span className="text-gray-500">|</span>
                    <Link href="/terms" className="text-gray-400 hover:text-gray-500 text-sm">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
