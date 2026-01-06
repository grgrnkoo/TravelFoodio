import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../../_lib/supabase/server';

export async function POST(req: Request) {
    // Get the Clerk webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('❌ Missing CLERK_WEBHOOK_SECRET environment variable');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error('❌ Missing svix headers');
        return NextResponse.json(
            { error: 'Missing svix headers' },
            { status: 400 }
        );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the webhook signature
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('❌ Error verifying webhook:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle the webhook events
    const eventType = evt.type;
    console.log(`📨 Webhook received: ${eventType}`);

    try {
        const supabase = getSupabaseServerClient();

        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;
            
            const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
            
            if (!primaryEmail?.email_address) {
                console.error('❌ No primary email found for user');
                return NextResponse.json(
                    { error: 'No primary email found' },
                    { status: 400 }
                );
            }

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .or(`clerk_user_id.eq.${id},email.eq.${primaryEmail.email_address}`)
                .single();

            if (existingUser) {
                // Update with clerkUserId if they don't have one
                if (!existingUser.clerk_user_id) {
                    await supabase
                        .from('users')
                        .update({ clerk_user_id: id })
                        .eq('id', existingUser.id);
                    console.log(`✅ Updated existing user with clerkUserId: ${primaryEmail.email_address}`);
                } else {
                    console.log(`ℹ️  User already exists: ${primaryEmail.email_address}`);
                }
            } else {
                // Create new user
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        clerk_user_id: id,
                        email: primaryEmail.email_address,
                        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || '',
                        image: image_url || '',
                        onboarding1_completed: false,
                        onboarding2_completed: false,
                        updates_remaining: 0,
                        subscription_type: 'free',
                    });

                if (insertError) {
                    console.error('❌ Error creating user:', insertError.message);
                    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
                }

                console.log(`✅ Created new user from webhook: ${primaryEmail.email_address}`);
            }

            return NextResponse.json({ message: 'User synced successfully' }, { status: 200 });
        }

        if (eventType === 'user.updated') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;
            
            const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);

            if (!primaryEmail?.email_address) {
                console.error('❌ No primary email found for user');
                return NextResponse.json({ error: 'No primary email found' }, { status: 400 });
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    email: primaryEmail.email_address,
                    name: first_name && last_name ? `${first_name} ${last_name}` : first_name || '',
                    image: image_url || '',
                })
                .eq('clerk_user_id', id);

            if (updateError) {
                console.error('❌ Error updating user:', updateError.message);
            } else {
                console.log(`✅ Updated user from webhook: ${primaryEmail.email_address}`);
            }

            return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
        }

        if (eventType === 'user.deleted') {
            const { id } = evt.data;
            
            if (!id) {
                return NextResponse.json({ message: 'User deletion noted (no ID)' }, { status: 200 });
            }

            // Get user info before potential deletion
            const { data: user } = await supabase
                .from('users')
                .select('email')
                .eq('clerk_user_id', id)
                .single();

            if (user) {
                console.log(`⚠️  User deleted in Clerk: ${user.email}`);
                // Optionally delete from Supabase:
                // await supabase.from('users').delete().eq('clerk_user_id', id);
            }

            return NextResponse.json({ message: 'User deletion noted' }, { status: 200 });
        }

        // Return success for other event types
        return NextResponse.json({ message: 'Webhook received' }, { status: 200 });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
