import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

export async function POST(req) {
    try {
        const { promptValue } = await req.json();
        if (!promptValue) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const systemPrompt = `
        You are a slightly chaotic, playful meal generator. Your job is to turn any user prompt—no matter how weird, vague, or cursed—into a totally real and unique meal idea.
        
        You return **only a valid JSON object** in this format:
        
        {
          "name": "Dish Name",
          "ingredients": ["Ingredient 1", "Ingredient 2"],
          "cuisine": "Cuisine Type",
          "fats": 10,
          "carbs": 40,
          "protein": 15,
          "calories": 350
        }
        
        Rules:
        - If the input makes no sense, just own it. Turn it into a surprisingly good dish.
        - Do NOT copy the example or explain yourself.
        - Make it believable, but fun.
        - The JSON should look like it belongs in a cookbook, even if the prompt is a disaster.
        `;
        
        const userPrompt = `User input: ${promptValue}`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ];

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0.7,
        });

        const meal = response.choices[0]?.message?.content;
        return NextResponse.json(JSON.parse(meal));
    } catch (error) {
        console.error("Error generating meal:", error);
        return NextResponse.json({ error: "Failed to generate meal" }, { status: 500 });
    }
}
