import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { IFeedback } from "../../types"

interface FeedbackItemProps {
  feedback: IFeedback
}

export default function FeedbackItem({ feedback }: FeedbackItemProps) {
  // Extract initials from sender name or use default
  function maskString(str: string) {
    if(str === 'Not logged in') return str;
    if (str.length < 3) return str; // Return as-is if too short
    const firstTwo = str.slice(0, 2);
    const lastOne = str.slice(-1);
    const middleLength = str.length - 3; // Length of the part to mask
    const asterisks = '*'.repeat(middleLength); // Create asterisks for the middle
    return `${firstTwo}${asterisks}${lastOne}`;
  }

  // Format date to relative time (e.g., "2 days ago")
  const getFormattedDate = (dateString: string | Date | undefined) => {
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
          <p className="font-medium text-sm">{maskString(feedback.author || '') || "Anonymous User"}</p>
          <p className="text-xs text-muted-foreground">{getFormattedDate(feedback.createdAt)}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm">{feedback.feedback}</p>
      </CardContent>
    </Card>
  )
}
