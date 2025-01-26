'use client'

import { useState, useEffect } from 'react'
import { MessageWindow } from './MessageWindow'
import { ChatInput } from './ChatInput'
import questionsJson from '../lib/questions.json'
import ChatSubmitButtons from './ChatSubmitButtons'
import { addData } from '../../_lib/actions'

export const initialMessage = {
  id: 0,
  content: `Welcome to FoodSm.art! Feel free to express yourself however you like—whether it’s plain text, numbers, or both. Our AI can process your answers, even in different languages. Just make sure to reply to each message in one single response.`,
  role: 'assistant'
}

export function Chat({ session }) {
  // const { data: session } = useSession();
  // console.log(session);
  const userName = session?.user?.name?.split(' ')[0];

  const [messages, setMessages] = useState([initialMessage])
  const [typingMessage, setTypingMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userReplies, setUserReplies] = useState([]);
  const [showSubmitButtons, setShowSubmitButtons] = useState(false);

  const handleSendMessage = async (content) => {
    // Add the user's reply to a local array
    const updatedReplies = [...userReplies, content];

    // Create a new message object for the user's input
    const newMessage = {
      id: Date.now(),
      content,
      role: 'user',
    };

    // Generate the AI's reply immediately
    const reply = await generateNewReply(userName, updatedReplies, setShowSubmitButtons);

    // Update state in a single batch
    setUserReplies(updatedReplies);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    // Simulate AI typing after a random delay
    // const randomDelay = Math.random() * 2000;
    const randomDelay = 0;
    setTimeout(() => {
      setIsLoading(false);

      // Simulate typing with a local typing message variable
      let typingContent = '';
      let i = 0;

      const typingInterval = setInterval(() => {
        if (i < reply.length) {
          typingContent += reply[i];
          setTypingMessage({ id: Date.now(), content: typingContent, role: 'assistant' });
          i++;
        } else {
          clearInterval(typingInterval);

          // Add the final reply to messages
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: Date.now(), content: reply, role: 'assistant' },
          ]);
          setTypingMessage(null);
        }
      }, 0); // Adjust typing speed here
    }, randomDelay);
  };

  const resetChat = () => {
    // Reset states to their initial values
    setMessages([initialMessage]); // reset the message array
    setUserReplies([]); // clear the user replies
    setTypingMessage(null); // reset typing message state
    setIsLoading(false); // reset loading state
    setShowSubmitButtons(false);
  };

  const submitData = async () => {
    // const addData = dynamic(() => import('../../_lib/actions').then((mod) => mod.addData), { ssr: false });
    const email = session?.user?.email;
    const arrayToPush = userReplies;
    console.log('addData clicked')
    await addData(email, arrayToPush);
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-scroll">
        <MessageWindow messages={messages} typingMessage={typingMessage} isLoading={isLoading} />
      </div>
      {!showSubmitButtons ?
        <ChatInput
          onSendMessage={handleSendMessage}
          typingMessage={typingMessage}
          isLoading={isLoading}
        /> :
        <ChatSubmitButtons
          resetChat={resetChat}
          submitData={submitData}
        />
      }
    </div>
  )
}

function getRandomNumber(number) {
  // Generates random number from 0 to number
  return Number((Math.random() * number).toFixed());
}


async function generateNewReply(userName, userReplies, setShowSubmitButtons) {
  let reply;
  const length = userReplies.length;
  console.log(userReplies);

  if (userName && length < 5) {
    reply = questionsJson[length][getRandomNumber(4)];
    if (reply.includes('${userName}')) {
      // Replace the placeholder with the actual value
      reply = reply.replace('${userName}', `${userName}`);
    }
  } else if (!userName && length < 6) {
    reply = questionsJson[length - 1][getRandomNumber(4)];
    if (reply.includes('${userName}')) {
      // Replace the placeholder with the actual value
      reply = reply.replace('${userName}', userReplies[1] || 'Nice to meet you');
    }
  } else {
    // reply = 'no more replies';
    reply = await generateOpenAiSummary(userReplies);;
    console.log('No more questions', userReplies);
    setShowSubmitButtons(true);
    // generateOpenAiSummary(userReplies);
  }

  return reply;
}

async function generateOpenAiSummary(userReplies) {
  let aiReply = '';
  const repliesSentToAi = userReplies?.slice(1);

  try {
    const res = await fetch('../api/generateResponse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repliesSentToAi })
    })

    const data = await res.json();
    if (res.ok) {
      console.log(data.message);
      aiReply = data.message
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Error sending OpenAI request: ', error);
  }
  return aiReply;
}