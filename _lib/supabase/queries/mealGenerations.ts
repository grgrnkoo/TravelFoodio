import { getSupabaseServerClient } from '../server';

const supabase = getSupabaseServerClient();

// Get meal generation count for a user on a specific date
export async function getMealGenerationCount(
    userId: string,
    date: string
): Promise<number> {
    const { count, error } = await supabase
        .from('meal_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('generation_date', date);

    if (error) {
        console.error('[getMealGenerationCount] Error:', error.message);
        return 0;
    }

    return count || 0;
}

// Record a meal generation
export async function recordMealGeneration(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('meal_generations')
            .insert({
                user_id: userId,
                generation_date: new Date().toISOString().split('T')[0],
            });

        if (error) {
            console.error('[recordMealGeneration] Error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[recordMealGeneration] Error:', message);
        return { success: false, error: message };
    }
}

