'use client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full min-h-full">
            {children}
        </div>
    )
}