import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const {
        location,
        formattedDate,
        goal,
        dietaryRestrictions,
        otherInfo,
        weight,
        height
    } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!location || !formattedDate || !goal || !weight || !height) {
            throw new Error('Required data missing')
        }

        console.log('Onboarding data: ', location, formattedDate, goal, dietaryRestrictions, otherInfo, weight, height)

        const supabase = getSupabaseServerClient();

        // Update user with onboarding data
        const { data, error } = await supabase
            .from('users')
            .update({
                location,
                goals: goal,
                dietary_restrictions: dietaryRestrictions || null,
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Error while saving data');
        }

        return NextResponse.json({ success: true, message: 'User data saved successfully' });
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
        height
    } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!location || !formattedDate || !goal || !weight || !height) {
            throw new Error('Required data missing')
        }

        console.log('Updating onboarding data: ', location, formattedDate, goal, dietaryRestrictions, otherInfo, weight, height)

        const supabase = getSupabaseServerClient();

        // Update user with onboarding data
        const { data, error } = await supabase
            .from('users')
            .update({
                location,
                goals: goal,
                dietary_restrictions: dietaryRestrictions || null,
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Error while saving data');
        }

        return NextResponse.json({ success: true, message: 'User data saved successfully' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}
