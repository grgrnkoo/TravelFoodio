import { Resend } from 'resend';
import mongoose from 'mongoose';
import Feedback from '../../../../models/Feedback';

const resend = new Resend(process.env.RESEND_MAIL);

export async function POST(request) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    const { feedback, sender = 'Not logged in' } = await request.json();

    if (!feedback) {
      return new Response(JSON.stringify({ error: 'Feedback is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save to MongoDB
    const feedbackDoc = new Feedback({ feedback, author: sender });
    await feedbackDoc.save();

    // Send email
    const data = await resend.emails.send({
      from: 'feedback@foodsm.art',
      to: 'grigorenko996@gmail.com',
      subject: 'New Public Feedback Submission',
      html: `<h2>New Public Feedback Received</h2>
      <p>Author: ${sender}</p>
      <p>${feedback}</p>`,
    });

    return new Response(
      JSON.stringify({ message: 'Public feedback sent and saved successfully', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing public feedback:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process public feedback', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}