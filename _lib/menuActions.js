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

        if (!res.ok) {
            if (res.status === 404) {
                console.log('Menu does not exist');
                setMenuContent(null);
            } else {
                console.error(`Server error: ${res.status} ${res.statusText}`);
            }
            return; // Stop execution if there's an error
        }

        const data = await res.json();

        // Ensure proper parsing
        const parsedMenu = typeof data.menu === "string" ? JSON.parse(data.menu) : data.menu;

        console.log('Fetched menu:', parsedMenu);
        setMenuContent(parsedMenu);

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

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streaming = true;

        let result = '';
        let tempResult = '';
        setMenuContent([]);

        while (streaming) {
            try {
                const { value, done } = await reader.read();
                if (done) {
                    streaming = false;
                }
                const chunk = decoder.decode(value, { stream: true })
                result += chunk;
                console.log('result: ', result)
                tempResult += chunk;

                let oneMeal = extractObjectFromLine(tempResult);
                if (oneMeal) {
                    try {
                        const jsonMenu = JSON.parse(oneMeal);
                        console.log(jsonMenu);
                        setMenuContent((prevData) => [...prevData, jsonMenu]);
                        tempResult = '';
                    } catch (error) {
                        console.error("Invalid JSON:", error);
                    }
                }
            } catch (streamError) {
                console.error("Error while reading stream:", streamError);
                streaming = false;
            }
        }

        try {
            const parsedResult = JSON.parse(result)
            if (res.ok) {
                console.log('type: ', typeof parsedResult === "object");
                console.log('parsedResult: ', parsedResult);

                if (parsedResult && typeof parsedResult === "object") {
                    console.log('Generated menu:', parsedResult);
                    await postMenuToDb(userProfile._id, result);
                } else {
                    throw new Error('Invalid JSON structure');
                }
            } else {
                throw new Error('Failed to generate menu');
            }
        } catch (error) {
            console.error('Error generating menu:', error);
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
    if (line.includes('{') && line.includes('}')) {
        return line.substring(line.indexOf('{'), line.lastIndexOf('}') + 1);
    }
    return null;
}