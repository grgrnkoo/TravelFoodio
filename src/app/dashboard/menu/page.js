'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";

export default function MenuGenerator() {
    const {session, userProfile} = useContext(UserContext);
    
    const handleGenerateMenu = async () => {

    }

    return (
        <>
            <Menu />
            <Button onClick={handleGenerateMenu}>Generate Menu</Button>
        </>
    )
}