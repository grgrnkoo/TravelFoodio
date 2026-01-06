import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { removeIngredient } from "../../../../_lib/supabase/queries/preferences";

export async function DELETE(req: Request) {
    try {
        const { userId: clerkUserId } = await auth();
        
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await ensureUserExists(clerkUserId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { ingredientName } = await req.json();
        
        if (!ingredientName) {
            return NextResponse.json({ error: 'Ingredient name is required' }, { status: 400 });
        }

        const success = await removeIngredient(user.id, ingredientName);

        if (!success) {
            return NextResponse.json({ error: 'Failed to remove ingredient' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error removing ingredient:', message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

