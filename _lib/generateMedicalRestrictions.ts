import { MedicalRestrictionsFormatted, MedicalRestrictionsResponse } from './interfaces';

/**
 * Client-callable function to generate medical restrictions
 * Calls the protected API route /api/generateRestrictions
 * 
 * @param props - Object containing dietaryRestrictions and otherInfo
 * @returns Object with recommendations array or error
 */
export async function generateMedicalRestrictions(props: MedicalRestrictionsFormatted): Promise<MedicalRestrictionsResponse> {
    const { dietaryRestrictions, otherInfo, age } = props;
    
    try {
        // Validate input
        if (!dietaryRestrictions && !otherInfo) {
            throw new Error('At least one of dietaryRestrictions or otherInfo is required');
        }

        console.log('[generateMedicalRestrictions] Calling API route...');

        // Call the protected API route (use relative URL for client-side fetches in Next.js)
        const response = await fetch('/api/generateRestrictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dietaryRestrictions,
                otherInfo,
                age,
            }),
        });

        // Handle non-OK responses
        if (!response.ok) {
            let errorData;
            const contentType = response.headers.get('content-type');
            
            // Check if response is JSON
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            } else {
                // Got HTML or other non-JSON response (likely a routing error)
                const text = await response.text();
                console.error('[generateMedicalRestrictions] Non-JSON response:', text.substring(0, 200));
                errorData = { 
                    error: `API route error (${response.status})`,
                    details: 'Received HTML instead of JSON. Check API route configuration.'
                };
            }
            
            console.error('[generateMedicalRestrictions] API error:', errorData);
            
            // Return error in consistent format
            return {
                error: errorData.error || 'Failed to generate restrictions',
                details: errorData.details,
                status: response.status,
            };
        }

        // Parse successful response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('[generateMedicalRestrictions] Success response is not JSON');
            return {
                error: 'Invalid response format',
                details: 'Expected JSON but received ' + contentType,
                recommendations: [],
            };
        }

        const data = await response.json();
        console.log('[generateMedicalRestrictions] Successfully received restrictions:', data);

        // Validate response structure
        if (!data.recommendations || !Array.isArray(data.recommendations)) {

            console.error('[generateMedicalRestrictions] Invalid response structure:', data);
            return {
                error: 'Invalid response format',
                recommendations: [],
            };
        }

        return {
            recommendations: data.recommendations,
            success: true,
        };
    } catch (error) {
        console.error('[generateMedicalRestrictions] Error:', error);
        
        if (error instanceof Error) {
            return {
                error: error.message,
                recommendations: [],
            };
        }
        
        return {
            error: 'An unknown error occurred',
            recommendations: [],
        };
    }
}