"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Search } from "lucide-react";

interface User {
    id: string;
    clerkUserId: string;
    email: string;
    name: string | null;
    subscriptionType: string;
    dailyUpdates: number;
    updatesRemaining: number;
    menuGenerations: number;
    mealGenerations: number;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function UsersTable({
    initialUsers,
    initialPagination,
    initialSearch,
}: {
    initialUsers: User[];
    initialPagination: Pagination;
    initialSearch: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialSearch);
    const [users, setUsers] = useState(initialUsers);
    const [pagination, setPagination] = useState(initialPagination);
    const [isPending, startTransition] = useTransition();

    function handleSearch(newSearch: string) {
        setSearch(newSearch);
        const params = new URLSearchParams(searchParams.toString());
        if (newSearch) {
            params.set('search', newSearch);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        startTransition(() => {
            router.push(`/admin/users?${params.toString()}`);
        });
    }

    function handlePageChange(newPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        startTransition(() => {
            router.push(`/admin/users?${params.toString()}`);
        });
    }

    async function handleDelete(userId: string) {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
            // Refresh the page to get updated data
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete user");
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                            disabled={isPending}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Email</th>
                                        <th className="text-left p-2">Name</th>
                                        <th className="text-left p-2">Subscription</th>
                                        <th className="text-left p-2">Daily Updates</th>
                                        <th className="text-left p-2">Generations</th>
                                        <th className="text-left p-2">Created</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{user.name || "-"}</td>
                                            <td className="p-2">
                                                <Badge variant="outline" className="capitalize">
                                                    {user.subscriptionType}
                                                </Badge>
                                            </td>
                                            <td className="p-2">{user.dailyUpdates}</td>
                                            <td className="p-2">
                                                {user.menuGenerations} menus, {user.mealGenerations} meals
                                            </td>
                                            <td className="p-2 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || isPending}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages || isPending}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

