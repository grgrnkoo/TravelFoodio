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

Return a structured JSON array of meal objects **without additional keys**. Each object should follow this structure:
\`\`\`json
[
  {
    "meal": "Meal Name",
    "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    "fats": "~10g",
    "carbs": "~40g",
    "protein": "~15g",
    "calories": "350 kcal"
  },
  {
    "meal": "Another Meal",
    "ingredients": ["Ingredient A", "Ingredient B"],
    "fats": "~5g",
    "carbs": "~10g",
    "protein": "~20g",
    "calories": "500 kcal"
  }
]
\`\`\`
Ensure **no extra text** or keys are present in the response, just a **pure JSON array**.`;

        

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
