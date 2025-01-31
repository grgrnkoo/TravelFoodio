import { NextResponse } from "next/server";
import dbConnect from "../../../../_lib/dbConnect";
import Menu from "../../../../models/Menu";

export async function GET(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    console.log('Search Params: ', searchParams)

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const menu = await Menu.findOne({ userId }).sort({ createdAt: -1 });

        if (!menu) {
            return NextResponse.json({ message: "No menu found" }, { status: 404 });
        }

        return NextResponse.json(menu, { status: 200 });
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
