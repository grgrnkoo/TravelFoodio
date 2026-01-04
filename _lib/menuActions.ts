import MealClass from "@/classes/MealClass";
import MenuClass from "@/classes/MenuClass";
import React from "react";
import { IUser, IUserMeal, PopupType } from "../types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

interface MenuResponse {
    menu: MenuClass | MealClass[];
    status: number;
    message: string;
}

interface MealData {
    name: string;
    calories?: number;
    cuisine?: string;
    weight?: number;
    protein?: number;
    fats?: number;
    carbs?: number;
    ingredients?: string[];
}

/**
 * Fetches the menu from the database for a given user.
 */
export async function checkDbForMenu(
    userId: string,
    setLoading: SetStateAction<boolean>,
    showPopup: (message: string, type?: PopupType) => void
): Promise<MenuResponse> {
    try {
        setLoading(true);

        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            showPopup('Server error', 'error');
            console.error(`Server error: ${res.status} ${res.statusText}`);
            return { menu: new MenuClass([]), status: res.status, message: `Error fetching menu` };
        }

        const data = await res.json();
        const menuData = typeof data.menu === "string" ? JSON.parse(data.menu) : data.menu;

        if (menuData.length === 0) {
            return { menu: new MenuClass([]), status: res.status, message: 'No menu generated today' };
        }

        // Ensure each meal is wrapped in MealClass
        const convertedMeals = menuData.map((meal: MealData) => new MealClass(
            meal.name,
            meal.calories,
            meal.cuisine,
            meal.weight,
            meal.protein,
            meal.fats,
            meal.carbs,
            meal.ingredients || [],
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
 */
export async function handleGenerateMenu(
    setLoading: SetStateAction<boolean>,
    setMenuContent: SetStateAction<MealClass[]>,
    userProfileDynamic: IUser,
    showPopup: (message: string, type?: PopupType) => void,
    yesterdaysMeals?: string[]
): Promise<MenuResponse> {
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

        const favoriteNames = new Set(userProfileDynamic.favoriteMeals.map((m: IUserMeal) => m.name.toLowerCase()));
        const dislikedNames = new Set(userProfileDynamic.dislikedMeals.map((m: IUserMeal) => m.name.toLowerCase()));

        while (streaming) {
            try {
                const { value, done } = await reader.read();
                if (done) streaming = false;
                const chunk = decoder.decode(value, { stream: true });

                result += chunk;
                tempResult += chunk;
                let extraction = extractObjectFromLine(tempResult);

                while (extraction.extracted) {
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
                            favoriteNames.has(rawMealData.name?.toLowerCase()),
                            dislikedNames.has(rawMealData.name?.toLowerCase()),
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
                        showPopup('Invalid menu data format', 'error');
                        console.error("Invalid JSON:", error);
                    }

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
            await postMenuToDb(String(userProfileDynamic._id), JSON.stringify(menu.meals));
        }
        return { menu, status: 200, message: "Menu generated successfully!" };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showPopup('Error sending request', 'error');
        console.error('Error sending request:', message);
        return { menu: [], status: 400, message: `Error sending request: ${message}` };
    } finally {
        setLoading(false);
    }
}

/**
 * Saves a menu to the database.
 */
export async function postMenuToDb(userId: string, menu: string): Promise<void> {
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

function extractObjectFromLine(line: string): { extracted: string | null; remaining: string } {
    const start = line.indexOf('{');
    const end = line.indexOf('}', start);

    if (start !== -1 && end !== -1) {
        const extracted = line.substring(start, end + 1);
        const remaining = line.substring(end + 1).trim();
        return { extracted, remaining };
    }

    return { extracted: null, remaining: line };
}

export function createMenuFromJson(jsonData: { meals: MealData[] }): MenuClass {
    const meals = jsonData.meals.map((meal: MealData) =>
        new MealClass(meal.name, meal.calories, meal.cuisine, meal.weight || 0, meal.protein || 0, meal.fats || 0, meal.carbs || 0, meal.ingredients || [])
    );
    return new MenuClass(meals);
}

/**
 * Adds a meal to the separate meals collection in the database.
 */
export async function addMealToDb(meal: {
    name: string;
    cuisine?: string;
    ingredients?: string[];
    calories?: number;
    weight?: number;
    protein?: number;
    fats?: number;
    carbs?: number;
}): Promise<void> {
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
    } catch (error) {
        console.error('Error adding meal to DB:', error);
    }
}

export async function generateMeal(
    promptValue: string,
    setIsLoading: SetStateAction<boolean>
): Promise<MealData | null> {
    console.log("[generateMeal] Starting with prompt:", promptValue);
    console.log("[generateMeal] baseUrl:", baseUrl);
    console.log("[generateMeal] Full URL:", `${baseUrl}/api/generateOneMeal`);
    
    try {
        const response = await fetch(`${baseUrl}/api/generateOneMeal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ promptValue }),
        });

        console.log("[generateMeal] Response status:", response.status);
        console.log("[generateMeal] Response headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[generateMeal] Failed to generate meal:", response.status, errorText);
            throw new Error(`Failed to generate meal: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        console.log("[generateMeal] Content-Type:", contentType);

        const data = await response.json();
        console.log("[generateMeal] Received data:", data);
        
        setIsLoading(false);
        return data;
    } catch (error) {
        console.error("[generateMeal] Error generating meal:", error);
        setIsLoading(false);
        return null;
    }
}

export const fetchYesterdayMeals = async (userId: string): Promise<string[] | undefined> => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = yesterday.toISOString().split("T")[0];

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
        : JSON.parse(yesterdayMenu.menu || '[]');
    const mappedNames = meals.map((meal: MealData) => meal.name);
    return mappedNames;
};

export async function fetchMenuByDate(
    userId: string,
    date: string
): Promise<{ menu: MealClass[]; status: number; message: string }> {
    const url = `${baseUrl}/api/menu?userId=${userId}&date=${date}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`Server error: ${res.status} ${res.statusText}`);
            return { menu: [], status: res.status, message: 'Error fetching menu' };
        }

        const data = await res.json();
        const menu = data.menu ?? [];

        return { menu, status: res.status, message: 'Menu fetched' };

    } catch (error) {
        console.error('Fetch error:', error);
        return { menu: [], status: 500, message: 'Network or server error' };
    }
}
