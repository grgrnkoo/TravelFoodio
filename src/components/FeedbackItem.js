import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

export default function FeedbackItem({ feedback }) {
  // Extract initials from sender name or use default
  const getInitials = (author) => {
    if (!author) return "FB"
    return author
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format date to relative time (e.g., "2 days ago")
  const getFormattedDate = (dateString) => {
    if (!dateString) return "Recently"
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Recently"
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        <div>
          <p className="font-medium text-sm">{feedback.author || "Anonymous User"}</p>
          <p className="text-xs text-muted-foreground">{getFormattedDate(feedback.createdAt)}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm">{feedback.feedback}</p>
      </CardContent>
    </Card>
  )
}

