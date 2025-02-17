export function handlePreferenceClick(action, meal, setUserLikedMeals, setUserDislikedMeals, setUserIngredients, setMeal) {
    console.log('Action: ', action, 'Ingredients: ', meal.ingredients, 'Liked: ', meal.like, 'Disliked: ', meal.dislike, 'Meal: ', meal);
    addNewIngredientsToArray(meal.ingredients, setUserIngredients);

    // Update the meal state
    setMeal((prevMeal) => {
        const isCurrentlyLiked = prevMeal.like;
        const isCurrentlyDisliked = prevMeal.dislike;

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
        updateIngredientRating(action, meal.ingredients, setUserIngredients, isCurrentlyLiked, isCurrentlyDisliked);
        
        return updatedMeal;
    });
}

const addNewIngredientsToArray = (mealIngredients, setUserIngredients) => {
    setUserIngredients((prevIngredients) => {
        // Add new ingredients to the array as objects with default rating of 0
        const newIngredients = mealIngredients
            .filter((ingredient) => !prevIngredients.some(item => item.name === ingredient))
            .map((ingredient) => ({ name: ingredient, rating: 0 }));
        
        // Return the updated userIngredients with new ingredients added
        return [...prevIngredients, ...newIngredients];
    });
};

const updateIngredientRating = (action, mealIngredients, setUserIngredients, wasLiked, wasDisliked) => {
    setUserIngredients((prevIngredients) => {
        return prevIngredients.map((ingredient) => {
            if (mealIngredients.includes(ingredient.name)) {
                let newRating = ingredient.rating;

                if (action === "like") {
                    if (wasLiked) newRating -= 1; // Unliking decreases rating
                    else {
                        newRating += 1; // Liking increases rating
                        if (wasDisliked) newRating += 1; // Switching from dislike to like adds 1 more
                    }
                } else if (action === "dislike") {
                    if (wasDisliked) newRating += 1; // Undisliking increases rating
                    else {
                        newRating -= 1; // Disliking decreases rating
                        if (wasLiked) newRating -= 1; // Switching from like to dislike subtracts 1 more
                    }
                }

                return { ...ingredient, rating: newRating };
            }
            return ingredient;
        });
    });
};