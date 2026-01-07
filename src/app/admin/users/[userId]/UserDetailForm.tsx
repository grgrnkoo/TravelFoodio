"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { IUser } from "@/types";

interface UserDetailFormProps {
    initialData: {
        user: IUser | null;
        stats: {
            menuGenerations: number;
            mealGenerations: number;
        };
    };
    userId: string;
}

export default function UserDetailForm({ initialData, userId }: UserDetailFormProps) {
    const router = useRouter();
    const [dailyUpdates, setDailyUpdates] = useState(initialData.user?.dailyUpdates || 3);
    const [updatesRemaining, setUpdatesRemaining] = useState(initialData.user?.updatesRemaining || 0);
    const [subscriptionType, setSubscriptionType] = useState(initialData.user?.subscriptionType || "free");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dailyUpdates,
                    updatesRemaining,
                    subscriptionType,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update user");
            }
            
            const data = await response.json();
            if (data.success && data.user) {
                // Update local state with server response
                setDailyUpdates(data.user.dailyUpdates);
                setUpdatesRemaining(data.user.updatesRemaining);
                setSubscriptionType(data.user.subscriptionType);
            }
            
            // Refresh server component to get latest data
            router.refresh();
            alert("User updated successfully");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update user");
        } finally {
            setSaving(false);
        }
    }

    if (!initialData.user) {
        return null;
    }

    const user = initialData.user;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/admin/users")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <h1 className="text-3xl font-bold">User Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <Input value={user.email} disabled />
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input value={user.name || ""} disabled />
                        </div>
                        <div>
                            <Label>User ID</Label>
                            <Input value={user.id} disabled className="font-mono text-xs" />
                        </div>
                        <div>
                            <Label>Clerk User ID</Label>
                            <Input value={user.clerkUserId} disabled className="font-mono text-xs" />
                        </div>
                        <div>
                            <Label>Created At</Label>
                            <Input
                                value={user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
                                disabled
                            />
                        </div>
                        <div>
                            <Label>Onboarding Status</Label>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={user.onboarding1Completed ? "default" : "outline"}>
                                    Onboarding 1: {user.onboarding1Completed ? "Completed" : "Pending"}
                                </Badge>
                                <Badge variant={user.onboarding2Completed ? "default" : "outline"}>
                                    Onboarding 2: {user.onboarding2Completed ? "Completed" : "Pending"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Daily Updates</Label>
                            <Input
                                type="number"
                                min="0"
                                value={dailyUpdates}
                                onChange={(e) => setDailyUpdates(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <Label>Subscription Type</Label>
                            <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Updates Remaining</Label>
                            <Input
                                type="number"
                                min="0"
                                value={updatesRemaining}
                                onChange={(e) => setUpdatesRemaining(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <Button onClick={handleSave} disabled={saving} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>

                {initialData.stats && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Generation Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Menu Generations</p>
                                    <p className="text-2xl font-bold">{initialData.stats.menuGenerations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Meal Generations</p>
                                    <p className="text-2xl font-bold">{initialData.stats.mealGenerations}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

