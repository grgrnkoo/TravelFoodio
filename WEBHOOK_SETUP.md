# Clerk Webhook Setup

## Why Webhooks?

Clerk webhooks automatically sync user data between Clerk and your MongoDB database. When a user signs up in Clerk, the webhook will:
1. Automatically create the user in MongoDB with their `clerkUserId`
2. Keep user data in sync (name, email, profile picture)
3. Handle user updates and deletions

This is more reliable than client-side user creation and prevents race conditions.

## Setup Steps

### 1. Add Webhook Secret to Environment Variables

Add to your `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### 2. Configure Webhook in Clerk Dashboard

#### For Production:
1. Go to https://dashboard.clerk.com/
2. Navigate to "Configure" → "Webhooks"
3. Click "+ Add Endpoint"
4. Enter your production URL: `https://yourdomain.com/api/webhooks/clerk`
5. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted` (optional)
6. Click "Create"
7. Copy the "Signing Secret" (starts with `whsec_`)
8. Add it to your production environment variables

#### For Local Development:

Since Clerk needs to reach your localhost, you need to expose it using ngrok:

1. **Install ngrok** (if not already installed):
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (looks like `https://abc123.ngrok.io`)

5. **Add webhook in Clerk**:
   - Go to Clerk Dashboard → Webhooks
   - Click "+ Add Endpoint"
   - Enter: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Subscribe to `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret
   - Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_...`

6. **Restart your dev server** to load the new environment variable

### 3. Test the Webhook

1. Sign up a new user through your login page
2. Check your server console - you should see:
   ```
   📨 Webhook received: user.created
   ✅ Created new user from webhook: user@example.com
   ```
3. Check MongoDB - the user should be created with `clerkUserId`

### 4. Verify Webhook Status

In Clerk Dashboard:
- Go to "Configure" → "Webhooks"
- Click on your webhook endpoint
- Check the "Recent attempts" - they should show "200 OK"
- If you see errors, check the request/response details

## Troubleshooting

### Webhook Not Receiving Events
- **Check ngrok is running** (for local dev)
- **Verify webhook URL** is correct in Clerk dashboard
- **Check environment variable** `CLERK_WEBHOOK_SECRET` is set
- **Restart your server** after adding the webhook secret

### 401/403 Errors
- **Wrong signing secret** - Make sure you copied the correct secret from Clerk
- **Environment variable not loaded** - Restart your dev server

### User Not Created in MongoDB
- **Check server logs** for errors
- **Verify MongoDB connection** is working
- **Check Clerk webhook logs** in dashboard for the response

### ngrok Session Expired
- **Free ngrok URLs change** when you restart ngrok
- **Update webhook URL** in Clerk dashboard when ngrok URL changes
- **Consider ngrok paid plan** for static URLs, or use a staging server

## Alternative: Client-Side User Creation

If you can't use webhooks (e.g., development without ngrok), the app has a fallback:
- `UserProvider` will automatically create users in MongoDB when they first sign in
- This is less reliable than webhooks but works as a backup
- Users are created on first page load after authentication

## Production Checklist

- [ ] Webhook endpoint configured in Clerk dashboard
- [ ] Production webhook URL uses HTTPS
- [ ] `CLERK_WEBHOOK_SECRET` set in production environment
- [ ] Webhook events subscribed: `user.created`, `user.updated`
- [ ] Test webhook by creating a new user
- [ ] Verify user appears in MongoDB with `clerkUserId`
- [ ] Check webhook logs in Clerk dashboard show 200 responses

## Security Notes

- Webhooks are verified using the signing secret
- Never expose your webhook secret in client-side code
- The `/api/webhooks/clerk` route is public (not protected by auth middleware)
- Webhook signature verification prevents unauthorized requests

