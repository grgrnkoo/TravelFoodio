'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState } from "react";

export default function MenuGenerator({ userProfile }) {
    const [localUserProfile, setLocalUserProfile] = useState(userProfile);

    // Update the local state when the parent sends new userReplies
    useEffect(() => {
        if (userProfile) {
            setLocalUserProfile(userProfile);
        }
    }, [userProfile]);
    // const { age, goals, location, dietaryRestrictions } = user;
    if (!userProfile) console.log('loading');
    console.log(localUserProfile);
    const handleGenerateMenu = async () => {

    }

    return (
        <>
            <Menu />
            <Button onClick={handleGenerateMenu}>Generate Menu</Button>
        </>
    )
}