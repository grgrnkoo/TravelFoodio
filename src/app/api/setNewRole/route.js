import { NextResponse } from 'next/server';
import dbConnect from '../../../../_lib/dbConnect';
import User from '../../../../models/User';

export async function PATCH(req) {
  try {
    await dbConnect();

    const { userId, subscriptionType } = await req.json();

    if (!userId || !subscriptionType) {
      return NextResponse.json({ error: 'User ID and subscription type are required' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { subscriptionType },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscriptionType: user.subscriptionType });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
