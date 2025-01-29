import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
});

export async function POST(req) {
    try {
        const { goals, age, location, dietaryRestrictions } = await req.json();
        const prompt = `Generate a personalized meal plan for 1 day based on these details:
    - Goals: ${goals}
    - Location: ${location}
    - Age: ${age}
    - Dietary Restrictions: ${dietaryRestrictions || "None"}
    
    Provide a structured JSON response with meal names, ingredients, and approximate calories.`;

        if (!goals || !location || !age) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7
        });

        const message = completion.choices[0].message.content;
        console.log(message);

        return new Response(JSON.stringify({ message }), { status: 200 });
    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500 }
        );
    }
}
