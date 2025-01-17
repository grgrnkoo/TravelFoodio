'use client'

import { useState, useEffect } from 'react'
import { MessageWindow } from './MessageWindow'
import { ChatInput } from './ChatInput'
import questionsJson from '../lib/questions.json'
import { useSession } from 'next-auth/react'

export const initialMessage = {
  id: 0,
  content: `Welcome to FoodSm.art! Feel free to express yourself however you like—whether it’s plain text, numbers, or both. Our AI can process your answers, even in different languages. Just make sure to reply to each message in one single response.`,
  role: 'disclaimer'
}

export function Chat() {
  const { data: session } = useSession();

  const [userName, setUserName] = useState(session?.user?.name?.split(' ')[0]);
  const [messages, setMessages] = useState([initialMessage])
  const [typingMessage, setTypingMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userReplies, setUserReplies] = useState([]);
  const [tempUserName, setTempUserName] = useState()

  const handleSendMessage = (content) => {
    // if(userReplies.length === 1 && userName === undefined) {
    //   setTempUserName(content);
    //   console.log(content, userReplies.length, userName, tempUserName);
    // }
    setUserReplies([...userReplies, content]);
    const newMessage = {
      id: Date.now(),
      content,
      role: 'user'
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])

    // Simulate a reply with a random delay between 0 and 2 seconds
    console.log(userReplies)
    const reply = generateNewReply(userName, userReplies, tempUserName)

    setIsLoading(true)
    const randomDelay = Math.random() * 2000 // Random delay between 0 and 2000 milliseconds

    setTimeout(() => {
      setIsLoading(false)
      setTypingMessage({ id: Date.now() + 1, content: "", role: 'assistant' })

      let i = 0
      const typingInterval = setInterval(() => {
        if (i < reply.length) {
          setTypingMessage(prev => ({
            ...prev,
            content: prev.content + reply[i]
          }))
          i++
        } else {
          clearInterval(typingInterval)
          setMessages(prev => [...prev, { ...typingMessage, content: reply }])
          setTypingMessage(null)
        }
      }, 50) // Adjust this value to change typing speed
    }, randomDelay)
    console.log((messages.length / 2).toFixed());
  }

  useEffect(() => {
    if (userReplies.length === 2 && userName === undefined) {
      setTempUserName(userReplies[1]); // Update tempUserName reliably
    }
  }, [userReplies, userName]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex-1 overflow-scroll">
        <MessageWindow messages={messages} typingMessage={typingMessage} isLoading={isLoading} />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        typingMessage={typingMessage}
        isLoading={isLoading}
      />
    </div>
  )
}

function getRandomNumber(number) {
  // Generates random number from 0 to number
  return Number((Math.random() * number).toFixed());
}

function generateNewReply(userName, userReplies, tempUserName) {
  let reply;
  const length = userReplies.length;
  // const tempUserName = userReplies[1];

  if (userName) {
    reply = questionsJson[length + 2][getRandomNumber(4)];
    if (reply.includes('${userName}')) {
      // Replace the placeholder with the actual value
      reply = reply.replace('${userName}!', `${userName}!`);
    }
  } if (!userName) {
    reply = questionsJson[length + 1][getRandomNumber(4)];
    console.log(userReplies, tempUserName);
    if (reply.includes('${userName}')) {
      // Replace the placeholder with the actual value
      reply = reply.replace('${userName}!', 'Nice to meet you!');
    }
  }
  return reply;
}

