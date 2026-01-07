import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getErrorLogById, deleteErrorLog } from '@lib/supabase/queries/errorLogs';
import { logError } from '@lib/errorLogger';

// GET /api/admin/errors/[errorId] - Get full error details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ errorId: string }> }
) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const { errorId } = await params;
        const errorLog = await getErrorLogById(errorId);

        if (!errorLog) {
            return NextResponse.json({ error: 'Error log not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            errorLog,
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId,
            endpoint: '/api/admin/errors/[errorId]',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch error log', details: message },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/errors/[errorId] - Delete error log
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ errorId: string }> }
) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const { errorId } = await params;
        const success = await deleteErrorLog(errorId);

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete error log' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Error log deleted successfully',
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId,
            endpoint: '/api/admin/errors/[errorId]',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to delete error log', details: message },
            { status: 500 }
        );
    }
}

