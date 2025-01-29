'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";

export default function MenuGenerator() {
    const { session, userProfile } = useContext(UserContext);
    const { goals, location, age, dietaryRestrictions } = userProfile;
    const [menuContent, setMenuContent] = useState(null);

    console.log('User info for request: ', goals, location, age, dietaryRestrictions)
    const handleGenerateMenu = async () => {
        try {
            const res = await fetch('../api/generateMenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goals, location, age, dietaryRestrictions })
            })

            const data = await res.json();
            if (res.ok) {
                console.log(data.message);
                setMenuContent(data.message);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate menu');    
            }
        } catch (error) {
            console.error('Error sending OpenAI request: ', error);
        }
        return;
    }
    
    return (
        <>
            {menuContent && <Menu content={menuContent} />}
            <Button onClick={handleGenerateMenu}>Generate Menu</Button>
        </>
    )
}