import { NextRequest, NextResponse } from "next/server"
import { upsertUserPreferences } from "../../../../../_lib/supabase/queries/preferences";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    console.log('[postOnboardingToDb] POST handler called');
    const { id } = await params;
    console.log('[postOnboardingToDb] User ID:', id);

    const requestBody = await req.json();
    console.log('[postOnboardingToDb] Request body received:', JSON.stringify(requestBody, null, 2));

    const {
        location,
        formattedDate,
        dateOfBirthday,
        goal,
        dietaryRestrictions,
        otherInfo,
        weight,
        height,
        medicalRecommendations
    } = requestBody;

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        // Validate required fields with specific error messages
        const missingFields: string[] = [];
        if (!location) missingFields.push('location');
        if (!formattedDate && !dateOfBirthday) missingFields.push('formattedDate or dateOfBirthday');
        if (!goal) missingFields.push('goal');
        if (!weight) missingFields.push('weight');
        if (!height) missingFields.push('height');

        if (missingFields.length > 0) {
            throw new Error(`Required data missing: ${missingFields.join(', ')}`);
        }

        // Use formattedDate or dateOfBirthday (whichever is provided)
        const dateValue = formattedDate || dateOfBirthday;

        console.log('[postOnboardingToDb] Parsed onboarding data:', {
            location,
            formattedDate,
            dateOfBirthday,
            dateValue,
            goal,
            dietaryRestrictions,
            otherInfo,
            weight,
            height,
            medicalRecommendations
        })

        // Parse date_of_birth from formattedDate or dateOfBirthday
        let dateOfBirth: Date | undefined;
        if (dateValue) {
            dateOfBirth = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        }
        console.log('[postOnboardingToDb] Parsed dateOfBirth:', dateOfBirth);

        // Update user preferences with onboarding data
        const preferencesData = {
            location,
            dateOfBirth,
            goals: goal,
            weight: weight,
            height: height,
            otherInfo: otherInfo || undefined,
            dietaryRestrictions: dietaryRestrictions || undefined,
            medicalRecommendations: medicalRecommendations || undefined,
        };
        console.log('[postOnboardingToDb] Calling upsertUserPreferences with:', JSON.stringify(preferencesData, null, 2));
        
        const preferences = await upsertUserPreferences(id, preferencesData);
        console.log('[postOnboardingToDb] upsertUserPreferences result:', preferences ? 'Success' : 'Failed', preferences);

        if (!preferences) {
            throw new Error('Error while saving preferences');
        }

        console.log('[postOnboardingToDb] POST handler completed successfully');
        return NextResponse.json({ success: true, message: 'User preferences saved successfully' });
    } catch (error) {
        console.error('[postOnboardingToDb] POST handler error:', error);
        if (error instanceof Error) {
            console.error('[postOnboardingToDb] Error message:', error.message);
            console.error('[postOnboardingToDb] Error stack:', error.stack);
            return NextResponse.json({ success: false, error: error.message });
        } else {
            console.error('[postOnboardingToDb] Unknown error type:', typeof error, error);
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    console.log('[postOnboardingToDb] PATCH handler called');
    const { id } = await params;
    console.log('[postOnboardingToDb] User ID:', id);

    const requestBody = await req.json();
    console.log('[postOnboardingToDb] Request body received:', JSON.stringify(requestBody, null, 2));

    const {
        location,
        formattedDate,
        dateOfBirthday,
        goal,
        dietaryRestrictions,
        otherInfo,
        weight,
        height,
        medicalRecommendations
    } = requestBody;

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        // Validate required fields with specific error messages
        const missingFields: string[] = [];
        if (!location) missingFields.push('location');
        if (!formattedDate && !dateOfBirthday) missingFields.push('formattedDate or dateOfBirthday');
        if (!goal) missingFields.push('goal');
        if (!weight) missingFields.push('weight');
        if (!height) missingFields.push('height');

        if (missingFields.length > 0) {
            throw new Error(`Required data missing: ${missingFields.join(', ')}`);
        }

        // Use formattedDate or dateOfBirthday (whichever is provided)
        const dateValue = formattedDate || dateOfBirthday;

        console.log('[postOnboardingToDb] Parsed onboarding data:', {
            location,
            formattedDate,
            dateOfBirthday,
            dateValue,
            goal,
            dietaryRestrictions,
            otherInfo,
            weight,
            height,
            medicalRecommendations
        })

        // Parse date_of_birth from formattedDate or dateOfBirthday
        let dateOfBirth: Date | undefined;
        if (dateValue) {
            dateOfBirth = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        }
        console.log('[postOnboardingToDb] Parsed dateOfBirth:', dateOfBirth);

        // Update user preferences with onboarding data
        const preferencesData = {
            location,
            dateOfBirth,
            goals: goal,
            weight: weight,
            height: height,
            otherInfo: otherInfo || undefined,
            dietaryRestrictions: dietaryRestrictions || undefined,
            medicalRecommendations: medicalRecommendations || undefined,
        };
        console.log('[postOnboardingToDb] Calling upsertUserPreferences with:', JSON.stringify(preferencesData, null, 2));
        
        const preferences = await upsertUserPreferences(id, preferencesData);
        console.log('[postOnboardingToDb] upsertUserPreferences result:', preferences ? 'Success' : 'Failed', preferences);

        if (!preferences) {
            throw new Error('Error while saving preferences');
        }

        console.log('[postOnboardingToDb] PATCH handler completed successfully');
        return NextResponse.json({ success: true, message: 'User preferences saved successfully' });
    } catch (error) {
        console.error('[postOnboardingToDb] PATCH handler error:', error);
        if (error instanceof Error) {
            console.error('[postOnboardingToDb] Error message:', error.message);
            console.error('[postOnboardingToDb] Error stack:', error.stack);
            return NextResponse.json({ success: false, error: error.message });
        } else {
            console.error('[postOnboardingToDb] Unknown error type:', typeof error, error);
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}
