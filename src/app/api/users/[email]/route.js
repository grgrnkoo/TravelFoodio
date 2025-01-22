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
