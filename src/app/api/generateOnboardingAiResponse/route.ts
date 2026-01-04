import { NextRequest, NextResponse } from 'next/server';
import { generateOnboardingAiResponse } from '../../../../_lib/generateOnboardingAiResponse';

// Named export for the POST method
export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const props = await req.json();
        console.log('Received props:', props);

        // Call the service function to generate the AI response
        const response = await generateOnboardingAiResponse(props);
        console.log('response in route: ', response)

        // Return the response from the service
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        // Narrow the type of error
        if (error instanceof Error) {
            console.error('Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('Unknown error occurred');
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
        }
    }
}