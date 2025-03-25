import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { repliesSentToAi } = body;
    let prompt = '';

    if (!repliesSentToAi || !Array.isArray(repliesSentToAi)) {
      return new Response(
        JSON.stringify({ error: 'Invalid data format. "repliesSentToAi" must be an array.' }),
        { status: 400 }
      );
    }

    console.log(repliesSentToAi.length);

    const sanitizedInput = repliesSentToAi.map(item =>
      item.replace(/[,\.!?\-;:(){}[\]'"<>@#$%^&*_+\\|`~=\/]/g, (match) => `|${match}|`)
    );

    const systemPrompt = `
    You are a strict data extraction engine. You do not guess, summarize, or add friendly explanations.
    
    Your job is to:
    - Clean up raw, user-submitted input
    - Extract only the data that exists
    - Output a valid JSON object with cleaned fields
    - Fix typos and logical mistakes
    - Suggest est. daily kcal amount based on user input
    - Never invent or assume optimistic answers
    
    If you cannot find a value:
    - Use "None" for strings
    - Use 0 or 1 for numeric values
    - Do not leave any field blank, null, or undefined
    
    Return only a valid JSON object. No extra text, no comments, no markdown.
    `;



    const basePrompt = `
Here is the raw user data: 
${sanitizedInput.join('\n')}

Clean it up, extract what’s useful, and return a valid JSON object with these fields:
`;

    let userPrompt = '';
    if (repliesSentToAi.length === 4) {
      userPrompt = basePrompt + `
- age (Number): A valid age between 1–100. If the number is too large, truncate it sensibly (e.g., "1234" → "12"). Accept numeric or text input.
- location (String): City or country. Correct typos, format cleanly.
- dailyCaloriesSuggested (Number): Estimated daily calorie needs based on age and goals.
- goals (String): What the user wants to achieve. Keep it clean and short.
- dietaryRestrictions (String): "None" if not specified.
`;
    } else if (repliesSentToAi.length === 5) {
      userPrompt = basePrompt + `
- name (String)
- age (Number): A valid age between 1–100. Truncate if necessary.
- location (String)
- dailyCaloriesSuggested (Number)
- goals (String)
- dietaryRestrictions (String): "None" if not specified.
`;
    } else {
      userPrompt = basePrompt + `
Return a minimal but valid object using only the data provided.
`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.3,
      max_tokens: 200,
    });

    const message = response.choices[0].message.content;

    return new Response(JSON.stringify({ message }), { status: 200 });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500 }
    );
  }
}