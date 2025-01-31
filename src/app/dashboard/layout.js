import React from "react";
import UserProfile from "@/components/UserProfile";


export default async function DashboardLayout({ children }) {
    // Dashboard page

    return (
        <>
            <UserProfile />
            {children}
        </>
    );
}