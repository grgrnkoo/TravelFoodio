import { Resend } from 'resend';
import { createFeedback } from '../../../../_lib/supabase/queries/feedback';

const resend = new Resend(process.env.RESEND_MAIL);

export async function POST(request: Request) {
  try {
    const { feedback, sender = 'Not logged in' } = await request.json();

    if (!feedback) {
      return new Response(JSON.stringify({ error: 'Feedback is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save to Supabase
    const savedFeedback = await createFeedback(feedback, sender);

    if (!savedFeedback) {
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing public feedback:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to process public feedback', details: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
