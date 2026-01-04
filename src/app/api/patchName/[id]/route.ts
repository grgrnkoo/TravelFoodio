import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { name } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!name) {
            throw new Error('Required data missing')
        }

        console.log('Updating name:', name)

        const supabase = getSupabaseServerClient();

        const { data, error } = await supabase
            .from('users')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            throw new Error('Error adding name');
        }

        return NextResponse.json({ status: 200, message: 'Name added successfully' })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message });
        } else {
            return NextResponse.json({ error: 'An unknown error occurred' });
        }
    }
}
