import MealClass from "@/classes/MealClass";
import MenuClass from "@/classes/MenuClass";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the menu from the database for a given user.
 * @param {string} userId - The user's ID.
 * @param {function} setMenuContent - Function to update the menu state.
 * @param {function} setLoading - Function to toggle the loading state.
 * @param {function} showPopup - Function to show popups on frontend error or success cases.
*/

export async function checkDbForMenu(userId, setLoading, showPopup) {
    try {
        setLoading(true);

        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            showPopup('Server error', 'error')
            console.error(`Server error: ${res.status} ${res.statusText}`);
            return { menu: new MenuClass([]), status: res.status, message: `Error fetching menu` };
        }

        const data = await res.json();
        const menuData = typeof data.menu === "string" ? JSON.parse(data.menu) : data.menu;

        if (menuData.length === 0) {
            return { menu: new MenuClass([]), status: res.status, message: 'No menu generated today' };
        }

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
            // meal.like,
            // meal.dislike
        ));

        return { menu: new MenuClass(convertedMeals), status: res.status, message: 'Menu parsed successfully' };


    } catch (error) {
        showPopup('Server error', 'error');
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
 * @param {object} userProfileDynamic - User profile containing the ID.
 * @param {function} showPopup - Function to show popups on frontend error or success cases.

 */
export async function handleGenerateMenu(
    setLoading,
    setMenuContent,
    userProfileDynamic,
    showPopup,
    yesterdaysMeals
) {
    try {
        setLoading(true);
        const menu = new MenuClass([]);

        const res = await fetch(`${baseUrl}/api/generateMenu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userProfile: userProfileDynamic, yesterdaysMeals }),
        });

        if (!res.body) {
            showPopup('Not enough data!', 'error');
            throw new Error('No response body');
        }


        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streaming = true;
        let result = '';
        let tempResult = '';

        const favoriteNames = new Set(userProfileDynamic.favoriteMeals.map(m => m.name.toLowerCase()));
        const dislikedNames = new Set(userProfileDynamic.dislikedMeals.map(m => m.name.toLowerCase()));

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
                        // const lowerIngredients = rawMealData.ingredients.map(i => i.toLowerCase());
                        // const lowerCuisine = rawMealData.cuisine.toLowerCase();
                        const streamedMeal = new MealClass(
                            rawMealData.name,
                            rawMealData.calories,
                            rawMealData.cuisine,
                            // lowerCuisine,
                            rawMealData.weight,
                            rawMealData.protein,
                            rawMealData.fats,
                            rawMealData.carbs,
                            rawMealData.ingredients,
                            // lowerIngredients,
                            favoriteNames.has(userProfileDynamic.name),
                            dislikedNames.has(userProfileDynamic.name),
                        );
                        menu.addMeal(streamedMeal);
                        setMenuContent(prevMeals => [...prevMeals, streamedMeal]);

                        try {
                            await addMealToDb({
                                name: streamedMeal.name,
                                cuisine: streamedMeal.cuisine,
                                ingredients: streamedMeal.ingredients,
                                calories: streamedMeal.calories,
                                weight: streamedMeal.weight,
                                protein: streamedMeal.protein,
                                fats: streamedMeal.fats,
                                carbs: streamedMeal.carbs,
                            });
                        } catch (error) {
                            console.error('Failed to add meal to DB, continuing anyway:', error);
                        }

                    } catch (error) {
                        showPopup('Invalid menu data format', 'error')
                        console.error("Invalid JSON:", error);
                    }

                    // Update tempResult for the next iteration
                    tempResult = extraction.remaining;
                    extraction = extractObjectFromLine(tempResult);
                }
            } catch (streamError) {
                showPopup('Error on live generation', 'error');
                console.error("Error while reading stream:", streamError);
                streaming = false;
            }
        }

        if (!res.ok) {
            showPopup('Failed to generate menu', 'error');
            console.error('Failed to generate menu');
            return { menu: [], status: res.status, message: "Failed to generate menu" };
        }

        await fetch(`${baseUrl}/api/menu?userId=${userProfileDynamic._id}`, {
            method: 'DELETE',
        });

        if (menu.meals.length > 0) {
            await postMenuToDb(userProfileDynamic._id, JSON.stringify(menu.meals)); // Use what works
        }
        return { menu, status: 200, message: "Menu generated successfully!" };

    } catch (error) {
        showPopup('Error sending request', 'error');
        console.error('Error sending request:', error);
        return { menu: [], status: 400, message: `Error sending request: ${error.message}` };
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
            console.log('Menu saved to DB');
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

/**
 * Adds a meal to the separate meals collection in the database.
 * @param {object} meal - The meal object to add.
 */
export async function addMealToDb(meal) {
    try {
        const response = await fetch(`${baseUrl}/api/addMeal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meal),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Failed to add meal to DB:', data.error || response.statusText);
        }
        // No need to await response.json() if we don’t care about the result—silent operation
    } catch (error) {
        console.error('Error adding meal to DB:', error);
    }
}

export async function generateMeal(promptValue, setIsLoading) {
    try {
        const response = await fetch("/api/generateOneMeal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ promptValue }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate meal");
        }

        setIsLoading(false);
        return await response.json();
    } catch (error) {
        console.error("Error generating meal:", error);
        return null;
    }
}

export const fetchYesterdayMeals = async (userId) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = yesterday.toISOString().split("T")[0]; // e.g., "2025-03-24"

    const url = `${baseUrl}/api/menu?userId=${userId}&date=${formatted}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        return;
    }

    const yesterdayMenu = await res.json();
    const meals = Array.isArray(yesterdayMenu.menu)
    ? yesterdayMenu.menu
    : JSON.parse(yesterdayMenu.menu || '[]')
    const mappedNames = meals.map(meal => meal.name)
    return mappedNames;
}

export async function fetchMenuByDate(userId, date) {
    const url = `${baseUrl}/api/menu?userId=${userId}&date=${date}`
  
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // prevent stale fetch in SSR
      })
  
      if (!res.ok) {
        console.error(`Server error: ${res.status} ${res.statusText}`)
        return { menu: [], status: res.status, message: 'Error fetching menu' }
      }
  
      const data = await res.json()
      const menu = data.menu ?? []
  
      return { menu, status: res.status, message: 'Menu fetched' }
  
    } catch (error) {
      console.error('Fetch error:', error)
      return { menu: [], status: 500, message: 'Network or server error' }
    }
  }
  