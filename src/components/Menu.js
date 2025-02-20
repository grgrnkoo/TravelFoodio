'use client'

import { useEffect, useMemo, useState, useContext } from "react";
import { UserContext } from "./UserProvider";
import MenuDish from "./MenuDish";
import { handlePreferenceClick } from '../../_lib/mealsActions';

export default function Menu(menuContent) {
    const time = useMemo(() => new Date().toISOString(), []);
    const userContext = useContext(UserContext);
    const [userLikedMeals, setUserLikedMeals] = useState(userContext.userProfile?.favoriteMeals);
    const [userDislikedMeals, setUserDislikedMeals] = useState(userContext.userProfile?.dislikedMeals);
    const [userIngredients, setUserIngredients] = useState(userContext.userProfile?.ingredients);
    const [userCuisines, setUserCuisines] = useState(userContext.userProfile?.cuisines);

    console.log('Liked meals: ', userLikedMeals)
    console.log('Disiked meals: ', userDislikedMeals)

    return (
        <div className="w-full px-4" key={time}>
            <p>{JSON.stringify(userLikedMeals)}</p>
            <p>{JSON.stringify(userDislikedMeals)}</p>
            {menuContent &&
                menuContent.content.length > 0 &&
                menuContent.content.map((menuDish, index) => (
                    <MenuDish
                        menuDish={menuDish}
                        // handleLikeClick={handleClick}
                        userLikedMeals={userLikedMeals}
                        setUserLikedMeals={setUserLikedMeals}
                        userDislikedMeals={userDislikedMeals}
                        setUserDislikedMeals={setUserDislikedMeals}
                        userIngredients={userIngredients}
                        setUserIngredients={setUserIngredients}
                        userCuisines={userCuisines}
                        setUserCuisines={setUserCuisines}
                        key={time + index}
                    />
                ))}
        </div>
    );
}