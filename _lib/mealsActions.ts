import MealClass from "@/classes/MealClass";

type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

interface Meal {
    name: string;
    ingredients: string[];
    cuisine: string;
    like?: boolean;
    dislike?: boolean;
}

interface UserElement {
    name: string;
    rating: number;
    dateLastUpdated?: Date;
}

export async function handlePreferenceClick(
    action: 'like' | 'dislike',
    meal: Meal,
    setUserLikedMeals: SetStateAction<Meal[]>,
    setUserDislikedMeals: SetStateAction<Meal[]>,
    setUserIngredients: SetStateAction<UserElement[]>,
    setUserCuisines: SetStateAction<UserElement[]>,
    like: boolean,
    dislike: boolean
): Promise<void> {
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

    const updatedMeal: Meal = {
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

const addNewElementsToArray = (
    toBeSet: string | string[],
    setFunction: SetStateAction<UserElement[]>
): void => {
    const elementsArray = Array.isArray(toBeSet) ? toBeSet : [toBeSet];

    setFunction((prevElements: UserElement[] = []) => {
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

const updateElementRating = (
    action: 'like' | 'dislike',
    mealElements: string | string[],
    setElements: SetStateAction<UserElement[]>,
    wasLiked: boolean,
    wasDisliked: boolean
): void => {
    const elementsArray = Array.isArray(mealElements) ? mealElements : [mealElements];

    setElements((prevElements) => {
        return prevElements.map((element) => {
            if (elementsArray.includes(element.name)) {
                let newRating = element.rating;

                if (action === "like") {
                    if (wasLiked) newRating -= 1;
                    else {
                        newRating += 1;
                        if (wasDisliked) newRating += 1;
                    }
                } else if (action === "dislike") {
                    if (wasDisliked) newRating += 1;
                    else {
                        newRating -= 1;
                        if (wasLiked) newRating -= 1;
                    }
                }

                return { ...element, rating: newRating };
            }
            return element;
        });
    });
};

export const updateUserPreferences = async (
    userId: string,
    likedMeals: Meal[],
    dislikedMeals: Meal[],
    ingredients: UserElement[],
    cuisines: UserElement[],
    setUserProfileDynamic?: (profile: unknown) => void
): Promise<void> => {
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
