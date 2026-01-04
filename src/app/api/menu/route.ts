import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../_lib/supabase/server";
import { getMenuByDate, createMenu, deleteTodaysMenu, menuExistsForToday } from "../../../../_lib/supabase/queries/menus";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateParam = searchParams.get("date");

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const baseDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(baseDate.getTime())) {
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
    }

    const blankMenu = {
        userId,
        menu: [],
        createdAt: null,
        _id: null,
    };

    try {
        const menu = await getMenuByDate(userId, baseDate);

        if (!menu) {
            return NextResponse.json({ ...blankMenu, message: 'No menu found for that date!' }, { status: 200 });
        }

        return NextResponse.json({
            _id: menu.id,
            userId,
            menu: menu.meals,
            createdAt: menu.createdAt,
        }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching menu:', message);
        return NextResponse.json({ message: "Error fetching menu", error: message }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, menu } = body;

        if (!userId || !menu) {
            return NextResponse.json({ message: "User ID and menu data are required" }, { status: 400 });
        }

        // Check if a menu already exists for today
        const exists = await menuExistsForToday(userId);
        if (exists) {
            return NextResponse.json({ message: "Menu already exists for today" }, { status: 409 });
        }

        // Parse menu if it's a string
        const mealsData = typeof menu === 'string' ? JSON.parse(menu) : menu;

        // Create a new menu
        const newMenu = await createMenu(userId, mealsData);

        if (!newMenu) {
            return NextResponse.json({ message: "Failed to create menu" }, { status: 500 });
        }

        return NextResponse.json({
            _id: newMenu.id,
            userId,
            menu: newMenu.meals,
            createdAt: newMenu.createdAt,
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving menu:', message);
        return NextResponse.json({ message: "Error saving menu", error: message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const deleted = await deleteTodaysMenu(userId);
        
        if (!deleted) {
            return NextResponse.json({ message: 'No menu found to delete or error occurred' }, { status: 200 });
        }
        
        return NextResponse.json({ message: 'Menu deleted' }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error deleting menu:', message);
        return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 });
    }
}
