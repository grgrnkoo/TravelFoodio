'use client'

import { useEffect, useMemo, useState, useContext } from "react";
import { UserContext } from "./UserProvider";
import MenuDish from "./MenuDish";

export default function Menu(menuContent) {
    const time = useMemo(() => new Date().toISOString(), []);
    const userContext = useContext(UserContext);
    const [userLikedMeals, setUserLikedMeals] = useState(userContext.userProfile?.favoriteMeals);
    const [userDislikedMeals, setUserDislikedMeals] = useState(userContext.userProfile?.dislikedMeals);
    const [userIngredients, setUserIngredients] = useState(userContext.userProfile?.ingredients);

    return (
        <div className="w-full px-4" key={time}>
            {menuContent &&
                menuContent.content.length > 0 &&
                menuContent.content.map((menuDish, index) => (
                    <MenuDish
                        menuDish={menuDish}
                        userLikedMeals={userLikedMeals}
                        setUserLikedMeals={setUserLikedMeals}
                        userDislikedMeals={userDislikedMeals}
                        setUserDislikedMeals={setUserDislikedMeals}
                        userIngredients={userIngredients}
                        setUserIngredients={setUserIngredients}
                        key={time + index}
                    />
                ))}
        </div>
    );
}