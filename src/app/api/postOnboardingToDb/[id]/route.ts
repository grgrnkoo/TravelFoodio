import { NextRequest, NextResponse } from "next/server"
import { upsertUserPreferences } from "../../../../../_lib/supabase/queries/preferences";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const {
        location,
        formattedDate,
        goal,
        dietaryRestrictions,
        otherInfo,
        weight,
        height,
        medicalRecommendations
    } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!location || !formattedDate || !goal || !weight || !height) {
            throw new Error('Required data missing')
        }

        console.log('Onboarding data: ', location, formattedDate, goal, dietaryRestrictions, otherInfo, weight, height)

        // Parse date_of_birth from formattedDate
        let dateOfBirth: Date | undefined;
        if (formattedDate) {
            dateOfBirth = typeof formattedDate === 'string' ? new Date(formattedDate) : formattedDate;
        }

        // Update user preferences with onboarding data
        const preferences = await upsertUserPreferences(id, {
            location,
            dateOfBirth,
            goals: goal,
            dietaryRestrictions: dietaryRestrictions || undefined,
            medicalRecommendations: medicalRecommendations || undefined,
        });

        if (!preferences) {
            throw new Error('Error while saving preferences');
        }

        return NextResponse.json({ success: true, message: 'User preferences saved successfully' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const {
        location,
        formattedDate,
        goal,
        dietaryRestrictions,
        otherInfo,
        weight,
        height,
        medicalRecommendations
    } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!location || !formattedDate || !goal || !weight || !height) {
            throw new Error('Required data missing')
        }

        console.log('Updating onboarding data: ', location, formattedDate, goal, dietaryRestrictions, otherInfo, weight, height)

        // Parse date_of_birth from formattedDate
        let dateOfBirth: Date | undefined;
        if (formattedDate) {
            dateOfBirth = typeof formattedDate === 'string' ? new Date(formattedDate) : formattedDate;
        }

        // Update user preferences with onboarding data
        const preferences = await upsertUserPreferences(id, {
            location,
            dateOfBirth,
            goals: goal,
            dietaryRestrictions: dietaryRestrictions || undefined,
            medicalRecommendations: medicalRecommendations || undefined,
        });

        if (!preferences) {
            throw new Error('Error while saving preferences');
        }

        return NextResponse.json({ success: true, message: 'User preferences saved successfully' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}
