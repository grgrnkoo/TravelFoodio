'use client'

import { ThumbsUp } from 'lucide-react';
import { ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { handlePreferenceClick } from '../../_lib/mealsActions';

const checkLikeDislike = (mealName, array) => {
    return array.some(meal => meal.name === mealName);
};

export default function MenuDish(props) {
    const { menuDish, userLikedMeals, setUserLikedMeals, userDislikedMeals, setUserDislikedMeals, userIngredients, setUserIngredients, userCuisines, setUserCuisines, handleLikeClick } = props;
    const [like, setLike] = useState(checkLikeDislike(menuDish, userLikedMeals));
    const [dislike, setDislike] = useState(checkLikeDislike(menuDish, userLikedMeals));

    const handleClick = async (action) => {
        setLike(action === "like" ? !like : false);
        setDislike(action === "dislike" ? !dislike : false);

        await handlePreferenceClick(action, menuDish, setUserLikedMeals, setUserDislikedMeals, setUserIngredients, setUserCuisines, like, dislike);
    };

    return (
        <div
            key={menuDish.name}
            className="w-full border border-black rounded-md my-4 p-2"
        >

            <p><strong>Meal:</strong> {menuDish?.name}</p>
            <p><strong>Cuisine:</strong> {menuDish?.cuisine}</p>
            <p><strong>Approximate Calories:</strong> {menuDish?.calories}kcal</p>
            <p><strong>Carbs:</strong> {menuDish?.carbs}g</p>
            <p><strong>Fats:</strong> {menuDish?.fats}g</p>
            <p><strong>Protein:</strong> {menuDish?.protein}g</p>
            <p><strong>Ingredients:</strong> {menuDish?.ingredients?.join(", ")}</p>
            <p><strong>Ingredient Rating:</strong> {userIngredients.map((ingredient) => ingredient.rating)}</p>
            <p><strong>Cuisine Rating:</strong> {userCuisines.map((cuisine) => cuisine.rating)}</p>
            <div className='flex justify-end p-2 '>
                <ThumbsUp
                    className='hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        like ? 'green' : 'none'
                    }
                    stroke={
                        like ? 'green' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={() => handleClick('like')}
                />
                <ThumbsDown
                    className='ml-2 hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        dislike ? 'red' : 'none'
                    }
                    stroke={
                        dislike ? 'red' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={() => handleClick('dislike')}
                />
            </div>
        </div>
    )
}