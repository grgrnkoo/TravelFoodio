'use client'

import { Button } from "@/components/ui/button";
import Menu from "@/components/Menu";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/UserProvider";
import { checkDbForMenu, handleGenerateMenu, fetchYesterdayMeals } from "../../../_lib/menuActions";
import { decreaseUpdates, resetUpdates } from "../../../_lib/usersActions";
import { usePopup } from "@/components/providers/PopUpProvider";
import { Alert } from "@/components/Alert";
import RandomThinkingSvg from "@/components/RandomThinkingSvg";
// import MenuDish from "@/components/MenuDish";
import MenuClass from "@/classes/MenuClass";

export default function MenuGenerator() {
    const { showPopup } = usePopup();

    const { userProfile, userProfileDynamic } = useContext(UserContext);
    const [menuContent, setMenuContent] = useState([]);
    const [totalNutrition, setTotalNutrition] = useState({});
    const [loading, setLoading] = useState(true); // Controls the loading state
    const [updatesRemaining, setUpdatesRemaining] = useState(userProfileDynamic?.updatesRemaining);
    const [yesterdaysMeals, setYesterdaysMeals] = useState([]);

    // Fetch the menu from the database when the user profile is available

    const fetchMenu = async () => {
        const yesterdaysFetch = await fetchYesterdayMeals(userProfile?._id);
        setYesterdaysMeals(yesterdaysFetch);
        const fetchedMenu = await checkDbForMenu(userProfile._id, setLoading, showPopup);
        if (fetchedMenu.status === 200) {
            if (fetchedMenu.menu?.meals?.length > 0) {
                const newMenu = new MenuClass(fetchedMenu.menu.meals);
                const totalNutrition = newMenu.calculateTotalNutrition()
                setTotalNutrition(totalNutrition);
                setMenuContent(newMenu.meals);
            } else {
                const resetResult = await resetUpdates(userProfile?._id, userProfile?.subscriptionType);
                if (resetResult.success) {
                    setUpdatesRemaining(resetResult.updatesRemaining);
                }
            }
        } else {
            console.error('Failed to fetch menu:', fetchedMenu.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        let fetched = false;
        if (userProfile?._id && !fetched) {
            fetchMenu();
            fetched = true;
        }
    }, [userProfile]);

    const onGenerateButtonClick = async () => {
        try {
            if (!userProfile?._id || updatesRemaining == null) {
                showPopup('Missing user info—check your profile!', 'error');
                console.error("Missing user ID or updatesRemaining value.");
                return;
            }

            if (menuContent.length > 0) {
                setMenuContent([]);
                setTotalNutrition({});
            }

            const menuCreation = await handleGenerateMenu(setLoading, setMenuContent, userProfileDynamic, showPopup, yesterdaysMeals);

            if (menuCreation?.status >= 200 && menuCreation?.status < 300) {
                try {
                    const decreaseResult = await decreaseUpdates(userProfile._id, updatesRemaining);
                    const totalNutrition = menuCreation.menu.calculateTotalNutrition();
                    setTotalNutrition(totalNutrition);
                    if (decreaseResult.success) {
                        setUpdatesRemaining(decreaseResult.updatesRemaining);
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
        <div className="flex flex-col items-center w-full">
            {
                menuContent &&
                <h2
                    className="ml-4 mr-auto mb-2 mt-6 text-2xl font-bold md:hidden"
                >
                    Your Menu For Today
                </h2>
            }
            <Menu
                content={menuContent}
                totalNutrition={totalNutrition}
                showTotal={true}
                loading={loading}
                className='flex-grow w-full' />
            {
                (!menuContent || menuContent.length === 0 || !userProfile) && !loading && (
                    <>
                        {
                            <div className="my-12">
                                <RandomThinkingSvg />
                            </div>
                        }
                        <p className="my-4 text-center">Generate a menu to start a day!</p>
                    </>
                )
            }

            {!loading && updatesRemaining === 0 && (
                <Alert variant="red" title="You're out of refreshes!">
                    {userProfile?.subscriptionType !== "premium" && (
                        <p>Upgrade your plan to get more refresh attempts!</p>
                    )}
                </Alert>
            )}
            {/* Button to generate a new menu */}
            {/* <span className="text-xs text-center max-w-[70%] text-gray-400 my-1">Note: It's recommended to refresh a page after updating preferences to reach most specific results!</span> */}
            <Button
                onClick={onGenerateButtonClick}
                disabled={loading || updatesRemaining === 0}
                className="mb-8 mt-3 cursor-pointer"
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
