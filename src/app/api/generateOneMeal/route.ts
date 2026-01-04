import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

export async function POST(req: Request) {
    console.log("[generateOneMeal] API route called");
    
    try {
        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API) {
            console.error("[generateOneMeal] OPENAI_API key is not configured");
            return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
        }

        console.log("[generateOneMeal] OpenAI API key is configured");

        const body = await req.json();
        console.log("[generateOneMeal] Request body:", body);
        
        const { promptValue } = body;
        if (!promptValue) {
            console.error("[generateOneMeal] No promptValue in request");
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }
        
        console.log("[generateOneMeal] Generating meal with prompt:", promptValue);

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

        console.log("[generateOneMeal] Calling OpenAI API...");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as any,
            temperature: 0.7,
        });

        console.log("[generateOneMeal] OpenAI API responded successfully");
        const meal = response.choices[0]?.message?.content || '{}';
        console.log("[generateOneMeal] Generated meal response:", meal);
        
        try {
            const parsedMeal = JSON.parse(meal);
            console.log("[generateOneMeal] Successfully parsed meal:", parsedMeal);
            return NextResponse.json(parsedMeal);
        } catch (parseError) {
            console.error("[generateOneMeal] Failed to parse meal JSON:", meal);
            console.error("[generateOneMeal] Parse error:", parseError);
            return NextResponse.json({ 
                error: "Invalid meal format received from AI", 
                raw: meal 
            }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        console.error("[generateOneMeal] Error generating meal:", message);
        console.error("[generateOneMeal] Stack trace:", stack);
        return NextResponse.json({ 
            error: "Failed to generate meal", 
            details: message 
        }, { status: 500 });
    }
}
