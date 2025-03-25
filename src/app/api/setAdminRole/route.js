import { NextResponse } from 'next/server';
import dbConnect from '../../../../_lib/dbConnect';
import User from '../../../../models/User';

export async function PATCH(req) {
    try {
        await dbConnect();

        const userId = '67dfa7ce1c9f2242f95277dc'; // Replace with the actual user ID
        const subscriptionType = 'admin'; // Hardcoded role

        const user = await User.findByIdAndUpdate(userId, { subscriptionType }, { new: true });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, subscriptionType: user.subscriptionType });
    } catch (error) {
        console.error('Error setting role:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
