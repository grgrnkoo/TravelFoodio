"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Trash2, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IErrorLog } from "@/types";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ErrorsTable({
    initialErrors,
    initialPagination,
    initialFilters,
}: {
    initialErrors: IErrorLog[];
    initialPagination: Pagination;
    initialFilters: { severity: string; resolved: string };
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errors] = useState(initialErrors);
    const [pagination] = useState(initialPagination);
    const [severityFilter, setSeverityFilter] = useState(initialFilters.severity);
    const [resolvedFilter, setResolvedFilter] = useState(initialFilters.resolved);
    const [selectedError, setSelectedError] = useState<IErrorLog | null>(null);
    const [isPending, startTransition] = useTransition();

    function updateFilters(severity: string, resolved: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (severity !== 'all') {
            params.set('severity', severity);
        } else {
            params.delete('severity');
        }
        if (resolved !== 'all') {
            params.set('resolved', resolved);
        } else {
            params.delete('resolved');
        }
        params.set('page', '1');
        startTransition(() => {
            router.push(`/admin/errors?${params.toString()}`);
        });
    }

    function handlePageChange(newPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        startTransition(() => {
            router.push(`/admin/errors?${params.toString()}`);
        });
    }

    async function handleResolve(errorId: string, resolved: boolean) {
        try {
            const response = await fetch(`/api/admin/errors`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ errorId, resolved }),
            });
            if (!response.ok) {
                throw new Error("Failed to update error");
            }
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update error");
        }
    }

    async function handleDelete(errorId: string) {
        if (!confirm("Are you sure you want to delete this error log?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/errors/${errorId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete error");
            }
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete error");
        }
    }

    function getSeverityColor(severity: string) {
        switch (severity) {
            case "critical":
                return "destructive";
            case "high":
                return "destructive";
            case "medium":
                return "default";
            case "low":
                return "secondary";
            default:
                return "outline";
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex gap-4 items-center">
                        <Select
                            value={severityFilter}
                            onValueChange={(value) => {
                                setSeverityFilter(value);
                                updateFilters(value, resolvedFilter);
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={resolvedFilter}
                            onValueChange={(value) => {
                                setResolvedFilter(value);
                                updateFilters(severityFilter, value);
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="false">Unresolved</SelectItem>
                                <SelectItem value="true">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isPending ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    ) : errors.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No errors found</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Timestamp</th>
                                            <th className="text-left p-2">Type</th>
                                            <th className="text-left p-2">Message</th>
                                            <th className="text-left p-2">Severity</th>
                                            <th className="text-left p-2">Endpoint</th>
                                            <th className="text-left p-2">Status</th>
                                            <th className="text-left p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errors.map((err) => (
                                            <tr key={err.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2 text-sm text-muted-foreground">
                                                    {new Date(err.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-2">
                                                    <Badge variant="outline">{err.errorType}</Badge>
                                                </td>
                                                <td className="p-2 max-w-md truncate">{err.errorMessage}</td>
                                                <td className="p-2">
                                                    <Badge variant={getSeverityColor(err.severity) as any}>
                                                        {err.severity}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-sm text-muted-foreground">
                                                    {err.endpoint || "-"}
                                                </td>
                                                <td className="p-2">
                                                    {err.resolved ? (
                                                        <Badge variant="outline" className="text-green-600">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Resolved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-orange-600">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Unresolved
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedError(err)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {!err.resolved && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleResolve(err.id, true)}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(err.id)}
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
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} errors
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

            <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Error Details</DialogTitle>
                        <DialogDescription>
                            {selectedError && new Date(selectedError.createdAt).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedError && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold">Type:</p>
                                <p>{selectedError.errorType}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Severity:</p>
                                <Badge variant={getSeverityColor(selectedError.severity) as any}>
                                    {selectedError.severity}
                                </Badge>
                            </div>
                            <div>
                                <p className="font-semibold">Endpoint:</p>
                                <p className="font-mono text-sm">{selectedError.endpoint || "N/A"}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Message:</p>
                                <p className="text-sm">{selectedError.errorMessage}</p>
                            </div>
                            {selectedError.errorStack && (
                                <div>
                                    <p className="font-semibold">Stack Trace:</p>
                                    <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                                        {selectedError.errorStack}
                                    </pre>
                                </div>
                            )}
                            {selectedError.requestData && (
                                <div>
                                    <p className="font-semibold">Request Data:</p>
                                    <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                                        {JSON.stringify(selectedError.requestData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

