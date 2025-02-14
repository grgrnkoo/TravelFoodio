import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

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

Return a structured JSON array of meal objects **without additional keys**. Each object should follow this structure:
\`\`\`json
[
  {
    "name": "Dish Name",
    "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    "cuisine": "Mediterranean"
    "fats": 10,
    "carbs": 40,
    "protein": 15,
    "calories": 350
  },
]
\`\`\`
Ensure **no extra text** or keys are present in the response, just a **pure JSON array**.

⚠️ **Important:** The "meal" field should contain only the **dish name** (e.g., "Chickenburger with cheese" or "Vietnamese Pho"). **Do not include meal categories** like "Breakfast," "Lunch," or "Dinner."
Generate a different menu each time with unique meals. Do not repeat previous meals. Ensure variety in cuisines, ingredients, and nutrition.`;



        if (!goals || !location || !age) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
            stream: true
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ''));
                }
                controller.close();
            }
        })

        return new Response(stream, { status: 200 });
    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500 }
        );
    }
}
