import { NextResponse } from "next/server";
import dbConnect from "../../../../_lib/dbConnect";
import Menu from "../../../../models/Menu";

export async function GET(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = new Date();
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const blankMenu = {
        userId: userId,
        menu: [],
        createdAt: null,
        _id: 0,
    }


    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        // const menu = await Menu.findOne({ userId }).sort({ createdAt: -1 });

        const existingMenu = await Menu.findOne({
            userId,
            createdAt: { $gte: dayStart, $lt: dayEnd },
        });

        console.log('Existing menu:', existingMenu)

        if (!existingMenu) {
            return NextResponse.json({...blankMenu, message: 'No menu found today!'}, { status: 200 });
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
