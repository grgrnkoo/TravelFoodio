import { AIReplyFormatted, UserOnboardingFormatted } from "../_lib/interfaces";
import { User } from "../_lib/interfaces";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function addUsersName(userFromSession: User | null) {
    if (!userFromSession) {
        console.error('No user provided')
        return { status: 500, message: 'No user provided' }
    }

    if (!userFromSession?.name) {
        console.error('No name provided')
        return { status: 500, message: 'No user name provided' }
    }

    if (!userFromSession?.id) {
        console.error('No ID provided')
        return { status: 500, message: 'No user ID provided' }
    }

    try {
        const res = await fetch(`${baseUrl}/api/patchName/${userFromSession.id?.toString()}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: userFromSession.name })
        })
        if (!res.ok) {
            throw new Error('Error saving preferences')
        }

        return { status: 200, message: 'Preferences saved' }
    } catch (error) {
        if (error instanceof Error) {
            return { status: 500, message: error.message }
        } else {
            return { status: 500, message: 'Unknown error in addUsersName' }
        }
    }
}

export async function saveUserPreferencesToDb(props: UserOnboardingFormatted, userFromSession: User | null, method: 'POST' | 'PATCH') {
    if (!userFromSession) {
        console.error('No user provided')
        throw new Error('No user provided. Log in and try again');
    }

    if (!userFromSession.id) {
        console.error('No ID provided')
        throw new Error('No ID provided. Nothing to update');
    }

    // Simulate saving user preferences to the database
    try {
        console.log("props provided: ", props)

        const res = await fetch(`${baseUrl}/api/postOnboardingToDb/${userFromSession.id?.toString()}`, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(props)
        })
        if (!res.ok) {
            throw new Error('Error saving preferences')
        }

        console.log('Preferences saved successfully')

        return { status: 200, message: 'Preferences saved' }
    } catch (error) {
        if (error instanceof Error) {
            return { status: 500, message: error.message }
        } else {
            return { status: 500, message: 'Unknown error in saveUserPreferencesToDb' }
        }
    }
}

interface FinaliseOnboardingProps {
    userFromSession: User | null,
    formattedUserData: UserOnboardingFormatted
}

export async function finaliseOnboarding({ userFromSession, formattedUserData }: FinaliseOnboardingProps) {
    if (!userFromSession) {
        console.error('No user email provided')
        return {
            success: false,
            message: 'No user email provided'
        }
    }

    const openAiResponse = await fetch(`${baseUrl}/api/generateOnboardingAiResponse`, {
        body: JSON.stringify(formattedUserData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (!openAiResponse.ok) {
        throw new Error('Error generating suggestions');
    }

    const aiResponse = await openAiResponse.json();
    return { status: 200, message: aiResponse.message };
}

export async function setOnboardingProp(userFromSession: User | null, onboardingStep: string) {
    if (!userFromSession) {
        console.error('No user provided')
        throw new Error('No user provided. Log in and try again');
    }

    if (!userFromSession.id) {
        console.error('No ID provided')
        throw new Error('No ID provided. Nothing to update');
    }

    const res = await fetch(`${baseUrl}/api/setOnboardingFlag/${userFromSession.id?.toString()}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: onboardingStep
    })
    if (!res.ok) {
        throw new Error('Error saving preferences')
    }
    return { status: 200, message: 'Flag updated' }
}

export async function fetchPreferences(id: string) {
    const res = await fetch(`${baseUrl}/api/fetchPreferences/${id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (!res.ok) {
        throw new Error(`Failed to fetch preferences. Status: ${res.status}`);
    }

    const data = await res.json();
    console.log('res: ', data.data)
    return { status: 200, data: data.data, message: 'User preferences fetched successfully'}
}

export async function saveAiResponseToDb(props: AIReplyFormatted, user: User | null) {
    if (!user) {
        console.error('No user provided')
        throw new Error('No user provided. Log in and try again');
    }

    if (!user.id) {
        console.error('No ID provided')
        throw new Error('No ID provided. Nothing to update');
    }

    try {
        const res = await fetch(`${baseUrl}/api/postAiResponseToDb/${user.id?.toString()}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(props)
        })
        if (!res.ok) {
            throw new Error('Error saving preferences')
        }

        return { status: 200, message: 'Preferences saved' }
    } catch (error) {
        if (error instanceof Error) {
            return { status: 500, message: error.message }
        } else {
            return { status: 500, message: 'Unknown error in saveAiResponseToDb' }
        }
    }
}
