'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";

export default function MenuGenerator() {
    const { session, userProfile } = useContext(UserContext);
    const { goals, location, age, dietaryRestrictions } = userProfile;
    const [menuContent, setMenuContent] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state for better UX

    const checkDbForMenu = async (userId) => {
        try {
            setLoading(true); // Set loading to true when the request is made
            const res = await fetch(`../api/menu?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (res.status === 404) {
                setMenuContent(null); // Menu not found
                console.log('Menu does not exist');
            } else {
                const data = await res.json();
                console.log('Fetched menu: ', data);
                setMenuContent(data);
            }
        } catch (error) {
            console.error('Error fetching menu by UserID: ', error);
            setMenuContent(null);
        } finally {
            setLoading(false); // Set loading to false when request is completed
        }
    };

    const handleGenerateMenu = async () => {
        try {
            setLoading(true); // Set loading to true when the request is made
            const res = await fetch('../api/generateMenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goals, location, age, dietaryRestrictions })
            });

            const data = await res.json();
            if (res.ok) {
                console.log(data.message);
                await postMenuToDb(userProfile._id, data.message);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate menu');
            }
        } catch (error) {
            console.error('Error sending OpenAI request: ', error);
        } finally {
            setLoading(false); // Set loading to false when the request is completed
        }
    };

    const postMenuToDb = async (userId, menu) => {
        try {
            const res = await fetch(`../api/menu?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, menu })
            });

            const data = await res.json();
            if (res.ok) {
                console.log('Data: ', data);
                setMenuContent(data);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to push menu to DB');
            }
        } catch (error) {
            console.error('Error pushing menu to DB: ', error);
        }
    };

    useEffect(() => {
        if (userProfile && userProfile._id) {
            checkDbForMenu(userProfile._id);
            console.log(menuContent) // Pass userProfile._id to the function
        }
    }, [userProfile]);

    return (
        <>
            {loading ? (
                <p>Loading...</p> // Show loading state while waiting for API response
            ) : (
                <div classname='flex flex-col items-center'>
                    {menuContent ? (
                        <Menu content={menuContent} />
                    ) : (
                        <p className="mb-4">Generate a menu to start a day!</p>
                    )}
                    <Button onClick={handleGenerateMenu}>Generate Menu</Button>
                </div>
            )}
        </>
    );
}
