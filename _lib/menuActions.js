import MealClass from "@/classes/MealClass";
import MenuClass from "@/classes/MenuClass";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the menu from the database for a given user.
 * @param {string} userId - The user's ID.
 * @param {function} setMenuContent - Function to update the menu state.
 * @param {function} setLoading - Function to toggle the loading state.
 */

export async function checkDbForMenu(userId, setLoading) {
    try {
        setLoading(true);

        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            if (res.status === 404) {
                console.log('Menu does not exist');
                return { menu: new MenuClass([]), status: 404, message: `Menu doesn't exist` };
            }
            console.error(`Server error: ${res.status} ${res.statusText}`);
            return { menu: new MenuClass([]), status: res.status, message: `Error fetching menu` };
        }

        const data = await res.json();
        const menuData = typeof data.menu === "string" ? JSON.parse(data.menu) : data.menu;

        console.log('Fetched menu:', menuData);

        // Ensure each meal is wrapped in MealClass
        const convertedMeals = menuData.map(meal => new MealClass(
            meal.name,
            meal.calories,
            meal.cuisine,
            meal.weight,
            meal.protein,
            meal.fats,
            meal.carbs,
            meal.ingredients,
            meal.like,
            meal.dislike
        ));

        return { menu: new MenuClass(convertedMeals), status: res.status, message: 'Menu parsed successfully' };


    } catch (error) {
        console.error('Error fetching menu:', error);
        return { menu: new MenuClass([]), status: 500, message: `Error fetching menu: ${error}` };
    } finally {
        setLoading(false);
    }
}


/**
 * Generates a new menu and saves it to the database.
 * @param {function} setLoading - Function to toggle the loading state.
 * @param {function} setMenuContent - Function to update the menu state.
 * @param {string} goals - User's dietary goals.
 * @param {string} location - User's location.
 * @param {number} age - User's age.
 * @param {array} dietaryRestrictions - List of dietary restrictions.
 * @param {object} userProfile - User profile containing the ID.
 */
export async function handleGenerateMenu(setLoading, setMenuContent, goals, location, age, dietaryRestrictions, userProfile) {
    try {
        setLoading(true);
        const menu = new MenuClass([]);

        const res = await fetch(`${baseUrl}/api/generateMenu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goals, location, age, dietaryRestrictions }),
        });

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streaming = true;
        let result = '';
        let tempResult = '';

        while (streaming) {
            try {
                const { value, done } = await reader.read();
                if (done) streaming = false;
                const chunk = decoder.decode(value, { stream: true });

                result += chunk;
                tempResult += chunk;

                let extraction = extractObjectFromLine(tempResult);

                while (extraction.extracted) { // Process all JSON objects in tempResult
                    try {
                        const rawMealData = JSON.parse(extraction.extracted);
                        const streamedMeal = new MealClass(
                            rawMealData.name,
                            rawMealData.calories,
                            rawMealData.cuisine,
                            rawMealData.weight,
                            rawMealData.protein,
                            rawMealData.fats,
                            rawMealData.carbs,
                            rawMealData.ingredients,
                            rawMealData.like,
                            rawMealData.dislike,
                        );
                        menu.addMeal(streamedMeal);
                        setMenuContent(prevMeals => [...prevMeals, streamedMeal]);
                    } catch (error) {
                        console.error("Invalid JSON:", error);
                    }

                    // Update tempResult for the next iteration
                    tempResult = extraction.remaining;
                    extraction = extractObjectFromLine(tempResult);
                }
            } catch (streamError) {
                console.error("Error while reading stream:", streamError);
                streaming = false;
            }
        }

        if (!res.ok) {
            console.error('Failed to generate menu');
            return { menu, status: res.status, message: "Failed to generate menu" };
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(result);
        } catch (error) {
            console.error("Invalid JSON streamed:", error);
            return { menu, status: 400, message: "Invalid JSON streamed" };
        }

        await postMenuToDb(userProfile._id, JSON.stringify(parsedResult));
        return { menu, status: 200, message: "Menu generated successfully!" };

    } catch (error) {
        console.error('Error sending request:', error);
        return { menu, status: 400, message: `Error sending request: ${error.message}` };
    } finally {
        setLoading(false);
    }
}


/**
 * Saves a menu to the database.
 * @param {string} userId - The user's ID.
 * @param {object} menu - The menu data.
 */
export async function postMenuToDb(userId, menu) {
    try {
        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, menu }),
        });

        const data = await res.json();

        if (res.ok) {
            console.log('Menu saved to DB:', data);
        } else {
            console.error('Error saving menu:', data.error);
        }
    } catch (error) {
        console.error('Error pushing menu to DB:', error);
    }
}

function extractObjectFromLine(line) {
    const start = line.indexOf('{');
    const end = line.indexOf('}', start); // Ensure we get the first valid JSON object

    if (start !== -1 && end !== -1) {
        const extracted = line.substring(start, end + 1);
        const remaining = line.substring(end + 1).trim(); // Remove processed object
        return { extracted, remaining };
    }

    return { extracted: null, remaining: line };
}


export function createMenuFromJson(jsonData) {
    const meals = jsonData.meals.map(meal =>
        new MealClass(meal.name, meal.calories, meal.ingredients)
    );
    return new MenuClass(meals);
}