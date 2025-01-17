'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChatInput({ onSendMessage, typingMessage, isLoading }) {
  const [input, setInput] = useState('')
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if(typingMessage || isLoading) {
      setIsDisabled(true);
    }
    if(!typingMessage && !isLoading) {
      setIsDisabled(false);
    }
  }, [typingMessage, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isDisabled) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t"
    >
      <div className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={typingMessage || isLoading}>Send</Button>
      </div>
    </form>
  )
}

