import { IUser, PopupType, ApiResponse } from '../types';

export async function getUserByEmail(email: string): Promise<IUser | null> {
    console.log('db fetch triggered');
    if (!email) {
        console.log("No email provided to getUserByEmail");
        return null;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const apiUrl = `${baseUrl}/api/users/${email}`;

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Fetch failed with status: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
}

export async function getUserByClerkId(clerkUserId: string): Promise<IUser | null> {
    console.log('[getUserByClerkId] 🔍 Fetch triggered for clerkUserId:', clerkUserId);
    
    if (!clerkUserId) {
        console.log("[getUserByClerkId] ⚠️ No clerkUserId provided");
        return null;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const apiUrl = `${baseUrl}/api/users/clerk/${clerkUserId}`;
    console.log('[getUserByClerkId] 📡 Request URL:', apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log('[getUserByClerkId] 📥 Response status:', response.status, response.statusText);

        // 404 is a valid case - user simply doesn't exist yet
        if (response.status === 404) {
            console.log('[getUserByClerkId] ℹ️ User not found (404) - this is expected for new users');
            return null;
        }

        // Handle other non-OK responses as actual errors
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[getUserByClerkId] ❌ Request failed with status: ${response.status}`);
            console.error(`[getUserByClerkId] ❌ Error response:`, errorText.substring(0, 200));
            return null;
        }

        const data = await response.json();
        console.log('[getUserByClerkId] ✅ User found successfully');
        return data;
    } catch (error) {
        console.error("[getUserByClerkId] ❌ Network/parsing error:", error);
        if (error instanceof SyntaxError) {
            console.error("[getUserByClerkId] ❌ Likely received HTML instead of JSON - check middleware configuration");
        }
        return null;
    }
}

interface UpdateFunction {
    (data: Record<string, unknown>): Promise<void>;
}

interface Router {
    push: (path: string) => void;
}

export async function addDataFromReply(
    email: string,
    data: Record<string, unknown>,
    showPopup: (message: string, type?: PopupType) => void,
    update: UpdateFunction,
    router: Router
): Promise<boolean | null> {
    console.log('add data triggered');
    if (!email || !data) {
        console.error('Invalid email or data:', email, data);
        return null;
    }

    console.log('Function email and data: ', email, data);

    const updatedData = {
        ...data,
        onboarding2Completed: true
    };

    try {
        const response = await fetch(`/api/users/${email}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const responseData = await response.json();

        if (response.ok) {
            await update({
                onboarding2Completed: true
            });
            router.push(`/user`);
            console.log('Token updated');
            return true;
        } else {
            console.error('Failed to update user:', responseData);
            return false;
        }
    } catch (error) {
        console.error('Error: ', error);
        return null;
    }
}

export const sendFeedback = async (
    feedbackText: string,
    sender: string | null,
    showPopup: (message: string, type?: PopupType) => void,
    setTextareaValue: (value: string) => void,
    isPublic: boolean
): Promise<ApiResponse<{ success: boolean }>> => {
    const endpoint = isPublic ? '/api/sendFeedbackPublic' : '/api/sendFeedbackEmail';
    const safeSender = sender ?? 'Not logged in';
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback: feedbackText, sender: safeSender }),
        });

        const data = await response.json();
        if (!response.ok) {
            showPopup('Error sending feedback! Try again', 'error');
            throw new Error(data.error);
        }
        setTextareaValue('');
        showPopup('Feedback sent! Thanks <3', 'success');
        return { success: true, data };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showPopup(message, 'error');
        console.error('Error:', message);
        return { success: false, error: message };
    }
};

export function getInAppBrowserInfo(): {
    isInstagram: boolean;
    isTikTok: boolean;
    isInAppBrowser: boolean;
} {
    const ua = navigator.userAgent || navigator.vendor || "";

    const isInstagram = ua.includes("Instagram");
    const isTikTok = ua.includes("TikTok");

    return {
        isInstagram,
        isTikTok,
        isInAppBrowser: isInstagram || isTikTok,
    };
}
