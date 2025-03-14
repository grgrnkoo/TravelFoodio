import mongoose from 'mongoose';
import Feedback from '../../../../models/Feedback';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Newest first
    return new Response(
      JSON.stringify(feedbacks),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch feedback', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}