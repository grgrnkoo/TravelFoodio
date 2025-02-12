const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the menu from the database for a given user.
 * @param {string} userId - The user's ID.
 * @param {function} setMenuContent - Function to update the menu state.
 * @param {function} setLoading - Function to toggle the loading state.
 */
export async function checkDbForMenu(userId, setMenuContent, setLoading) {
    try {
        setLoading(true); // Start loading state

        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.status === 404) {
            console.log('Menu does not exist');
            setMenuContent(null);
        } else {
            const data = await res.json();
            console.log('Fetched menu:', data);
            setMenuContent(data);
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
        setMenuContent(null);
    } finally {
        setLoading(false); // End loading state
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

        const res = await fetch(`${baseUrl}/api/generateMenu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goals, location, age, dietaryRestrictions }),
        });

        const data = await res.json();

        if (res.ok) {
            console.log('Generated menu:', data.message);
            await postMenuToDb(userProfile._id, data.message, setMenuContent);
        } else {
            console.error('Error generating menu:', data.error);
        }
    } catch (error) {
        console.error('Error sending request:', error);
    } finally {
        setLoading(false);
    }
}

/**
 * Saves a menu to the database.
 * @param {string} userId - The user's ID.
 * @param {object} menu - The menu data.
 * @param {function} setMenuContent - Function to update the menu state.
 */
export async function postMenuToDb(userId, menu, setMenuContent) {
    try {
        const res = await fetch(`${baseUrl}/api/menu?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, menu }),
        });

        const data = await res.json();

        if (res.ok) {
            console.log('Menu saved to DB:', data);
            setMenuContent(data);
        } else {
            console.error('Error saving menu:', data.error);
        }
    } catch (error) {
        console.error('Error pushing menu to DB:', error);
    }
}
