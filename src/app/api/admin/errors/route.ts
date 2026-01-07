import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getErrorLogs, updateErrorLog } from '@lib/supabase/queries/errorLogs';
import { logError } from '@lib/errorLogger';

// GET /api/admin/errors - List error logs with filters
export async function GET(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | null;
        const resolved = searchParams.get('resolved') === 'true' ? true : searchParams.get('resolved') === 'false' ? false : undefined;
        const userId = searchParams.get('userId') || undefined;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;

        const result = await getErrorLogs({
            severity: severity || undefined,
            resolved,
            userId,
            page,
            limit,
            startDate,
            endDate,
        });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId,
            endpoint: '/api/admin/errors',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch error logs', details: message },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/errors - Mark errors as resolved
export async function PATCH(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const body = await req.json();
        const { errorId, resolved, severity } = body;

        if (!errorId) {
            return NextResponse.json({ error: 'errorId is required' }, { status: 400 });
        }

        const updated = await updateErrorLog(errorId, {
            resolved,
            severity,
        });

        if (!updated) {
            return NextResponse.json({ error: 'Error log not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            errorLog: updated,
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId,
            endpoint: '/api/admin/errors',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update error log', details: message },
            { status: 500 }
        );
    }
}

