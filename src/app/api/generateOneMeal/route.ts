import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getMealGenerationCount, recordMealGeneration } from "../../../../_lib/supabase/queries/mealGenerations";
import { saveSingleMeal } from "../../../../_lib/supabase/queries/singleMeals";

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
        
        const { promptValue, professionalMode } = body;
        if (!promptValue) {
            console.error("[generateOneMeal] No promptValue in request");
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }
        
        console.log("[generateOneMeal] Generating meal with prompt:", promptValue);
        console.log("[generateOneMeal] Professional mode:", professionalMode);

        // Check daily limit for professional mode (user page)
        if (professionalMode) {
            const authData = await auth();
            if (!authData.userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const user = await ensureUserExists(authData.userId);
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const today = new Date().toISOString().split('T')[0];
            const generationCount = await getMealGenerationCount(user.id, today);

            if (generationCount >= 10) {
                return NextResponse.json(
                    { error: "Daily limit reached. You can generate up to 10 meals per day." },
                    { status: 429 }
                );
            }
        }

        const systemPrompt = professionalMode
            ? `
        You are a professional meal generator. Your job is to create realistic, practical meal suggestions based on user input.
        
        You return **only a valid JSON object** in this format:
        
        {
          "name": "Dish Name",
          "ingredients": ["Ingredient 1", "Ingredient 2"],
          "cuisine": "Cuisine Type",
          "fats": 10,
          "carbs": 40,
          "protein": 15,
          "calories": 350,
          "weight": 350
        }
        
        Rules:
        - Generate practical, realistic meals based on the user's input.
        - Use common, accessible ingredients.
        - Provide accurate nutritional information.
        - Include 'weight' field representing the portion size in grams for accurate nutrition tracking (typically 200-500g for meals).
        - Do NOT copy the example or explain yourself.
        - Return only valid JSON, no extra text.
        `
            : `
        You are a slightly chaotic, playful meal generator. Your job is to turn any user prompt—no matter how weird, vague, or cursed—into a totally real and unique meal idea.
        
        You return **only a valid JSON object** in this format:
        
        {
          "name": "Dish Name",
          "ingredients": ["Ingredient 1", "Ingredient 2"],
          "cuisine": "Cuisine Type",
          "fats": 10,
          "carbs": 40,
          "protein": 15,
          "calories": 350,
          "weight": 350
        }
        
        Rules:
        - If the input makes no sense, just own it. Turn it into a surprisingly good dish.
        - Include 'weight' field representing the portion size in grams for accurate nutrition tracking (typically 200-500g for meals).
        - Do NOT copy the example or explain yourself.
        - Make it believable, but fun.
        - The JSON should look like it belongs in a cookbook, even if the prompt is a disaster.
        `;

        const userPrompt = `User input: ${promptValue}`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];

        const temperature = professionalMode ? 0.3 : 0.7;

        console.log("[generateOneMeal] Calling OpenAI API...");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as any,
            temperature: temperature,
        });

        console.log("[generateOneMeal] OpenAI API responded successfully");
        const meal = response.choices[0]?.message?.content || '{}';
        console.log("[generateOneMeal] Generated meal response:", meal);
        
        try {
            const parsedMeal = JSON.parse(meal);
            console.log("[generateOneMeal] Successfully parsed meal:", parsedMeal);
            
            // Record the generation for professional mode (user page)
            if (professionalMode) {
                const authData = await auth();
                if (authData.userId) {
                    const user = await ensureUserExists(authData.userId);
                    if (user) {
                        await recordMealGeneration(user.id);
                        
                        // Save the meal to single_meals table
                        try {
                            await saveSingleMeal(user.id, {
                                name: parsedMeal.name || '',
                                calories: parsedMeal.calories,
                                protein: parsedMeal.protein,
                                fats: parsedMeal.fats,
                                carbs: parsedMeal.carbs,
                                weight: parsedMeal.weight,
                                cuisine: parsedMeal.cuisine,
                                ingredients: parsedMeal.ingredients || [],
                                source: 'prompt',
                            });
                            console.log("[generateOneMeal] Meal saved to single_meals table");
                        } catch (saveError) {
                            console.error("[generateOneMeal] Error saving meal to database:", saveError);
                            // Continue even if save fails - don't break the user experience
                        }
                    }
                }
            }
            
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
        
        // Log error to database
        try {
            const { logErrorFromRequest } = await import('../../../../_lib/errorLogger');
            await logErrorFromRequest(
                error instanceof Error ? error : new Error(message),
                req,
                undefined
            );
        } catch (logErr) {
            console.error('Failed to log error:', logErr);
        }
        
        return NextResponse.json({ 
            error: "Failed to generate meal", 
            details: message 
        }, { status: 500 });
    }
}
