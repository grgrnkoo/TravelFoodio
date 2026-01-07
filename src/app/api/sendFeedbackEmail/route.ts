// api/sendFeedbackEmail/route.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_MAIL);

export async function POST(request: Request) {
  try {
    // Get the feedback from the request body
    const { feedback, sender = 'not logged in' } = await request.json();

    if (!feedback || feedback.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Feedback must be at least 3 characters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'feedback@travelfoodio.com', // Replace with your verified domain
      to: 'grigorenko996@gmail.com',     // Replace with your receiving email
      subject: 'New Feedback Submission',
      html: `
        <h2>New Feedback Received</h2>
        <p>Author: ${sender}</p>
        <p>${feedback}</p>
      `,
    });

    return new Response(
      JSON.stringify({
        message: 'Feedback sent successfully',
        data
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending feedback email:', message);
    return new Response(
      JSON.stringify({
        error: 'Failed to send feedback',
        details: message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}