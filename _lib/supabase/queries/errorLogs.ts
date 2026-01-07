import { getSupabaseServerClient } from '../server';
import type { IErrorLog } from '../../../types';
import type { ErrorLogInsert, ErrorLogUpdate } from '../../../types/supabase';

const supabase = getSupabaseServerClient();

// Transform Supabase row to IErrorLog
function transformToErrorLog(row: Record<string, unknown>): IErrorLog {
    return {
        id: row.id as string,
        userId: row.user_id as string | undefined,
        errorType: row.error_type as string,
        errorMessage: row.error_message as string,
        errorStack: row.error_stack as string | undefined,
        endpoint: row.endpoint as string | undefined,
        requestData: row.request_data as Record<string, unknown> | undefined,
        severity: row.severity as 'low' | 'medium' | 'high' | 'critical',
        resolved: (row.resolved as boolean) || false,
        createdAt: row.created_at as string,
    };
}

// Create a new error log
export async function createErrorLog(
    errorLog: {
        userId?: string;
        errorType: string;
        errorMessage: string;
        errorStack?: string;
        endpoint?: string;
        requestData?: Record<string, unknown>;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }
): Promise<IErrorLog | null> {
    const insertData: ErrorLogInsert = {
        user_id: errorLog.userId || null,
        error_type: errorLog.errorType,
        error_message: errorLog.errorMessage,
        error_stack: errorLog.errorStack || null,
        endpoint: errorLog.endpoint || null,
        request_data: errorLog.requestData || null,
        severity: errorLog.severity || 'medium',
        resolved: false,
    };

    const { data, error } = await supabase
        .from('error_logs')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error('[createErrorLog] Error:', error.message);
        return null;
    }

    return data ? transformToErrorLog(data) : null;
}

// Get error log by ID
export async function getErrorLogById(errorLogId: string): Promise<IErrorLog | null> {
    const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('id', errorLogId)
        .single();

    if (error || !data) {
        if (error?.code !== 'PGRST116') {
            console.error('[getErrorLogById] Error:', error?.message);
        }
        return null;
    }

    return transformToErrorLog(data);
}

// Get error logs with filters and pagination
export async function getErrorLogs(filters: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    userId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}): Promise<{ errorLogs: IErrorLog[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('error_logs')
        .select('*', { count: 'exact' });

    if (filters.severity) {
        query = query.eq('severity', filters.severity);
    }

    if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
    }

    if (filters.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('[getErrorLogs] Error:', error.message);
        return { errorLogs: [], total: 0, page, totalPages: 0 };
    }

    const errorLogs = (data || []).map(transformToErrorLog);
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return { errorLogs, total, page, totalPages };
}

// Update error log (mark as resolved, etc.)
export async function updateErrorLog(
    errorLogId: string,
    updates: Partial<{
        resolved: boolean;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>
): Promise<IErrorLog | null> {
    const updateData: ErrorLogUpdate = {};

    if (updates.resolved !== undefined) {
        updateData.resolved = updates.resolved;
    }

    if (updates.severity !== undefined) {
        updateData.severity = updates.severity;
    }

    const { data, error } = await supabase
        .from('error_logs')
        .update(updateData)
        .eq('id', errorLogId)
        .select()
        .single();

    if (error) {
        console.error('[updateErrorLog] Error:', error.message);
        return null;
    }

    return data ? transformToErrorLog(data) : null;
}

// Delete error log
export async function deleteErrorLog(errorLogId: string): Promise<boolean> {
    const { error } = await supabase
        .from('error_logs')
        .delete()
        .eq('id', errorLogId);

    if (error) {
        console.error('[deleteErrorLog] Error:', error.message);
        return false;
    }

    return true;
}

// Get error statistics
export async function getErrorStats(): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    unresolved: number;
    recentCount: number; // Last 24 hours
}> {
    const { count: total, error: totalError } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });

    if (totalError) {
        console.error('[getErrorStats] Error getting total:', totalError.message);
    }

    const { count: unresolved, error: unresolvedError } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

    if (unresolvedError) {
        console.error('[getErrorStats] Error getting unresolved:', unresolvedError.message);
    }

    // Get count by severity
    const severities = ['low', 'medium', 'high', 'critical'];
    const bySeverity: Record<string, number> = {};

    for (const severity of severities) {
        const { count, error } = await supabase
            .from('error_logs')
            .select('*', { count: 'exact', head: true })
            .eq('severity', severity);

        if (error) {
            console.error(`[getErrorStats] Error getting ${severity}:`, error.message);
        }

        bySeverity[severity] = count || 0;
    }

    // Get recent count (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count: recentCount, error: recentError } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

    if (recentError) {
        console.error('[getErrorStats] Error getting recent:', recentError.message);
    }

    return {
        total: total || 0,
        bySeverity,
        unresolved: unresolved || 0,
        recentCount: recentCount || 0,
    };
}

