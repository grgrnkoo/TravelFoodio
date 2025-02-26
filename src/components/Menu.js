'use client'

import { useMemo, useState, useContext, useEffect } from "react";
import MenuDish from "./MenuDish";
import { UserContext } from "./UserProvider";
import { updateUserPreferences } from "../../_lib/mealsActions";

export default function Menu(menuContent) {
    const time = useMemo(() => new Date().toISOString(), []);
    const { userProfile } = useContext(UserContext);
    const [userLikedMeals, setUserLikedMeals] = useState([]);
    const [userDislikedMeals, setUserDislikedMeals] = useState([]);
    const [userIngredients, setUserIngredients] = useState([]);
    const [userCuisines, setUserCuisines] = useState([]);
    const [updatedRecently, setUpdatedRecently] = useState(false);

    useEffect(() => {
        let timer;
        if (updatedRecently) {
            timer = setTimeout(() => {
                setUpdatedRecently(false);
                updateUserPreferences(userProfile._id, userLikedMeals, userDislikedMeals, userIngredients, userCuisines);
                setUserCuisines([]);
                setUserIngredients([]);
            }, 500);
        }
        return () => clearTimeout(timer);  // Cleanup the timeout when the component unmounts or before the next effect run
    }, [updatedRecently]);  // Trigger effect when updatedRecently changes


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
                        userLikedMeals={userLikedMeals}
                        setUserLikedMeals={setUserLikedMeals}
                        userDislikedMeals={userDislikedMeals}
                        setUserDislikedMeals={setUserDislikedMeals}
                        userIngredients={userIngredients}
                        setUserIngredients={setUserIngredients}
                        userCuisines={userCuisines}
                        setUserCuisines={setUserCuisines}
                        setUpdatedRecently={setUpdatedRecently}
                        key={time + index}
                    />
                ))}
        </div>
    );
}
