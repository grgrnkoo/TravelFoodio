import { getUserByClerkId } from './supabase/queries/users';

/**
 * Check if a user is an admin
 * @param clerkUserId - The Clerk user ID
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(clerkUserId: string): Promise<boolean> {
    try {
        const user = await getUserByClerkId(clerkUserId);
        return user?.subscriptionType === 'admin';
    } catch (error) {
        console.error('[isAdmin] Error checking admin status:', error);
        return false;
    }
}

/**
 * Require that a user is an admin, throw error if not
 * @param clerkUserId - The Clerk user ID
 * @throws Error if user is not admin
 */
export async function requireAdmin(clerkUserId: string): Promise<void> {
    const admin = await isAdmin(clerkUserId);
    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
}

