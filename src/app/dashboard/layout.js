import React from "react";
import UserProfile from "@/components/UserProfile";
// import { getUserByEmail } from "../../../_lib/actions";

export default async function DashboardLayout({ children }) {
    // Dashboard page

    return (
        <>
            <UserProfile />
            {children}
        </>
    );
}