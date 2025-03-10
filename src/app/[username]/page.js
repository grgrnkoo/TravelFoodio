'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";
import { checkDbForMenu, handleGenerateMenu } from "../../../_lib/menuActions";
import { decreaseUpdates, resetUpdates } from "../../../_lib/usersActions";
import { usePopup } from "@/components/providers/PopUpProvider"
import { Alert } from "@/components/Alert";
import MenuDishSkeleton from "@/components/loadingSkeletons/MenuDishLoading";

export default function MenuGenerator() {
    const { showPopup } = usePopup();

    const { userProfile } = useContext(UserContext);
    const [menuContent, setMenuContent] = useState([]);
    const [loading, setLoading] = useState(true); // Controls the loading state
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
                showPopup('Missing user info—check your profile!', 'error');
                console.error("Missing user ID or updatesRemaining value.");
                return;
            }

            if (menuContent.length > 0) {
                setMenuContent([]);
            }


            const menuCreation = await handleGenerateMenu(setLoading, setMenuContent, userProfile);

            console.log('Menu creation: ', menuCreation)
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
                setMenuContent([]);
                showPopup('Menu generation failed—give it another shot!', 'error');
                console.error('Error generating menu:', menuCreation);
            }
        } catch (error) {
            setMenuContent([]);
            showPopup('Something broke—retry or yell at support!', 'error');
            console.error('Unexpected error in onGenerateButtonClick:', error);
        }
    };

    return (
        <div className="flex-1 flex-col items-center w-full">
            <Menu content={menuContent} className='flex-grow w-full' />
            {
                (!menuContent || menuContent.length === 0 || !userProfile) && !loading && (
                    <p className="mb-4">Generate a menu to start a day!</p>
                )
            }

            {
                loading &&
                Array.from({ length: 3 - menuContent?.length > 0 ? 3 - menuContent?.length : 0 }).map((_, index) => (
                    <MenuDishSkeleton key={index} className="flex-grow w-full" />
                ))
            }

            {updatesRemaining === 0 && !loading && (
                <Alert variant="red" title="You're out of refreshes!">
                    {userProfile?.subscriptionType !== "premium" && (
                        <p>Upgrade your plan to get more refresh attempts!</p>
                    )}
                </Alert>
            )}
            {/* Button to generate a new menu */}
            <Button
                onClick={onGenerateButtonClick}
                disabled={loading || updatesRemaining === 0}
                className="mb-8 mt-3"
            >
                {
                    !loading ? (
                        menuContent?.length === 0 ?
                            'Generate Menu ' :
                            'Regenerate Menu'
                    ) : (
                        'Loading...'
                    )
                }
            </Button>
        </div>
    );
}
