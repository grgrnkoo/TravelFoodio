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

    console.log('SanitizedInput', sanitizedInput);

    if (repliesSentToAi.length === 4) {

      prompt = `
    Please summarize the following raw user data into a structured JSON object with the following keys:
    - age (Number): User's age (if the age is not a valid number between 1 and 100, remove the last characters until it fits within the range. For example, if the input is "1234", convert it to "12", excluding "34" or if the input is "8584", convert it to "85", excluding "84". If the place where age should logically be, contains any other data, make a logical output based on context. also be prepared that data can be provided in text format)
    - location (String): City or country where the user lives (correct any typos or unclear locations, like "haifa israel" to "Haifa, Israel")
    - dailyCaloriesSuggested (Number): Suggest estimated calories intake for user based on all of his inputs. 
    - goals (String): A short description of the user's goals (correct and clean any grammar or typo issues)
    - dietaryRestrictions (String or Null): Any dietary restrictions the user has (if not specified, return null or "None")
    
    Here is the raw user data: 
    ${sanitizedInput}
    
    The raw data may contain grammatical or logical mistakes, excessive punctuation, or missing information. Your job is to:
    - Clean up the input as needed
    - Format it into a valid JSON object
    
    Please return only the clean, valid JSON object and nothing else. Do not include any extra explanations, notes, or text, just the object. All fields should be filled with some data. No empty strings
    
    Example outputs:
    
    {
      "age": 33,
      "location": "Bangkok, Thailand",
      "dailyCaloriesSuggested": 2000,
      "goals": "Maintain my physique",
      "dietaryRestrictions": "None"
    }
    `;
    } else if (repliesSentToAi.length === 5) {
      prompt = `
    Please summarize the following raw user data into a structured JSON object with the following keys:
   - name (String): User's name or nickname
    - age (Number): User's age (if the age is not a valid number between 1 and 100, remove the last characters until it fits within the range. For example, if the input is "1234", convert it to "12", excluding "34" or if the input is "8584", convert it to "85", excluding "84". If the place where age should logically be, contains any other data, make a logical output based on context. also be prepared that data can be provided in text format)
    - location (String): City or country where the user lives (correct any typos or unclear locations, like "haifa israel" to "Haifa, Israel")
    - dailyCaloriesSuggested (Number): Suggest estimated calories intake for user based on all of his inputs. 
    - goals (String): A short description of the user's goals (correct and clean any grammar or typo issues)
    - dietaryRestrictions (String or Null): Any dietary restrictions the user has (if not specified, return null or "None")
    
    Here is the raw user data: 
    ${sanitizedInput}
    
    The raw data may contain grammatical or logical mistakes, excessive punctuation, or missing information. Your job is to:
    - Clean up the input as needed
    - Format it into a valid JSON object
    
    Please return only the clean, valid JSON object and nothing else. Do not include any extra explanations, notes, or text, just the object. All fields should be filled with some data. No empty strings
    
    Example output:

    If the array contains 5 elements:
    {
      "name": "John",
      "age": 33,
      "location": "Bangkok, Thailand",
      "dailyCaloriesSuggested": 2000,
      "goals": "Maintain my physique",
      "dietaryRestrictions": "None"
    }
    `;
    }




    //     const prompt = `
    // The user has provided the following information:

    // - Name: ${repliesSentToAi[0]}
    // - Age: ${repliesSentToAi[1]}
    // - Location: ${repliesSentToAi[2]}
    // - Focus and goals: ${repliesSentToAi[3]}
    // - Restrictions and preferences: ${repliesSentToAi[4]}

    // Generate a concise and friendly description of the user, summarizing their goals, preferences, and lifestyle in a warm tone.
    // Do not include any questions, and ensure it feels like a personalized summary.

    // The response should look like:
    // "Oleg, 28 years old, based in Da Nang, Vietnam, is focused on maintaining his physique, aiming to keep his results without losing progress. Enjoys fruits and smoothie bowls, with no specific dietary restrictions."
    // `;



    // console.log('prompt:', prompt)
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API; // Ensure you have this in your environment variables
// const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Replace with the actual DeepSeek API URL

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { repliesSentToAi } = body;
//     let prompt = '';

//     if (!repliesSentToAi || !Array.isArray(repliesSentToAi)) {
//       return new Response(
//         JSON.stringify({ error: 'Invalid data format. "repliesSentToAi" must be an array.' }),
//         { status: 400 }
//       );
//     }

//     console.log(repliesSentToAi.length);

//     const sanitizedInput = repliesSentToAi.map(item =>
//       item.replace(/[,\.!?\-;:(){}[\]'"<>@#$%^&*_+\\|`~=\/]/g, (match) => `|${match}|`)
//     );

//     console.log('SanitizedInput', sanitizedInput);

//     if (repliesSentToAi.length === 4) {
//       prompt = `
//         Please summarize the following raw user data into a structured JSON object with the following keys:
//         - age (Number): User's age (if the age is not a valid number between 1 and 100, remove the last characters until it fits within the range. For example, if the input is "1234", convert it to "12", excluding "34" or if the input is "8584", convert it to "85", excluding "84". If the place where age should logically be, contains any other data, make a logical output based on context. also be prepared that data can be provided in text format)
//         - location (String): City or country where the user lives (correct any typos or unclear locations, like "haifa israel" to "Haifa, Israel")
//         - goals (String): A short description of the user's goals (correct and clean any grammar or typo issues)
//         - dietaryRestrictions (String or Null): Any dietary restrictions the user has (if not specified, return null or "None")
        
//         Here is the raw user data: 
//         ${sanitizedInput}
        
//         The raw data may contain grammatical or logical mistakes, excessive punctuation, or missing information. Your job is to:
//         - Clean up the input as needed
//         - Format it into a valid JSON object
        
//         Please return only the clean, valid JSON object and nothing else. Do not include any extra explanations, notes, or text, just the object.
        
//         Example outputs:
        
//         {
//           "age": 33,
//           "location": "Bangkok, Thailand",
//           "goals": "Maintain my physique",
//           "dietaryRestrictions": "None"
//         }
//       `;
//     } else if (repliesSentToAi.length === 5) {
//       prompt = `
//         Please summarize the following raw user data into a structured JSON object with the following keys:
//         - name (String): User's name or nickname
//         - age (Number): User's age (if the age is not a valid number between 1 and 100, remove the last characters until it fits within the range. For example, if the input is "1234", convert it to "12", excluding "34" or if the input is "8584", convert it to "85", excluding "84". If the place where age should logically be, contains any other data, make a logical output based on context. also be prepared that data can be provided in text format)
//         - location (String): City or country where the user lives (correct any typos or unclear locations, like "haifa israel" to "Haifa, Israel")
//         - goals (String): A short description of the user's goals (correct and clean any grammar or typo issues)
//         - dietaryRestrictions (String or Null): Any dietary restrictions the user has (if not specified, return null or "None")
        
//         Here is the raw user data: 
//         ${sanitizedInput}
        
//         The raw data may contain grammatical or logical mistakes, excessive punctuation, or missing information. Your job is to:
//         - Clean up the input as needed
//         - Format it into a valid JSON object
        
//         Please return only the clean, valid JSON object and nothing else. Do not include any extra explanations, notes, or text, just the object.
        
//         Example output:

//         If the array contains 5 elements:
//         {
//           "name": "John",
//           "age": 33,
//           "location": "Bangkok, Thailand",
//           "goals": "Maintain my physique",
//           "dietaryRestrictions": "None"
//         }
//       `;
//     }

//     // Make the API call to DeepSeek
//     const response = await fetch(DEEPSEEK_API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: 'deepseek-chat', // Replace with the actual DeepSeek model name
//         messages: [{ role: 'user', content: prompt }],
//         max_tokens: 150,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`DeepSeek API Error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     const message = data.choices[0].message.content;

//     return new Response(JSON.stringify({ message }), { status: 200 });
//   } catch (error) {
//     console.error('DeepSeek API Error:', error.message);
//     return new Response(
//       JSON.stringify({ error: 'Failed to generate response' }),
//       { status: 500 }
//     );
//   }
// }