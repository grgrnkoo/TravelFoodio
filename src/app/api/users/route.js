import dbConnect from "../../../../_lib/dbConnect";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function POST(request) {

    try {
        await dbConnect();
        const { email } = await request.json();
        const newUser = new User({ email });
        await newUser.save();

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.log(error);
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        console.log('Request:', request);
        const users = await User.find();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Failed to fetch users", error: error.message },
            { status: 500 }
        );
    }
}