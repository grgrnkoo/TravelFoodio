import User from "../../../../../models/User";
import dbConnect from "../../../../../_lib/dbConnect";
import { NextResponse } from "next/server";

// Function to search users by email (unique value)
export async function GET(request, { params }) {
    const { email } = await params; // Extract email properly
    console.log("Email: ", email);

    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

// Function to update user data
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { email } = params; // Extract email properly
        const updateData = await request.json();

        if (!email || !updateData) {
            return NextResponse.json({ message: "Email and update data are required" }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating user:", error);
        return NextResponse.json(
            { message: "Failed to update user", error: error.message },
            { status: 500 }
        );
    }
}

// Function to update a specific field in user data
export async function PATCH(req, { params }) {
    await dbConnect();

    try {
        const body = await req.json();
        const { key, value } = body;
        const { email } = params;

        if (!email || !key || value === undefined || value === null) {
            console.error("❌ Missing required fields:", { email, key, value });
            return NextResponse.json({ message: "E-mail, key, and value are required" }, { status: 400 });
        }

        console.log("🔄 Updating:", { email, key, value });

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { [key]: value } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating user:", error);
        return NextResponse.json({ message: "Error updating user preference", error: error.message }, { status: 500 });
    }
}

// Handle CORS Preflight Requests
export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_API_URL || "*", // Restrict CORS to your frontend
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}