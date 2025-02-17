'use client'

import { ThumbsUp } from 'lucide-react';
import { ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { updateIngredientsDb, updateMealDb } from '../../_lib/usersActions';

const isMealLiked = (mealName, userFavoriteMeals) => {
    return userFavoriteMeals.some(meal => meal.name === mealName);
};

export default function MenuDish(props) {
    const { menuDish, userLikedMeals, setUserLikedMeals, userDislikedMeals, setUserDislikedMeals, userIngredients, setUserIngredients } = props;
    const [meal, setMeal] = useState(menuDish);

    const handleMealList = (action, meal) => {
        if (isMealLiked(meal, userLikedMeals)) {

        }
        switch (action) {
            case 'add': {
                const mealName = meal.name.toLowerCase();
                console.log(mealName);
                console.log(meal.like);
                // for (const favMeal of userFavoriteMeals) {
                //     console.log('fav meal not exists', mealName);
                //     if (mealName === favMeal.name) {
                //         isFavorite = true;
                //     }
                // }
                // const convertedIngredient = new IngredientClass(meal.toLowerCase());
                // console.log(convertedIngredient);
                // console.log(menuDish.ingredients);
                console.log(userIngredients);
                break;
            }

            case 'remove': {
                console.log(menuDish.ingredients);
                console.log(userIngredients);
                break;
            }
        }
    }

    const handlePreferenceClick = (action, e) => {
        console.log('Action: ', action, 'Ingredients: ', meal.ingredients, 'Event: ', e.target, 'Liked: ', meal.like, 'Disliked: ', meal.dislike, 'Meal: ', meal, 'Liked meals: ', userLikedMeals, 'Disliked meals: ', userDislikedMeals);
        addNewIngredientsToArray(meal.ingredients);

        // Update the meal state
        setMeal((prevMeal) => {
            const updatedMeal = {
                ...prevMeal,
                like: action === "like" ? !prevMeal.like : false,
                dislike: action === "dislike" ? !prevMeal.dislike : false
            };
    
            // Update the liked meals list
            setUserLikedMeals((prevLiked) => {
                let updatedLikedMeals = [...prevLiked];
    
                if (updatedMeal.like) {
                    updatedLikedMeals = updatedLikedMeals.filter(m => m.name !== updatedMeal.name); // Use name here
                    updatedLikedMeals.push(updatedMeal);
                } else {
                    updatedLikedMeals = updatedLikedMeals.filter(m => m.name !== updatedMeal.name); // Use name here
                }
    
                return updatedLikedMeals;
            });
    
            // Update the disliked meals list
            setUserDislikedMeals((prevDisliked) => {
                let updatedDislikedMeals = [...prevDisliked];
    
                if (updatedMeal.dislike) {
                    updatedDislikedMeals = updatedDislikedMeals.filter(m => m.name !== updatedMeal.name); // Use name here
                    updatedDislikedMeals.push(updatedMeal);
                } else {
                    updatedDislikedMeals = updatedDislikedMeals.filter(m => m.name !== updatedMeal.name); // Use name here
                }
    
                return updatedDislikedMeals;
            });
    
            return updatedMeal;
        });
    }
    
    const addNewIngredientsToArray = (mealIngredients) => {
    setUserIngredients((prevIngredients) => {
        // Add new ingredients to the array as objects with default rating of 0
        const newIngredients = mealIngredients
            .filter((ingredient) => !prevIngredients.some(item => item.name === ingredient))
            .map((ingredient) => ({ name: ingredient, rating: 0 }));
        
        // Return the updated userIngredients with new ingredients added
        return [...prevIngredients, ...newIngredients];
    });
};


    console.log(userIngredients);

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
            <p><strong>Rating:</strong> {userIngredients.map((ingredient) => ingredient.rating)}</p>
            <div className='flex justify-end p-2 '>
                <ThumbsUp
                    className='hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        meal.like ? 'green' : 'none'
                    }
                    stroke={
                        meal.like ? 'green' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={(e) => {
                        handlePreferenceClick('like', e);
                    }}
                />
                <ThumbsDown
                    className='ml-2 hover:cursor-pointer'
                    strokeWidth={1}
                    fill={
                        meal.dislike ? 'red' : 'none'
                    }
                    stroke={
                        meal.dislike ? 'red' : 'black'
                    }
                    fillOpacity={.5}
                    onClick={(e) => {
                        handlePreferenceClick('dislike', e);
                    }}
                />
            </div>
        </div>
    )
}