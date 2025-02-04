export async function updateUserByEmail(email, key, value) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log(baseUrl);

    try {
        console.log('function received data:', email, key, value);
        const response = await fetch(`${baseUrl}/api/users/${email}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Extract error details
            console.error("Error sending update request:", errorData);
            return { success: false, error: errorData };
        }

        console.log("Request sent successfully");
        return { success: true };
    } catch (error) {
        console.error("Error in update user function:", error);
        return { success: false, error };
    }
}