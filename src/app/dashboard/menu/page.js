'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";
import { checkDbForMenu, handleGenerateMenu, createMenuFromJson } from "../../../../_lib/menuActions";
import MenuClass from "@/classes/MenuClass";
import { decreaseUpdates, resetUpdates } from "../../../../_lib/usersActions";

export default function MenuGenerator() {
    const { userProfile } = useContext(UserContext);
    const { goals, location, age, dietaryRestrictions } = userProfile;
    const [menuContent, setMenuContent] = useState([]);
    const [loading, setLoading] = useState(false); // Controls the loading state
    const [updatesRemaining, setUpdatesRemaining] = useState(userProfile?.updatesRemaining);

    // Fetch the menu from the database when the user profile is available
    useEffect(() => {
        console.log('User profile: ', userProfile)
        if (userProfile?._id) {
            fetchMenu();
        }
    }, [userProfile]);

    const fetchMenu = async () => {
        const fetchedMenu = await checkDbForMenu(userProfile._id, setLoading);
        if (fetchedMenu.status === 200) {
            if (fetchedMenu.menu?.meals?.length > 0) {
                setMenuContent(fetchedMenu.menu.meals);
            } else {
                const resetResult = await resetUpdates(userProfile?._id, userProfile?.subscriptionType);
                console.log('Reset result: ', resetResult);
                console.log('data passed: ', userProfile._id, userProfile.subscriptionType);
                if (resetResult.success) {
                    setUpdatesRemaining(resetResult.updatesRemaining);
                }
            }
        } else {
            console.error('Failed to fetch menu:', fetchedMenu.message);
        }
        setLoading(false);
    };

    const onGenerateButtonClick = async () => {
        try {
            if (!userProfile?._id || updatesRemaining == null) {
                console.error("Missing user ID or updatesRemaining value.");
                return;
            }

            const menuCreation = await handleGenerateMenu(setLoading, setMenuContent, goals, location, age, dietaryRestrictions, userProfile);

            if (menuCreation?.status >= 200 && menuCreation?.status < 300) {
                try {
                    const decreaseResult = await decreaseUpdates(userProfile._id, updatesRemaining);

                    if (decreaseResult.success) {
                        setUpdatesRemaining(decreaseResult.updatesRemaining);
                        console.log('Decrease result:', decreaseResult);
                    } else {
                        console.error('Failed to update remaining number of updates:', decreaseResult.error);
                    }
                } catch (updateError) {
                    console.error('Error while decreasing updates:', updateError);
                }
            } else {
                console.error('Error generating menu:', menuCreation);
            }
        } catch (error) {
            console.error('Unexpected error in onGenerateButtonClick:', error);
        }
    };

    // const onButtonClick = async () => {
    //     if (updatesRemaining <= 0) {
    //         console.log('No updates remaining');
    //         return;
    //     }
    //     setLoading(true);
    //     const result = await handleGenerateMenu(setLoading, setMenuContent, goals, location, age, dietaryRestrictions, userProfile);
    //     if (result.status === 200) {
    //         setHasMenuToday(true);
    //         setUpdatesRemaining(result.updatesRemaining || updatesRemaining - 1); // Update from result or decrement
    //     } else {
    //         console.error('Menu generation failed:', result.message);
    //     }
    //     setLoading(false);
    // };

    return (
        <div className="flex flex-col items-center">
            {!menuContent ||
                menuContent.length === 0 ||
                !userProfile
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
                // onClick={onButtonClick}
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
