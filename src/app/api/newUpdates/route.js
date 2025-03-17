import { NextResponse } from 'next/server';
import dbConnect from '../../../../_lib/dbConnect';
import User from '../../../../models/User';

export async function PATCH(req) {
  try {
    await dbConnect();
    const { userId, updates } = await req.json();

    // Validate input
    if (!userId || typeof updates !== 'number' || updates < 0 || !Number.isInteger(updates)) {
      return NextResponse.json(
        { error: 'Invalid input: userId is required, and updates must be a non-negative integer' },
        { status: 400 }
      );
    }

    // Update user in a single query
    const user = await User.findByIdAndUpdate(
      userId,
      { updatesRemaining: updates },
      { new: true } // Return updated document
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatesRemaining: user.updatesRemaining });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
