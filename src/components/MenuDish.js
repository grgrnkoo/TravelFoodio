'use client'

import { ThumbsUp } from 'lucide-react';
import { ThumbsDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updateIngredientsDb, updateMealDb } from '../../_lib/usersActions';
import { handlePreferenceClick } from '../../_lib/mealsActions';

const isMealLiked = (mealName, userFavoriteMeals) => {
    return userFavoriteMeals.some(meal => meal.name === mealName);
};

export default function MenuDish(props) {
    const { menuDish, userLikedMeals, setUserLikedMeals, userDislikedMeals, setUserDislikedMeals, userIngredients, setUserIngredients, userCuisines, setUserCuisines, handleLikeClick } = props;
    const [meal, setMeal] = useState(menuDish);
    const [like, setLike] = useState(meal.like);
    const [dislike, setDislike] = useState(meal.dislike);

    const handleClick = async (action) => {
        setLike(action === "like" ? !like : false);
        setDislike(action === "dislike" ? !dislike : false);

        await handlePreferenceClick(action, meal, setUserLikedMeals, setUserDislikedMeals, setUserIngredients, setUserCuisines, like, dislike);
    };


    return (
        <div
            key={menuDish.name}
            className="w-full border border-black rounded-md my-4 p-2"
        >

            <p><strong>Meal:</strong> {meal?.name}</p>
            <p><strong>Cuisine:</strong> {meal?.cuisine}</p>
            <p><strong>Approximate Calories:</strong> {meal?.calories}kcal</p>
            <p><strong>Carbs:</strong> {meal?.carbs}g</p>
            <p><strong>Fats:</strong> {meal?.fats}g</p>
            <p><strong>Protein:</strong> {meal?.protein}g</p>
            <p><strong>Ingredients:</strong> {meal?.ingredients?.join(", ")}</p>
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
                    onClick={() => handleClick('like', meal)}
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
                    onClick={() => handleClick('dislike', meal)}
                />
            </div>
        </div>
    )
}