import { getSupabaseServerClient } from '../server'
import type { IFeedback } from '../../../types'

const supabase = getSupabaseServerClient()

// Create new feedback
export async function createFeedback(feedback: string, author?: string): Promise<IFeedback | null> {
    const { data, error } = await supabase
        .from('feedback')
        .insert({
            feedback,
            author: author || 'Not logged in',
        })
        .select()
        .single()

    if (error || !data) {
        console.error('[createFeedback] Error:', error?.message)
        return null
    }

    return {
        id: data.id,
        author: data.author || undefined,
        feedback: data.feedback,
        createdAt: data.created_at,
    }
}

// Get feedback with pagination
export async function getFeedbackPaginated(page: number = 1, limit: number = 10): Promise<{
    feedbacks: IFeedback[]
    total: number
    page: number
    totalPages: number
}> {
    const offset = (page - 1) * limit

    // Get count
    const { count: totalCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })

    const total = totalCount || 0

    // Get data
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('[getFeedbackPaginated] Error:', error.message)
        return {
            feedbacks: [],
            total: 0,
            page,
            totalPages: 0,
        }
    }

    return {
        feedbacks: (data || []).map(f => ({
            id: f.id,
            author: f.author || undefined,
            feedback: f.feedback,
            createdAt: f.created_at,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    }
}

