export async function handlePreferenceClick(
    action,
    meal,
    setUserLikedMeals,
    setUserDislikedMeals,
    setUserIngredients,
    setUserCuisines,
    like,
    dislike
) {
    console.log(
        "Action: ", action,
        "Ingredients: ", meal.ingredients,
        "Liked: ", like,
        "Disliked: ", dislike,
        "Cuisine: ", meal.cuisine
    );

    addNewElementsToArray(meal.ingredients, setUserIngredients);
    addNewElementsToArray(meal.cuisine, setUserCuisines);

    const isCurrentlyLiked = like;
    const isCurrentlyDisliked = dislike;

    const updatedLike = action === "like" ? !isCurrentlyLiked : false;
    const updatedDislike = action === "dislike" ? !isCurrentlyDisliked : false;

    const updatedMeal = {
        ...meal,
        like: action === "like" ? !meal.like : false,
        dislike: action === "dislike" ? !meal.dislike : false,
    };

    // Update the liked meals list
    setUserLikedMeals((prevLiked) => {
        let updatedLikedMeals = [...prevLiked];

        if (updatedLike) {
            updatedLikedMeals = updatedLikedMeals.filter(m => m.name !== updatedMeal.name);
            updatedLikedMeals.push(updatedMeal);
        } else {
            updatedLikedMeals = updatedLikedMeals.filter(m => m.name !== updatedMeal.name);
        }

        return updatedLikedMeals;
    });

    // Update the disliked meals list
    setUserDislikedMeals((prevDisliked) => {
        let updatedDislikedMeals = [...prevDisliked];

        if (updatedDislike) {
            updatedDislikedMeals = updatedDislikedMeals.filter(m => m.name !== updatedMeal.name);
            updatedDislikedMeals.push(updatedMeal);
        } else {
            updatedDislikedMeals = updatedDislikedMeals.filter(m => m.name !== updatedMeal.name);
        }

        return updatedDislikedMeals;
    });

    updateElementRating(action, meal.ingredients, setUserIngredients, isCurrentlyLiked, isCurrentlyDisliked);
    updateElementRating(action, meal.cuisine, setUserCuisines, isCurrentlyLiked, isCurrentlyDisliked);
}


const addNewElementsToArray = (toBeSet, setFunction) => {
    // Ensure toBeSet is always an array
    const elementsArray = Array.isArray(toBeSet) ? toBeSet : [toBeSet];

    setFunction((prevElements = []) => {
        if (!Array.isArray(prevElements)) {
            console.error('Error: prevElements is not an array', prevElements);
            return prevElements;
        }

        const newElements = elementsArray
            .filter((element) => !prevElements.some(item => item.name === element))
            .map((element) => ({ name: element, rating: 0 }));

        return [...prevElements, ...newElements];
    });
};


const updateElementRating = (action, mealElements, setElements, wasLiked, wasDisliked) => {
    const elementsArray = Array.isArray(mealElements) ? mealElements : [mealElements];

    setElements((prevElements) => {  // Fix: use setElements, not setUserIngredients

        return prevElements.map((element) => {
            if (elementsArray.includes(element.name)) { // Ensure mealElements is an array
                let newRating = element.rating;

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

                return { ...element, rating: newRating };
            }
            return element;
        });
    });
};

export const updateUserPreferences = async (userId, likedMeals, dislikedMeals, ingredients, cuisines, setUserProfileDynamic) => {
    try {
        const response = await fetch('/api/preferenceUpdate', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, likedMeals, dislikedMeals, ingredients, cuisines })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to update preferences");

    } catch (error) {
        console.error("Error updating preferences:", error);
    }
};