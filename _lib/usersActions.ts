const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface UpdateResponse {
    success: boolean;
    error?: string | unknown;
    updatesRemaining?: number;
    subscriptionType?: string;
}

export async function updateUserByEmail(email: string, key: string, value: unknown): Promise<UpdateResponse> {
    try {
        const response = await fetch(`${baseUrl}/api/users/${email}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error sending update request:', errorData);
            return { success: false, error: errorData };
        }

        console.log('Request sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Error in update user function:', error);
        return { success: false, error };
    }
}

/**
 * Decreases the user's updatesRemaining count by 1.
 * @param userId - The user's ID.
 * @param currentUpdates - Current updatesRemaining value.
 * @returns Response with success status and new updatesRemaining.
 */
export async function decreaseUpdates(userId: string, currentUpdates: number): Promise<UpdateResponse> {
    // Validation
    if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return { success: false, updatesRemaining: currentUpdates || 0, error: 'Invalid userId' };
    }
    if (typeof currentUpdates !== 'number' || currentUpdates < 0) {
        console.error('Invalid currentUpdates:', currentUpdates);
        return { success: false, updatesRemaining: currentUpdates || 0, error: 'Invalid currentUpdates—must be a non-negative number' };
    }
    if (currentUpdates === 0) {
        console.log('No updates remaining to decrease');
        return { success: false, updatesRemaining: 0, error: 'No updates remaining' };
    }

    try {
        const updates = currentUpdates - 1;
        const response = await fetch(`${baseUrl}/api/newUpdates`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, updates }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Failed to decrease updates:', data.error || response.statusText);
            return { success: false, updatesRemaining: currentUpdates, error: data.error };
        }

        return { success: true, updatesRemaining: data.updatesRemaining };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error decreasing updates:', message);
        return { success: false, updatesRemaining: currentUpdates, error: message };
    }
}

type SubscriptionType = 'free' | 'paid' | 'premium' | 'admin';

/**
 * Resets the user's updatesRemaining based on subscription type.
 * @param userId - The user's ID.
 * @param subscriptionType - User's subscription type ('free', 'paid', 'premium').
 * @returns Response with success status and new updatesRemaining.
 */
export async function resetUpdates(userId: string, subscriptionType: string): Promise<UpdateResponse> {
    // Validation
    if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return { success: false, updatesRemaining: 0, error: 'Invalid userId' };
    }
    if (!subscriptionType || typeof subscriptionType !== 'string') {
        console.error('Invalid subscriptionType:', subscriptionType);
        return { success: false, updatesRemaining: 0, error: 'Invalid subscriptionType—must be a string' };
    }

    const updatesMap: Record<SubscriptionType, number> = {
        'free': 1,
        'paid': 3,
        'premium': 5,
        'admin': 999
    };

    const validTypes = Object.keys(updatesMap);

    if (!validTypes.includes(subscriptionType)) {
        console.error('Unknown subscriptionType:', subscriptionType);
        return { success: false, updatesRemaining: 0, error: `Unknown subscriptionType—must be one of ${validTypes.join(', ')}` };
    }

    const updates = updatesMap[subscriptionType as SubscriptionType];

    try {
        const response = await fetch(`${baseUrl}/api/newUpdates`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, updates }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Failed to reset updates:', data.error || response.statusText);
            return { success: false, updatesRemaining: 0, error: data.error };
        }

        return { success: true, updatesRemaining: data.updatesRemaining };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error resetting updates:', message);
        return { success: false, updatesRemaining: 0, error: message };
    }
}

export async function updateSubscriptionType(userId: string, newPlan: string): Promise<UpdateResponse> {
    try {
        const response = await fetch(`${baseUrl}/api/setNewRole`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscriptionType: newPlan }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Failed to update subscription type:', data.error || response.statusText);
            return { success: false, error: data.error };
        }

        return { success: true, subscriptionType: data.subscriptionType };
    } catch (error) {
        console.error('Error updating subscription type:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function upgradeUser(userId: string, newPlan: string): Promise<void> {
    const roleUpdate = await updateSubscriptionType(userId, newPlan);
    if (roleUpdate.success) {
        const resetUpdatesCall = await resetUpdates(userId, newPlan);
        if (resetUpdatesCall.success) {
            console.log('User upgraded & updates reset successfully');
        } else {
            console.error('Failed to reset updates count');
        }
    } else {
        console.error('Failed to update subscription type');
    }
}

interface UserProfile {
    favoriteMeals?: Array<{ name: string; dateLastUpdated: Date }>;
    dislikedMeals?: Array<{ name: string; dateLastUpdated: Date }>;
    ingredients?: Array<{ name: string; rating: number; dateLastUpdated: Date }>;
    cuisines?: Array<{ name: string; rating: number; dateLastUpdated: Date }>;
}

export function getTopFavoriteMeals(userProfile: UserProfile): string[] | string {
    const meals = userProfile?.favoriteMeals;

    if (!meals || meals.length === 0) return 'None';

    const topFavoriteMeals = [...meals]
        .sort((a, b) => new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(m => m.name);

    return topFavoriteMeals.length > 0 ? topFavoriteMeals : 'None';
}

export function getTopDislikedMeals(userProfile: UserProfile): string[] | string {
    const meals = userProfile?.dislikedMeals;

    if (!meals || meals.length === 0) return 'None';

    const topDislikedMeals = [...meals]
        .sort((a, b) => new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(m => m.name);

    return topDislikedMeals.length > 0 ? topDislikedMeals : 'None';
}

export function getTopIngredients(userProfile: UserProfile): string[] | string {
    const liked = userProfile?.ingredients?.filter(i => i.rating > 0);

    if (!liked || liked.length === 0) return 'None';

    const topIngredients = liked
        .sort((a, b) => b.rating - a.rating || new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(i => i.name);

    return topIngredients.length > 0 ? topIngredients : 'None';
}

export function getBottomIngredients(userProfile: UserProfile): string[] | string {
    const disliked = userProfile?.ingredients?.filter(i => i.rating < 0);

    if (!disliked || disliked.length === 0) return 'None';

    const bottomIngredients = disliked
        .sort((a, b) => a.rating - b.rating || new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(i => i.name);

    return bottomIngredients.length > 0 ? bottomIngredients : 'None';
}

export function getTopCuisines(userProfile: UserProfile): string[] | string {
    const liked = userProfile?.cuisines?.filter(c => c.rating > 0);

    if (!liked || liked.length === 0) return 'None';

    const topCuisines = liked
        .sort((a, b) => b.rating - a.rating || new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(c => c.name);

    return topCuisines.length > 0 ? topCuisines : 'None';
}

export function getBottomCuisines(userProfile: UserProfile): string[] | string {
    const disliked = userProfile?.cuisines?.filter(c => c.rating < 0);

    if (!disliked || disliked.length === 0) return 'None';

    const bottomCuisines = disliked
        .sort((a, b) => a.rating - b.rating || new Date(b.dateLastUpdated).getTime() - new Date(a.dateLastUpdated).getTime())
        .slice(0, 5)
        .map(c => c.name);

    return bottomCuisines.length > 0 ? bottomCuisines : 'None';
}
