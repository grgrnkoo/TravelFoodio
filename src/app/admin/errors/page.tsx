import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@lib/adminAuth";
import { getErrorLogs } from "@lib/supabase/queries/errorLogs";
import ErrorsTable from "./ErrorsTable";

async function getErrorsData(searchParams: {
    page?: string;
    severity?: string;
    resolved?: string;
}) {
    const page = parseInt(searchParams.page || '1', 10);
    const limit = 50;
    const severity = searchParams.severity as 'low' | 'medium' | 'high' | 'critical' | undefined;
    const resolved = searchParams.resolved === 'true' ? true : searchParams.resolved === 'false' ? false : undefined;

    const result = await getErrorLogs({
        severity: severity || undefined,
        resolved,
        page,
        limit,
    });

    return result;
}

export default async function AdminErrorsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; severity?: string; resolved?: string }>;
}) {
    const authData = await auth();
    if (!authData.userId) {
        throw new Error('Unauthorized');
    }

    await requireAdmin(authData.userId);

    const params = await searchParams;
    const errorData = await getErrorsData(params);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Error Logs</h1>
            <ErrorsTable
                initialErrors={errorData.errorLogs}
                initialPagination={{
                    page: errorData.page,
                    limit: 50,
                    total: errorData.total,
                    totalPages: errorData.totalPages,
                }}
                initialFilters={{
                    severity: params.severity || 'all',
                    resolved: params.resolved || 'all',
                }}
            />
        </div>
    );
}
