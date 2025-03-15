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
import { Loader2, Send, MessageSquare } from "lucide-react"
import FeedbackItem from "@/components/FeedbackItem"
import FeedbackSkeleton from "@/components/FeedbackSkeleton"

export default function FeedbackPage() {
    const [textareaValue, setTextareaValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
    const [publicFeedback, setPublicFeedback] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);

    const ITEMS_PER_PAGE = 10;
    const searchParams = useSearchParams();
    const sender = searchParams.get("sender");
    const { showPopup } = usePopup();

    useEffect(() => {
        fetchPublicFeedback(1, true);
    }, []);

    const fetchPublicFeedback = async (page = 1, reset = false) => {
        if (reset) {
            setIsFeedbackLoading(true);
            setPublicFeedback([]);
        } else {
            setIsLoadingMore(true);
        }
        try {
            const res = await fetch(`/api/getPublicFeedback?page=${page}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error("Error fetching public feedback!");

            const data = await res.json();
            const newFeedbacks = data.feedbacks || [];
            const totalPages = data.totalPages || 1;
            const totalCount = data.total || 0;

            setTotalPages(totalPages);
            setCurrentPage(page);
            setTotalFeedbackCount(totalCount);
            setPublicFeedback(prev => (reset ? newFeedbacks : [...prev, ...newFeedbacks]));
        } catch (error) {
            console.error(error);
            if (reset) setPublicFeedback([]);
        } finally {
            setTimeout(() => {
                setIsFeedbackLoading(false);
                setIsLoadingMore(false);
            }, 300);
        }
    };

    const handleLoadMore = async () => {
        if (isLoadingMore || currentPage >= totalPages) return;
        await fetchPublicFeedback(currentPage + 1);
    };

    const handleSendFeedback = async () => {
        if (textareaValue.trim() === "") return;

        setIsLoading(true);
        try {
            const result = await sendFeedback(textareaValue, sender, showPopup, setTextareaValue, !isPrivate);
            if (result.success && !isPrivate) {
                await fetchPublicFeedback();
            }
        } catch (error) {
            console.error("Error sending feedback:", error);
            showPopup("Error sending feedback. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnChange = (e) => setTextareaValue(e.target.value);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !isLoading && textareaValue.trim() !== "") {
            e.preventDefault();
            handleSendFeedback();
        }
    };

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

            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">Public Feedback</h2>
                    <Separator className="flex-1" />
                </div>
                {isFeedbackLoading ? (
                    <FeedbackSkeleton />
                ) : publicFeedback.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {publicFeedback.map((feedback, index) => (
                                <FeedbackItem key={`${feedback._id}-${index}`} feedback={feedback} />
                            ))}
                        </div>

                        {currentPage < totalPages && (
                            <div className="mt-6 text-center">
                                <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore} className="w-full max-w-xs">
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Load More"
                                    )}
                                </Button>
                            </div>
                        )}

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Showing {publicFeedback.length} of {totalFeedbackCount} messages
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8 bg-muted rounded-lg flex flex-col items-center gap-3">
                        <MessageSquare className="h-10 w-10 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No public feedback yet. Be the first to share!</p>
                    </div>
                )}

                {isLoadingMore && <FeedbackSkeleton cards={totalFeedbackCount - publicFeedback.length} />}
            </div>
        </div>
    );
}
