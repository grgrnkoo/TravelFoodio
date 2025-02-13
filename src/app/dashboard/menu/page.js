'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";
import { checkDbForMenu, handleGenerateMenu } from "../../../../_lib/menuActions";

export default function MenuGenerator() {
    const { userProfile } = useContext(UserContext);
    const { goals, location, age, dietaryRestrictions } = userProfile;
    const [menuContent, setMenuContent] = useState(null);
    const [loading, setLoading] = useState(false); // Controls the loading state

    // Fetch the menu from the database when the user profile is available
    useEffect(() => {
        if (userProfile?._id) {
            const fetchMenu = async () => {
                await checkDbForMenu(userProfile._id, setMenuContent, setLoading);
            };
            fetchMenu();
        }
    }, [userProfile]);

    return (
        <div className="flex flex-col items-center">
            {!menuContent ? (
                <p className="mb-4">Generate a menu to start a day!</p>
            ) : loading ? (
                <>
                    <Menu content={menuContent} />
                    <p>Loading...</p>
                </>
            ) : (
                <Menu content={menuContent} />
            )}


            {/* Button to generate a new menu */}
            <Button
                onClick={() =>
                    handleGenerateMenu(setLoading, setMenuContent, goals, location, age, dietaryRestrictions, userProfile)
                }
                disabled={loading}
            >
                {
                    !loading ? (
                        'Generate Menu '
                    ) : (
                        'Loading...'
                    )
                }
            </Button>
        </div>
    );
}
