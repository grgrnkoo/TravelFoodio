import { NextResponse } from 'next/server';

import {
    getTopFavoriteMeals,
    getTopDislikedMeals,
    getTopIngredients,
    getBottomIngredients,
    getTopCuisines,
    getBottomCuisines
} from '../../../../_lib/usersActions';
import { getFullUserProfileForGeneration } from '../../../../_lib/supabase/queries';
import { logErrorFromRequest } from '../../../../_lib/errorLogger';

// const DEEPSEEK_API = process.env.DEEPSEEK_API; // Ensure this is set in your environment variables
// const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Replace with the actual DeepSeek API URL

// export async function POST(req: Request) {
//     try {
//         const { userProfile } = await req.json();
//         console.log('Prompt triggered', userProfile);

// //         const prompt = `Generate a personalized meal plan for 1 day based on:
// // - Goals: ${userProfile.goals}
// // - Location: ${userProfile.location}
// // - Age: ${userProfile.age}
// // - Dietary Restrictions: ${userProfile.dietaryRestrictions || "None"}
// // - Favorite Meals (latest 5): ${JSON.stringify(getTopFavoriteMeals(userProfile)) || "None"}
// // - Disliked Meals (latest 5): ${JSON.stringify(getTopDislikedMeals(userProfile)) || "None"}
// // - Preferred Ingredients (top 5): ${JSON.stringify(getTopIngredients(userProfile)) || "None"}
// // - Avoided Ingredients (bottom 5): ${JSON.stringify(getBottomIngredients(userProfile)) || "None"}
// // - Preferred Cuisines (top 5): ${JSON.stringify(getTopCuisines(userProfile)) || "None"}
// // - Avoided Cuisines (bottom 5): ${JSON.stringify(getBottomCuisines(userProfile)) || "None"}

// // Return a JSON array of 3-5 meal objects—no extra keys or text. Use Favorite Meals, Preferred Ingredients, and Cuisines as inspiration—blend in ~50% unique meals not listed in favorites. Avoid Disliked Meals, Avoided Ingredients, and Cuisines completely. Ensure variety, no repeats.
// // Only JSON output. No comments

// // Example output:
// // \`\`\`json
// // [
// //   {
// //     "name": "Grilled Salmon",
// //     "ingredients": ["salmon", "lemon", "olive oil"],
// //     "cuisine": "Mediterranean",
// //     "fats": 20,
// //     "carbs": 5,
// //     "protein": 25,
// //     "calories": 300
// //   },
// // ]
// // \`\`\``;

//         const prompt = `Generate a personalized meal plan for 1 day based on:
//         - Goals: ${userProfile.goals}
//         - Location: ${userProfile.location}
//         - Age: ${userProfile.age}
//         - Dietary Restrictions: ${userProfile.dietaryRestrictions || "None"}
//         - Favorite Meals (latest 5): ${JSON.stringify(getTopFavoriteMeals(userProfile)) || "None"}
//         - Disliked Meals (latest 5): ${JSON.stringify(getTopDislikedMeals(userProfile)) || "None"}
//         - Preferred Ingredients (top 5 rated): ${JSON.stringify(getTopIngredients(userProfile)) || "None"}
//         - Avoided Ingredients (bottom 5 rated): ${JSON.stringify(getBottomIngredients(userProfile)) || "None"}
//         - Preferred Cuisines (top 5 rated): ${JSON.stringify(getTopCuisines(userProfile)) || "None"}
//         - Avoided Cuisines (bottom 5 rated): ${JSON.stringify(getBottomCuisines(userProfile)) || "None"}

//         Return a structured JSON array of meal objects **without additional keys**:
//         \`\`\`json
//         [
//           {
//             "name": "Dish Name",
//             "ingredients": ["Ingredient 1", "Ingredient 2"],
//             "cuisine": "Mediterranean",
//             "fats": 10,
//             "carbs": 40,
//             "protein": 15,
//             "calories": 350
//           }
//         ]
//         \`\`\`
//         Ensure **no extra text** or keys—just a **pure JSON array**. 
//         - Use Favorite Meals, Preferred Ingredients, and Preferred Cuisines as inspiration—include some, but **blend in variety** with unique meals not listed in favorites.
//         - Avoid Disliked Meals, Avoided Ingredients, and Avoided Cuisines completely.
//         - Generate 3-5 meals, ensuring variety in cuisines, ingredients, and nutrition—don’t repeat meals, even from previous runs.`;

//         console.log('Prompt: ', prompt);

//         if (!userProfile.goals || !userProfile.location || !userProfile.age) {
//             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//         }

//         // Make the API call to DeepSeek
//         const response = await fetch(DEEPSEEK_API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${DEEPSEEK_API}`,
//             },
//             body: JSON.stringify({
//                 model: 'deepseek-chat',
//                 messages: [{ role: 'user', content: prompt }],
//                 temperature: 1.1,
//                 max_tokens: 600,
//                 stream: true,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error(`DeepSeek API Error: ${response.statusText}`);
//         }

//         // Handle streaming response
//         const encoder = new TextEncoder();
//         const stream = new ReadableStream({
//             async start(controller) {
//                 const reader = response.body.getReader();
//                 while (true) {
//                     const { done, value } = await reader.read();
//                     if (done) {
//                         controller.close();
//                         break;
//                     }
//                     const chunk = new TextDecoder().decode(value);
//                     const lines = chunk.split('\n').filter(line => line.startsWith('data:'));
//                     for (const line of lines) {
//                         try {
//                             const json = JSON.parse(line.replace('data:', '').trim());
//                             const content = json.choices?.[0]?.delta?.content || '';
//                             if (content) controller.enqueue(encoder.encode(content));
//                         } catch (error: any) {
//                             console.error('Invalid DeepSeek chunk:', line, error);
//                         }
//                     }
//                 }
//             },
//         });

//         return new Response(stream, { status: 200 });
//     } catch (error: any) {
//         console.error('DeepSeek API Error:', error.message);
//         return new Response(
//             JSON.stringify({ error: 'Failed to generate response' }),
//             { status: 500 }
//         );
//     }
// }

import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
});

export async function POST(req: Request) {
    let userId: string | undefined;
    try {
        const body = await req.json();
        userId = body?.userId as string | undefined;
        const yesterdaysMeals: string[] = Array.isArray(body?.yesterdaysMeals) ? body.yesterdaysMeals : [];

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
        }

        // Check if user has updates remaining
        const { resetUpdatesRemainingIfNeeded } = await import('../../../../_lib/supabase/queries/users');
        const updatesCheck = await resetUpdatesRemainingIfNeeded(userId);
        
        if (!updatesCheck.success || updatesCheck.updatesRemaining <= 0) {
            return NextResponse.json({ 
                error: "Daily limit reached. You have used all menu generations for today. Try again tomorrow!" 
            }, { status: 429 });
        }

        const fullProfile = await getFullUserProfileForGeneration(userId);

        if (!fullProfile) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const { user, preferences, favoriteMeals, dislikedMeals, ingredients, cuisines } = fullProfile;

        // Normalize dateLastUpdated fields to Date for helper functions
        const favoriteMealsForHelpers = favoriteMeals.map(m => ({
            name: m.name,
            dateLastUpdated: new Date(m.dateLastUpdated),
        }));
        const dislikedMealsForHelpers = dislikedMeals.map(m => ({
            name: m.name,
            dateLastUpdated: new Date(m.dateLastUpdated),
        }));
        const ingredientsForHelpers = ingredients.map(i => ({
            name: i.name,
            rating: i.rating,
            dateLastUpdated: new Date(i.dateLastUpdated),
        }));
        const cuisinesForHelpers = cuisines.map(c => ({
            name: c.name,
            rating: c.rating,
            dateLastUpdated: new Date(c.dateLastUpdated),
        }));

        const dailyCaloriesSuggested = preferences?.dailyCaloriesSuggested ?? 2000;
        const proteinCalories = Math.round(dailyCaloriesSuggested * 0.3);
        const fatsCalories = Math.round(dailyCaloriesSuggested * 0.3);
        const carbsCalories = dailyCaloriesSuggested - proteinCalories - fatsCalories;

        const proteinGrams = Math.round(proteinCalories / 4);
        const fatsGrams = Math.round(fatsCalories / 9);
        const carbsGrams = Math.round(carbsCalories / 4);

        const systemPrompt = `
        You are a meal plan generation engine. Output only raw JSON arrays—no extra text, comments, or formatting. You receive structured user data and must return a 1-day meal plan based on it.
        
        Important Output Rules:
        - Output must be a valid JSON array of meal objects.
        - Each object must match this schema:
        [
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
        ]
        - Return only JSON. No headings, no markdown, no explanations.
        - Never label a cuisine as "International" or "Fusion". Always choose a specific cuisine based on the dish.
        - Meals must be varied and not repeated from previous generations or days.
        - Include 'weight' field representing the portion size in grams for accurate nutrition tracking (typically 200-500g for meals).
        `;


        const userPrompt = `
        Generate a 1-day personalized meal plan for this user. Make sure the total calorie count is around ${dailyCaloriesSuggested} kcal (±200 kcal allowed).
        
        User context:
        - Goals: ${preferences?.goals ?? "None"}
        - Location: ${preferences?.location ?? "Unknown"}
        - Age: ${preferences?.age ?? "Unknown"}
        - Dietary Restrictions: ${preferences?.dietaryRestrictions || "None"}
        - Medical Recommendations: ${(preferences?.medicalRecommendations || []).join('; ') || "None"}
        - Target macros for the whole day: approximately ${proteinGrams}g protein, ${fatsGrams}g fats, ${carbsGrams}g carbs.
        
        Preferences:
        - Favorite Meals: ${JSON.stringify(getTopFavoriteMeals({ favoriteMeals: favoriteMealsForHelpers })) || "None"}
        - Disliked Meals: ${JSON.stringify(getTopDislikedMeals({ dislikedMeals: dislikedMealsForHelpers })) || "None"}
        - Preferred Ingredients: ${JSON.stringify(getTopIngredients({ ingredients: ingredientsForHelpers })) || "None"}
        - Avoided Ingredients: ${JSON.stringify(getBottomIngredients({ ingredients: ingredientsForHelpers })) || "None"}
        - Preferred Cuisines: ${JSON.stringify(getTopCuisines({ cuisines: cuisinesForHelpers })) || "None"}
        - Avoided Cuisines: ${JSON.stringify(getBottomCuisines({ cuisines: cuisinesForHelpers })) || "None"}
        
        Guidelines:
        - Meals must be accessible in user's location. Prioritise popular dishes in region
- Use user preferences for inspiration, but include variety and new dishes.
- Avoid disliked meals, ingredients, and cuisines. Soft inclusion is acceptable if it improves diversity.
- Meals must include common, realistic ingredients based on the user's region.
- Add as many meals/snacks as needed to reach the calorie target.
- Each meal should have a specific cuisine. No "International".
- Calorie values for individual meals should be slightly overestimated to ensure the total meets or slightly exceeds the user's daily goal. This helps avoid underfeeding.
- Include realistic portion weights in grams (typically 200-500g for meals) for accurate nutrition tracking.

        
        Plan should be at least ${Math.ceil(dailyCaloriesSuggested / 370)} meals long.
        Return only a JSON array of meals. No extra text.
        `;


        const messages = [
            { role: "system", content: systemPrompt },
            ...(yesterdaysMeals.length > 0
                ? [{
                    role: "user",
                    content: `Here are meals you generated yesterday. Do NOT repeat these dishes or their core ingredients today:\n\n${yesterdaysMeals.join(', ')}`
                }]
                : []),
            { role: "user", content: userPrompt },
        ];

        console.log(messages);

        // const prompt = `Generate a personalized meal plan for 1 day based on:
        // - Goals: ${userProfile?.goals}
        // - Average daily kcal amount: ${userProfile?.dailyCaloriesSuggested}
        // - Location: ${userProfile?.location}
        // - Age: ${userProfile?.age}
        // - Dietary Restrictions: ${userProfile?.dietaryRestrictions || "None"}
        // - Favorite Meals (latest 5): ${JSON.stringify(getTopFavoriteMeals(userProfile)) || "None"}
        // - Disliked Meals (latest 5): ${JSON.stringify(getTopDislikedMeals(userProfile)) || "None"}
        // - Preferred Ingredients (top 5 rated): ${JSON.stringify(getTopIngredients(userProfile)) || "None"}
        // - Avoided Ingredients (bottom 5 rated): ${JSON.stringify(getBottomIngredients(userProfile)) || "None"}
        // - Preferred Cuisines (top 5 rated): ${JSON.stringify(getTopCuisines(userProfile)) || "None"}
        // - Avoided Cuisines (bottom 5 rated): ${JSON.stringify(getBottomCuisines(userProfile)) || "None"}

        // Return a structured JSON array of meal objects **without additional keys**:
        // \`\`\`json
        // [
        //   {
        //     "name": "Dish Name",
        //     "ingredients": ["Ingredient 1", "Ingredient 2"],
        //     "cuisine": "Mediterranean",
        //     "fats": 10,
        //     "carbs": 40,
        //     "protein": 15,
        //     "calories": 350
        //   }
        // ]
        // \`\`\`
        // Ensure **no extra text** or keys—just a **pure JSON array**. 
        // - Use Favorite Meals, Preferred Ingredients, and Preferred Cuisines as inspiration—include some, but **blend in variety** with unique meals not only listed in favorites and disliked.
        // - Avoid Disliked Meals, Avoided Ingredients, and Avoided Cuisines but not completely.
        // - Generate meals, ensuring variety in cuisines, ingredients, and nutrition—don’t repeat meals, even from previous runs.`;



        if (!preferences?.goals 
            || !preferences?.location 
            // || preferences?.age == null
            || !preferences?.dailyCaloriesSuggested
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            // messages: [{ role: "system", content: prompt }],
            messages: messages as any,
            temperature: 1,
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const errorData = error && typeof error === 'object' && 'response' in error 
            ? (error as { response?: { data?: unknown } }).response?.data 
            : undefined;
        console.error('OpenAI API Error:', errorData || message);
        
        // Log error to database
        try {
            await logErrorFromRequest(
                error instanceof Error ? error : new Error(message),
                req,
                userId
            );
        } catch (logErr) {
            // If error logging fails, continue with original error response
            console.error('Failed to log error:', logErr);
        }
        
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500 }
        );
    }
}