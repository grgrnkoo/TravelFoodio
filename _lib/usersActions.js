const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function updateUserByEmail(email, key, value) {

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
 * @param {string} userId - The user's ID.
 * @param {number} currentUpdates - Current updatesRemaining value.
 * @returns {Promise<object>} - Response with success status and new updatesRemaining.
 */
export async function decreaseUpdates(userId, currentUpdates) {
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
    } catch (error) {
        console.error('Error decreasing updates:', error);
        return { success: false, updatesRemaining: currentUpdates, error: error.message };
    }
}

/**
 * Resets the user's updatesRemaining based on subscription type.
 * @param {string} userId - The user's ID.
 * @param {string} subscriptionType - User's subscription type ('free', 'paid', 'premium').
 * @returns {Promise<object>} - Response with success status and new updatesRemaining.
 */
export async function resetUpdates(userId, subscriptionType) {
    // Validation
    if (!userId || typeof userId !== 'string') {
        console.error('Invalid userId:', userId);
        return { success: false, updatesRemaining: 0, error: 'Invalid userId' };
    }
    if (!subscriptionType || typeof subscriptionType !== 'string') {
        console.error('Invalid subscriptionType:', subscriptionType);
        return { success: false, updatesRemaining: 0, error: 'Invalid subscriptionType—must be a string' };
    }

    const updatesMap = {
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

    const updates = updatesMap[subscriptionType];

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
    } catch (error) {
        console.error('Error resetting updates:', error);
        return { success: false, updatesRemaining: 0, error: error.message };
    }
}

// check for route and 'User' import
export async function updateSubscriptionType(userId, newPlan) {
    try {
        await dbConnect();

        const user = await User.findByIdAndUpdate(userId, { subscriptionType: newPlan }, { new: true });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, subscriptionType: user.subscriptionType };
    } catch (error) {
        console.error('Error updating subscription type:', error);
        return { success: false, error: 'Internal server error' };
    }
}


export async function upgradeUser(userId, newPlan) {
    const roleUpdate = await updateSubscriptionType(userId, newPlan);
    if (roleUpdate.success) {
        const resetUpdatesCall = await resetUpdates(userId);
        if (resetUpdatesCall.success) {
            console.log('User upgraded & updates reset successfully');
        } else {
            console.error('Failed to reset updates count');
        }
    } else {
        console.error('Failed to update subscription type');
    }
};

export function getTopFavoriteMeals(userProfile) {
  return userProfile.favoriteMeals
    .sort((a, b) => new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated))
    .slice(0, 5)
    .map(m => m.name);
}

export function getTopDislikedMeals(userProfile) {
  return userProfile.dislikedMeals
    .sort((a, b) => new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated))
    .slice(0, 5)
    .map(m => m.name);
}

export function getTopIngredients(userProfile) {
  return userProfile.ingredients
    .sort((a, b) => b.rating - a.rating || new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated)) // Rating, then latest
    .slice(0, 5)
    .map(i => i.name);
}

export function getBottomIngredients(userProfile) {
  return userProfile.ingredients
    .sort((a, b) => a.rating - b.rating || new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated)) // Rating, then latest
    .slice(0, 5)
    .map(i => i.name);
}

export function getTopCuisines(userProfile) {
  return userProfile.cuisines
    .sort((a, b) => b.rating - a.rating || new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated))
    .slice(0, 5)
    .map(c => c.name);
}

export function getBottomCuisines(userProfile) {
  return userProfile.cuisines
    .sort((a, b) => a.rating - b.rating || new Date(b.dateLastUpdated) - new Date(a.dateLastUpdated))
    .slice(0, 5)
    .map(c => c.name);
}