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
    // Fetch the whole DB
    try {
        await dbConnect();
        const { email, ...updateFields } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            updateFields,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        };

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Failed to update users", error: error.message },
            { status: 500 }
        );
    }
}