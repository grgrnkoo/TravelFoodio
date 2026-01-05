import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

// TODO: Consider implementing rate limiting per userId
// to prevent abuse (e.g., using Upstash Redis or similar)

export async function POST(req: Request) {
    console.log("[generateRestrictions] API route called");

    try {
        // Verify user is authenticated with Clerk
        const { userId } = await auth();

        if (!userId) {
            console.error("[generateRestrictions] Unauthenticated request");
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        console.log("[generateRestrictions] Authenticated user:", userId);

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API) {
            console.error("[generateRestrictions] OPENAI_API key is not configured");
            return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
        }

        const body = await req.json();
        console.log("[generateRestrictions] Request body received");

        const { dietaryRestrictions, otherInfo, age } = body;

        // Validate that at least one field is provided
        if (!dietaryRestrictions && !otherInfo) {
            console.error("[generateRestrictions] No dietary restrictions or other info provided");
            return NextResponse.json({
                error: "At least one of dietaryRestrictions or otherInfo is required"
            }, { status: 400 });
        }

        // Validate max length to prevent abuse
        const MAX_LENGTH = 2000;
        if (dietaryRestrictions && dietaryRestrictions.length > MAX_LENGTH) {
            console.error("[generateRestrictions] dietaryRestrictions too long");
            return NextResponse.json({
                error: `Dietary restrictions must be less than ${MAX_LENGTH} characters`
            }, { status: 400 });
        }
        if (otherInfo && otherInfo.length > MAX_LENGTH) {
            console.error("[generateRestrictions] otherInfo too long");
            return NextResponse.json({
                error: `Other info must be less than ${MAX_LENGTH} characters`
            }, { status: 400 });
        }

        console.log("[generateRestrictions] Generating restrictions for user:", userId);

        const systemPrompt = `
        You are a strict dietary restriction extraction engine.
        
        Your task is to extract ONLY concrete dietary restrictions based on:
        - Medical conditions
        - Allergies
        - Explicit food limitations
        - Nutrient-based restrictions implied by diseases
        
        You MUST follow medical nutrition logic.
        
        You must ALWAYS return a valid JSON object and NOTHING ELSE.
        
        Output format:
        {
          "recommendations": ["string", "string"]
        }
        
        Hard rules:
        - If a medical condition is mentioned (e.g. kidney disease, diabetes, hypertension), you MUST return at least one recommendation.
        - Empty array is allowed ONLY if:
          - No medical condition is mentioned AND
          - No explicit restriction or preference is provided.
        - Prefer nutrient-level restrictions over specific foods when relevant.
        - Each recommendation must be 1–2 words max.
        - Be conservative but NOT empty when disease is present.
        - Language must match the user input language.

        Priority rules:
- Medical-condition-based restrictions MUST be included.
- Explicit user exclusions or reductions (e.g. "exclude pork", "reduce sugar") MUST ALWAYS be included as well.
- Medical rules do NOT replace or remove explicit user preferences.
        `;


        const prompt = `
        User data:
        
        ${age ? `Age: ${age}` : ''}
        ${dietaryRestrictions ? `Dietary preferences or restrictions: ${dietaryRestrictions}` : ''}
        ${otherInfo ? `Medical or other relevant info: ${otherInfo}` : ''}
        
        Instructions:
        
        1. Detect whether the user mentions ANY medical condition.
        2. If a medical condition exists, infer standard dietary restrictions associated with it.
        3. Convert restrictions into SHORT labels (1–2 words).
        4. Prefer nutrient-based categories when applicable.
        
        Examples:
        - Kidney disease → ["Limit protein", "Avoid sodium", "Avoid potassium"]
        - High blood pressure → ["Avoid sodium"]
        - Reduce pork → ["Limit pork"]
        
        Rules:
        - If medical condition exists → recommendations array MUST NOT be empty.
        - If only soft preferences exist → include them if meaningful.
        - Do NOT explain.
        - Do NOT add extra text.
        - Return ONLY valid JSON.

        Additional rules:
- If the user explicitly mentions excluding or reducing a food, always include it.
- Use the format:
  - "Avoid X" for exclusions
  - "Limit X" for reductions
- Do NOT drop explicit food restrictions even when disease-related restrictions exist.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ];

        console.log("[generateRestrictions] Calling OpenAI API...");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as any,
            temperature: 0.3,
            max_tokens: 200,
        });

        console.log("[generateRestrictions] OpenAI API responded successfully");
        const restrictionsResponse = response.choices[0]?.message?.content || '{}';
        console.log("[generateRestrictions] Generated restrictions response:", restrictionsResponse);

        // Parse and validate the AI response
        try {
            const parsedRestrictions = JSON.parse(restrictionsResponse);

            // Validate that the response has the expected structure
            if (!parsedRestrictions || typeof parsedRestrictions !== 'object') {
                console.error("[generateRestrictions] Invalid response structure - not an object");
                return NextResponse.json({
                    error: "Invalid response format from AI service",
                    details: "Response is not an object"
                }, { status: 500 });
            }

            // Ensure recommendations array exists (can be empty)
            if (!Array.isArray(parsedRestrictions.recommendations)) {
                console.error("[generateRestrictions] Missing or invalid recommendations array");
                // Default to empty array if missing
                parsedRestrictions.recommendations = [];
            }

            console.log("[generateRestrictions] Successfully parsed restrictions:", parsedRestrictions);
            console.log("[generateRestrictions] Found", parsedRestrictions.recommendations.length, "restricted recommendations");

            return NextResponse.json(parsedRestrictions);
        } catch (parseError) {
            console.error("[generateRestrictions] Failed to parse restrictions JSON:", restrictionsResponse);
            console.error("[generateRestrictions] Parse error:", parseError);
            return NextResponse.json({
                error: "Invalid restrictions format received from AI service",
                details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
            }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;

        // Try to get userId for logging (may not be available if auth failed)
        let logUserId = 'unknown';
        try {
            const { userId } = await auth();
            logUserId = userId || 'unknown';
        } catch {
            // Auth already failed, userId not available
        }

        console.error("[generateRestrictions] Error generating restrictions for user:", logUserId);
        console.error("[generateRestrictions] Error message:", message);
        console.error("[generateRestrictions] Stack trace:", stack);

        // Check for specific error types
        if (message.includes('API key')) {
            return NextResponse.json({
                error: "OpenAI service configuration error",
                details: "API key issue"
            }, { status: 500 });
        }

        if (message.includes('rate limit') || message.includes('quota')) {
            return NextResponse.json({
                error: "Service temporarily unavailable",
                details: "Please try again in a moment"
            }, { status: 429 });
        }

        return NextResponse.json({
            error: "Failed to generate restrictions",
            details: message
        }, { status: 500 });
    }
}
