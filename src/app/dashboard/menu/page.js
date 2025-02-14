'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";
import { checkDbForMenu, handleGenerateMenu, createMenuFromJson } from "../../../../_lib/menuActions";
import MenuClass from "@/classes/MenuClass";

export default function MenuGenerator() {
    const { userProfile } = useContext(UserContext);
    const { goals, location, age, dietaryRestrictions } = userProfile;
    const [menuContent, setMenuContent] = useState([]);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(false); // Controls the loading state

    // Fetch the menu from the database when the user profile is available
    useEffect(() => {
        if (userProfile?._id) {
            fetchMenu();
        }
    }, [userProfile]);

    const fetchMenu = async () => {
        const fetchedMenu = await checkDbForMenu(userProfile._id, setLoading);
        if (fetchedMenu.status === 200) {
            if (fetchedMenu.menu?.meals?.length) {  
                setMenuContent(fetchedMenu.menu.meals);
                setMenu(fetchedMenu);
            } else {
                console.warn("Fetched menu is empty or undefined!");
            }
        }
    };

    const onGenerateButtonClick = async () => {
        console.log(await handleGenerateMenu(setLoading, setMenuContent, goals, location, age, dietaryRestrictions, userProfile));
    };

    return (
        <div className="flex flex-col items-center">
            {!menuContent ||
                menuContent.length === 0
                ? (
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
                onClick={onGenerateButtonClick}
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
