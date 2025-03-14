// api/getPublicFeedback/route.js
import mongoose from 'mongoose';
import Feedback from '../../../../models/Feedback';

export async function GET(request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1; // Default to page 1
    const limit = parseInt(url.searchParams.get('limit')) || 10; // Default to 10 items
    const skip = (page - 1) * limit; // Calculate how many to skip

    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const totalFeedbacks = await Feedback.countDocuments(); // Total count for pagination info

    return new Response(
      JSON.stringify({
        feedbacks,
        total: totalFeedbacks,
        page,
        totalPages: Math.ceil(totalFeedbacks / limit),
      }),
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