import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getPhotoAnalysisCount, recordPhotoAnalysis } from "../../../../_lib/supabase/queries/photoAnalyses";
import { saveSingleMeal } from "../../../../_lib/supabase/queries/singleMeals";
import sharp from "sharp";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 1024;

// Compress and resize image
async function processImage(buffer: Buffer): Promise<Buffer> {
    try {
        const processed = await sharp(buffer)
            .resize(MAX_DIMENSION, MAX_DIMENSION, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        
        return processed;
    } catch (error) {
        console.error("[analyzePhoto] Error processing image:", error);
        throw new Error("Failed to process image");
    }
}

// Convert buffer to base64
function bufferToBase64(buffer: Buffer, mimeType: string): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function POST(req: Request) {
    console.log("[analyzePhoto] API route called");
    
    try {
        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API) {
            console.error("[analyzePhoto] OPENAI_API key is not configured");
            return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
        }

        // Check authentication
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await ensureUserExists(authData.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check daily limit (3 per day)
        const today = new Date().toISOString().split('T')[0];
        const analysisCount = await getPhotoAnalysisCount(user.id, today);

        if (analysisCount >= 3) {
            return NextResponse.json(
                { error: "Daily limit reached. You can analyze up to 3 photos per day." },
                { status: 429 }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process image (compress and resize)
        console.log("[analyzePhoto] Processing image...");
        const processedBuffer = await processImage(buffer);
        const base64Image = bufferToBase64(processedBuffer, 'image/jpeg');

        // Quick validation: Check if image contains food
        console.log("[analyzePhoto] Validating if image contains food...");
        const validationResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Does this image contain food or a meal? Answer only 'yes' or 'no'."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image
                            }
                        }
                    ]
                }
            ],
            max_tokens: 10,
            temperature: 0,
        });

        const validationAnswer = validationResponse.choices[0]?.message?.content?.toLowerCase().trim();
        console.log("[analyzePhoto] Validation answer:", validationAnswer);

        if (!validationAnswer || !validationAnswer.includes('yes')) {
            return NextResponse.json(
                { error: "The image doesn't appear to contain food. Please upload a photo of a meal." },
                { status: 400 }
            );
        }

        // Full analysis: Extract meal information
        console.log("[analyzePhoto] Analyzing meal...");
        const systemPrompt = `
        You are a professional meal analyzer. Analyze food images and extract detailed meal information.
        
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
        - Analyze the visible food in the image accurately.
        - Identify all visible ingredients.
        - Estimate realistic nutritional values based on the visible portion size.
        - Include 'weight' field representing the estimated portion size in grams (typically 200-500g for meals).
        - Be accurate and realistic with nutritional estimates.
        - Do NOT copy the example or explain yourself.
        - Return only valid JSON, no extra text.
        `;

        const analysisResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this food image and return ONLY a valid JSON object with the meal information. Estimate realistic nutritional values based on visible portion size."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        console.log("[analyzePhoto] OpenAI API responded successfully");
        const mealJson = analysisResponse.choices[0]?.message?.content || '{}';
        console.log("[analyzePhoto] Generated meal response:", mealJson);
        
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanedJson = mealJson.trim();
            if (cleanedJson.startsWith('```')) {
                cleanedJson = cleanedJson.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
            }
            
            const parsedMeal = JSON.parse(cleanedJson);
            console.log("[analyzePhoto] Successfully parsed meal:", parsedMeal);
            
            // Record the analysis
            await recordPhotoAnalysis(user.id);
            
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
                    source: 'photo',
                });
                console.log("[analyzePhoto] Meal saved to single_meals table");
            } catch (saveError) {
                console.error("[analyzePhoto] Error saving meal to database:", saveError);
                // Continue even if save fails - don't break the user experience
            }
            
            return NextResponse.json(parsedMeal);
        } catch (parseError) {
            console.error("[analyzePhoto] Failed to parse meal JSON:", mealJson);
            console.error("[analyzePhoto] Parse error:", parseError);
            return NextResponse.json({ 
                error: "Invalid meal format received from AI", 
                raw: mealJson 
            }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        console.error("[analyzePhoto] Error analyzing photo:", message);
        console.error("[analyzePhoto] Stack trace:", stack);
        
        // Log error to database
        try {
            const { logErrorFromRequest } = await import('../../../../_lib/errorLogger');
            let userId: string | undefined;
            try {
                const authData = await auth();
                if (authData.userId) {
                    const { ensureUserExists } = await import('../../../../_lib/supabase/queries/users');
                    const user = await ensureUserExists(authData.userId);
                    userId = user?.id;
                }
            } catch {
                // Ignore auth errors when logging
            }
            await logErrorFromRequest(
                error instanceof Error ? error : new Error(message),
                req,
                userId
            );
        } catch (logErr) {
            console.error('Failed to log error:', logErr);
        }
        
        return NextResponse.json({ 
            error: "Failed to analyze photo", 
            details: message 
        }, { status: 500 });
    }
}

