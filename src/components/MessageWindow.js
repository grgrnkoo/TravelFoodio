import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { initialMessage } from './Chat'

export function MessageWindow({ messages, typingMessage, isLoading }) {
  const scrollAreaRef = useRef(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, typingMessage, isLoading])

  return (
    <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {typingMessage && <MessageBubble message={typingMessage} />}
      {isLoading && <LoadingAnimation />}
    </ScrollArea>
  )
}

function MessageBubble({ message }) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-[70%] ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {message.content}
        {message.role === 'assistant' && message.content.length === 0 && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse" />
        )}
      </div>
    </div>
  )
}

function LoadingAnimation() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-2 flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}