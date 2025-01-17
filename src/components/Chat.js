'use client'

import { useState, useEffect } from 'react'
import { MessageWindow } from './MessageWindow'
import { ChatInput } from './ChatInput'

export function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello! How can I help you today?", role: 'assistant' },
  ])
  const [typingMessage, setTypingMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now(),
      content,
      role: 'user'
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])

    // Simulate a reply with a random delay between 0 and 2 seconds
    const reply = "This is a simulated reply that will be typed out symbol by symbol after a random delay."
    
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
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex-1 overflow-hidden">
        <MessageWindow messages={messages} typingMessage={typingMessage} isLoading={isLoading} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}

