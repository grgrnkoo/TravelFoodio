"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { sendFeedback } from "../../../_lib/actions"
import { useSearchParams } from "next/navigation"
import { usePopup } from "@/components/providers/PopUpProvider"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import FeedbackItem from "@/components/FeedbackItem"

export default function FeedbackPage() {
  const [textareaValue, setTextareaValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [publicFeedback, setPublicFeedback] = useState([])
  const [isPrivate, setIsPrivate] = useState(false)
  const searchParams = useSearchParams()
  const sender = searchParams.get("sender")
  const { showPopup } = usePopup()

  useEffect(() => {
    fetchPublicFeedback()
  }, [])

  const fetchPublicFeedback = async () => {
    try {
      const res = await fetch("/api/getPublicFeedback")
      if (!res.ok) {
        console.error("Error fetching public feedback!")
        return
      }
      const data = await res.json()
      setPublicFeedback(data)
    } catch (error) {
      console.error("Error fetching public feedback:", error)
    }
  }

  const handleSendFeedback = async () => {
    if (textareaValue.trim() === "") return

    setIsLoading(true)
    try {
      const result = await sendFeedback(textareaValue, sender, showPopup, setTextareaValue, !isPrivate)
      if (result.success) {
        // Refresh public feedback list after successful public submission
        if (!isPrivate) {
          await fetchPublicFeedback()
        }
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
      showPopup("Error sending feedback. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnChange = (e) => {
    setTextareaValue(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading && textareaValue.trim() !== "") {
      e.preventDefault() // Prevent new line
      handleSendFeedback()
    }
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 mt-[66px]">
      <Card className="p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-4">Share Your Feedback</h1>
        <div className="space-y-4">
          <Textarea
            value={textareaValue}
            onChange={handleOnChange}
            className="resize-none min-h-[120px] w-full p-3"
            placeholder="Type your feedback here..."
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="privateCheckbox" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="privateCheckbox">Send Privately</Label>
            </div>
            <Button
              onClick={handleSendFeedback}
              disabled={isLoading || textareaValue.trim() === ""}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Feedback
            </Button>
          </div>
        </div>
      </Card>

      {publicFeedback.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Public Feedback</h2>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-4">
            {publicFeedback.map((feedback, index) => (
              <FeedbackItem key={feedback.id || index} feedback={feedback} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

