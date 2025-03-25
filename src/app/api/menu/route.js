import { NextResponse } from "next/server";
import dbConnect from "../../../../_lib/dbConnect";
import Menu from "../../../../models/Menu";

export async function GET(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateParam = searchParams.get("date");

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const baseDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(baseDate)) {
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
    }

    const dayStart = new Date(baseDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(baseDate.setHours(23, 59, 59, 999));

    const blankMenu = {
        userId,
        menu: [],
        createdAt: null,
        _id: 0,
    };

    try {
        const existingMenu = await Menu.findOne({
            userId,
            createdAt: { $gte: dayStart, $lt: dayEnd },
        });

        if (!existingMenu) {
            return NextResponse.json({ ...blankMenu, message: 'No menu found for that date!' }, { status: 200 });
        }

        return NextResponse.json(existingMenu, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching menu", error }, { status: 500 });
    }
}


export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const { userId, menu } = body;

        if (!userId || !menu) {
            return NextResponse.json({ message: "User ID and menu data are required" }, { status: 400 });
        }

        // Check if a menu already exists for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const existingMenu = await Menu.findOne({
            userId,
            createdAt: { $gte: todayStart },
        });

        if (existingMenu) {
            return NextResponse.json({ message: "Menu already exists for today" }, { status: 409 });
        }

        // Create a new menu
        const newMenu = await Menu.create({
            userId,
            menu,
            createdAt: new Date(),
        });

        return NextResponse.json(newMenu, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error saving menu", error }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId');
    const todayStart = new Date().setHours(0, 0, 0, 0);

    try {
        const result = await Menu.deleteOne({
            userId,
            createdAt: { $gte: todayStart },
        });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'No menu found to delete' }, { status: 200 });
        }
        return NextResponse.json({ message: 'Menu deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting menu:', error);
        return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 });
    }
}