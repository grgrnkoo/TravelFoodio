import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

export async function POST(req) {
    try {
        const { promptValue } = await req.json();
        if (!promptValue) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const fullPrompt = `Generate a single meal with a detailed JSON output for user. 
        The response must follow this example format. You should use this as a reference but not copy it. If a prompt doesn't make any sense, just generate some random meal. Example:
    {
            "name": "Dish Name",
            "ingredients": ["Ingredient 1", "Ingredient 2"],
            "cuisine": "Mediterranean",
            "fats": 10,
            "carbs": 40,
            "protein": 15,
            "calories": 350
          }
    
    User prompt input:
    ${promptValue}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: fullPrompt }],
            temperature: 0.7,
        });

        const meal = response.choices[0]?.message?.content;
        return NextResponse.json(JSON.parse(meal));
    } catch (error) {
        console.error("Error generating meal:", error);
        return NextResponse.json({ error: "Failed to generate meal" }, { status: 500 });
    }
}
