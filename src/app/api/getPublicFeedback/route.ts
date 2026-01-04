import { getFeedbackPaginated } from '../../../../_lib/supabase/queries/feedback';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 10;

    const result = await getFeedbackPaginated(page, limit);

    return new Response(
      JSON.stringify({
        feedbacks: result.feedbacks,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching public feedback:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch feedback', details: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
