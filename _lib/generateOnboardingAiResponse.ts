import { OpenAI } from 'openai';
import { validateEnv } from './validateEnv'
import { UserOnboardingFormatted } from './interfaces';
import { ChatCompletionMessageParam } from 'openai/src/resources.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
});

export async function generateOnboardingAiResponse(props: UserOnboardingFormatted) {
    validateEnv(['OPENAI_API']);
    const { dateOfBirthday, goal, dietaryRestrictions, otherInfo, weight, height } = props;
    try {
        if (!props || !dateOfBirthday || !goal || !weight || !height) {
            return new Response(
                JSON.stringify({ error: `Invalid data format. You're missing some data` }),
                { status: 400 }
            );
        }

        const systemPrompt = `
    You are a strict data extraction engine. You do not guess, summarize, or add friendly explanations.
    
    Your job is to:
    - Give user a nutritional suggestions based on user input
    - Output a valid JSON object with filled fields
    - Fix typos and logical mistakes
    - Suggest est. daily values amount based on user input
    - Never invent or assume optimistic answers
    - If user inputs are not English, output in user language
    
    If you cannot find a value:
    - Use "None" for strings
    - Use 0 or 1 for numeric values
    - Do not leave any field blank, null, or undefined
    
    Return only a valid JSON object. No extra text, no comments, no markdown.
    `;



        const prompt = `
        Given the following user input:
        
        Date of birth: ${dateOfBirthday}
        Health goals: ${goal}
        ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : ''}
        User weight: ${weight}
        User height: ${height}
        ${otherInfo ? `Other info, provided by user: ${otherInfo}` : ''}

        Based on provided user input, generate a JSON object with the following fields:
        
        dailyKcalSuggested: number
        dailyCarbsSuggested: number
        dailyProteinsSuggested: number
        dailyFatsSuggested: number
        motivationalMessage: string

        Make the last motivational message 3 sentences max.

        This data will be used to generate personalized meal plans for the user on a daily basis. We are working for a meal plan generator, so we need to be as precise as possible.
`;

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages as ChatCompletionMessageParam[],
            temperature: 0.3,
            max_tokens: 200,
        });

        const message = response.choices[0].message.content;

        return { message }
    } catch (error) {
        if (error instanceof Error) {
            console.error('OpenAI API Error:', error.message);
        } else {
            console.error('OpenAI API Error: An unknown error occurred');
        }
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500 }
        );
    }
}