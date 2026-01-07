import { createErrorLog } from './supabase/queries/errorLogs';

export interface ErrorContext {
    userId?: string;
    endpoint?: string;
    requestData?: Record<string, unknown>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log an error to the database
 * @param error - The error object
 * @param context - Additional context about the error
 */
export async function logError(error: Error | unknown, context: ErrorContext = {}): Promise<void> {
    try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        // Determine error type from error name or message
        let errorType = 'unknown_error';
        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                errorType = 'validation_error';
            } else if (error.name === 'DatabaseError' || error.message.includes('database') || error.message.includes('supabase')) {
                errorType = 'database_error';
            } else if (error.message.includes('API') || error.message.includes('fetch')) {
                errorType = 'api_error';
            } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
                errorType = 'authentication_error';
            } else {
                errorType = 'application_error';
            }
        }

        // Determine severity if not provided
        let severity: 'low' | 'medium' | 'high' | 'critical' = context.severity || 'medium';
        if (!context.severity) {
            const message = errorMessage.toLowerCase();
            if (message.includes('critical') || message.includes('fatal')) {
                severity = 'critical';
            } else if (message.includes('error') || message.includes('failed')) {
                severity = 'high';
            } else if (message.includes('warning') || message.includes('invalid')) {
                severity = 'medium';
            } else {
                severity = 'low';
            }
        }

        await createErrorLog({
            userId: context.userId,
            errorType,
            errorMessage,
            errorStack,
            endpoint: context.endpoint,
            requestData: context.requestData,
            severity,
        });

        // Also log to console for development
        if (process.env.NODE_ENV === 'development') {
            console.error('[ErrorLogger]', {
                errorType,
                errorMessage,
                endpoint: context.endpoint,
                severity,
            });
        }
    } catch (logError) {
        // If error logging fails, at least log to console
        console.error('[ErrorLogger] Failed to log error to database:', logError);
        console.error('[ErrorLogger] Original error:', error);
    }
}

/**
 * Log an error with automatic context extraction from request
 * @param error - The error object
 * @param request - The request object (Next.js Request)
 * @param userId - Optional user ID
 */
export async function logErrorFromRequest(
    error: Error | unknown,
    request: Request,
    userId?: string
): Promise<void> {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    // Try to extract request data (for POST/PUT requests)
    let requestData: Record<string, unknown> | undefined;
    try {
        if (request.method !== 'GET') {
            const clonedRequest = request.clone();
            const body = await clonedRequest.json().catch(() => null);
            if (body) {
                requestData = body;
            }
        }
    } catch {
        // Ignore errors when trying to read request body
    }

    await logError(error, {
        userId,
        endpoint,
        requestData,
    });
}

