import { getSupabaseServerClient } from '../server';

const supabase = getSupabaseServerClient();

// Get photo analysis count for a user on a specific date
export async function getPhotoAnalysisCount(
    userId: string,
    date: string
): Promise<number> {
    const { count, error } = await supabase
        .from('photo_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('analysis_date', date);

    if (error) {
        console.error('[getPhotoAnalysisCount] Error:', error.message);
        return 0;
    }

    return count || 0;
}

// Record a photo analysis
export async function recordPhotoAnalysis(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('photo_analyses')
            .insert({
                user_id: userId,
                analysis_date: new Date().toISOString().split('T')[0],
            });

        if (error) {
            console.error('[recordPhotoAnalysis] Error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[recordPhotoAnalysis] Error:', message);
        return { success: false, error: message };
    }
}

