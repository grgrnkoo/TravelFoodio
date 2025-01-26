import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { repliesSentToAi } = body;

    if (!repliesSentToAi || !Array.isArray(repliesSentToAi)) {
      return new Response(
        JSON.stringify({ error: 'Invalid data format. "repliesSentToAi" must be an array.' }),
        { status: 400 }
      );
    }

    const prompt = `
The user has provided the following information:

- Name: ${repliesSentToAi[0]}
- Age: ${repliesSentToAi[1]}
- Location: ${repliesSentToAi[2]}
- Focus and goals: ${repliesSentToAi[3]}
- Restrictions and preferences: ${repliesSentToAi[4]}

Generate a concise and friendly description of the user, summarizing their goals, preferences, and lifestyle in a warm tone.
Do not include any questions, and ensure it feels like a personalized summary.

The response should look like:
"Oleg, 28 years old, based in Da Nang, Vietnam, is focused on maintaining his physique, aiming to keep his results without losing progress. Enjoys fruits and smoothie bowls, with no specific dietary restrictions."
`;



    console.log('prompt:', prompt)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'assistant', content: prompt }],
      max_tokens: 150,
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
