'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MessageWindow } from './MessageWindow'
import { ChatInput } from './ChatInput'
import questionsJson from '../lib/questions.json'
import ChatSubmitButtons from './ChatSubmitButtons'
import { addDataFromReply } from '../../_lib/actions'
import { usePopup } from './providers/PopUpProvider'
import { useRouter } from 'next/navigation'

export const initialMessage = {
  id: 0,
  content: `Welcome to FoodSm.art! Feel free to express yourself however you like—whether it’s plain text, numbers, or both. Our AI can process your answers, even in different languages. Just make sure to reply to each message in one single response. Send any message to start your journey!`,
  role: 'assistant'
}

export function Chat({ session }) {
  const userName = session?.user?.name?.split(' ')[0];

  const [messages, setMessages] = useState([initialMessage])
  const [typingMessage, setTypingMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userReplies, setUserReplies] = useState([]);
  const [showSubmitButtons, setShowSubmitButtons] = useState(false);
  const [aiReply, setAiReply] = useState('');
  const { update } = useSession();
  const { showPopup } = usePopup()
  const router = useRouter();

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

    // Update state in a single batch
    setUserReplies(updatedReplies);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    const reply = await generateNewReply(userName, updatedReplies, setShowSubmitButtons);

    // Simulate AI typing after a random delay
    const randomDelay = Math.random() * 1000;
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
      }, 30); // Adjust typing speed here
    }, randomDelay);
  };

  const resetChat = () => {
    // Reset states to their initial values
    setMessages([initialMessage]); // reset the message array
    setUserReplies([]); // clear the user replies
    setTypingMessage(null); // reset typing message state
    setIsLoading(false); // reset loading state
    setShowSubmitButtons(false);
    setAiReply('');
  };

  const submitData = async () => {
    const email = session?.user?.email;
    const dataToPush = JSON.parse(aiReply);
    await addDataFromReply(email, dataToPush, showPopup, update, router);
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
      // Directly generate the AI reply here
      const aiGeneratedReply = await generateOpenAiSummary(userReplies, setIsLoading);
      reply = formatAiReply(aiGeneratedReply);
      setAiReply(aiGeneratedReply);
      console.log('No more questions', JSON.parse(aiGeneratedReply));
      setShowSubmitButtons(true);
    }

    return reply;
  }

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-scroll">
        <MessageWindow
          messages={messages}
          typingMessage={typingMessage}
          isLoading={isLoading}
        />
      </div>
      {!showSubmitButtons ?
        <ChatInput
          onSendMessage={handleSendMessage}
          typingMessage={typingMessage}
          isLoading={isLoading}
        /> :
        <ChatSubmitButtons
          // add error state and some text like 'check your ai summary and restart if you want to change anything'
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

async function generateOpenAiSummary(userReplies, setIsLoading) {
  let aiReply = '';
  const repliesSentToAi = userReplies?.slice(1);
  setIsLoading(true);

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
      setIsLoading(false);
      // setAiReply(data.message);
    } else {
      showPopup('Error generating AI summary', 'error');
      setIsLoading(false);
      console.error(data.error);
    }
  } catch (error) {
    showPopup('Error generating AI summary', 'error');
    setIsLoading(false);
    console.error('Error sending OpenAI request: ', error);
  }
  return aiReply;
}

const formatAiReply = (aiReply) => {
  const returnKey = (key) => {
    switch (key) {
      case ('name'):
        return <strong>Name</strong>;
      case ('age'):
        return <strong>Age</strong>;
      case ('location'):
        return <strong>Location</strong>;
      case ('dailyCaloriesSuggested'):
        return <strong>Est. kcal daily</strong>;
      case ('goals'):
        return <strong>Your goals</strong>;
      case ('dietaryRestrictions'):
        return <strong>Restrictions</strong>;
      default:
        return <strong>{key}</strong>;
    }
  }
  return (
    <>
      AI summary of your answers:
      <br />
      <br />
      {Object.entries(JSON.parse(aiReply)).map(([key, value]) => (
        <span key={key}>
          {returnKey(key)}: {value}
          <br />
        </span>
      ))}
      <br />
      {`Don't worry, you'll be able to edit details later 😊`}
    </>
  )
}