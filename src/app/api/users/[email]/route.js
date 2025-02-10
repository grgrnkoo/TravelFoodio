import User from '../../../../../models/User';
import dbConnect from '../../../../../_lib/dbConnect';
import { NextResponse } from 'next/server';


// function to search users by e-mail(unique value)

export async function GET(request, { params }) {
    const { email } = await params;
    console.log('Email: ', email);

    if (!email) {
        return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    try {
        // Request of user by E-Mail
        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        // Get the email and new data from the request
        await dbConnect();
        const email = await request.url.split('/').pop().trim();
        console.log('Email: ', email);
        console.log('Request: ', request.url.split('/').pop().trim());
        const updateData = await request.json();  // Get the fields to update from the request body

        // Find the user by email and update their data
        const updatedUser = await User.findOneAndUpdate(
            { email },  // Find user by email
            { $set: updateData },  // Use $set to update the user's fields with the new data
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Return the updated user information
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Failed to update user", error: error.message },
            { status: 500 }
        );
    }
}



// Update any given field with new data
export async function PATCH(req, { params }) {
    await dbConnect();

    try {
        const body = await req.json();
        const { key, value } = body;
        const { email } = params;

        console.log('Params: ', key, value, email);

        if (!email || !key || value === undefined) {
            return NextResponse.json({ message: "E-mail, key, and value are required" }, { status: 400 });
        }

        // Construct dynamic update object
        const update = { [key]: value };

        // Update the specific field in the user's preferences
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { $set: update },
            { new: true }
        );
        console.log('Updated user: ', updatedUser);

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
    } catch (error) {
        return NextResponse.json({ message: "Error updating user preference", error }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Allow all origins (not safe for production)
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}