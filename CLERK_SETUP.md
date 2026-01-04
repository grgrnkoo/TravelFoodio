# Clerk Setup Instructions

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Clerk Authentication
# Get these from https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Configuration
# Sign-in and sign-up URLs (custom pages)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/user
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/user/onboarding
```

## Clerk Dashboard Configuration

### Step 1: Create Application
1. Go to https://dashboard.clerk.com/
2. Create a new application or select your existing application

### Step 2: Configure Authentication Methods
3. **Email Magic Links**:
   - Go to "Configure" → "Email, Phone, Username"
   - Toggle ON "Email address"
   - Under "Authentication strategies", enable "Email verification link"
   - Make sure "Email verification code" is also enabled (optional)

4. **Google OAuth**:
   - Go to "Configure" → "SSO Connections"
   - Click "+ Add connection"
   - Select "Google"
   - Follow the prompts to set up Google OAuth (you'll need Google Cloud Console credentials)
   - Make sure to add your development URL (e.g., `http://localhost:3000`) and production URLs to authorized redirect URIs

### Step 3: Configure URLs and Redirects
5. Go to "Configure" → "Paths":
   - **Sign-in URL**: `/login`
   - **Sign-up URL**: `/login`
   - **After sign-in URL**: `/user`
   - **After sign-up URL**: `/user/onboarding`

6. **Important**: Make sure "Allow sign up" is toggled ON if you want new users to register

### Step 4: Get API Keys
7. Go to "Configure" → "API Keys"
   - Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - Add these to your `.env.local` file

### Step 5: Configure Session Settings (Optional)
8. Go to "Configure" → "Sessions"
   - Adjust session lifetime if needed (default is usually fine)
   - Multi-session handling: Choose based on your needs

### Step 6: Set Up Webhooks (Important!)
9. Go to "Configure" → "Webhooks"
   - Click "Add Endpoint"
   - Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk` (for dev: use ngrok or expose localhost)
   - Subscribe to these events:
     - `user.created` (automatically create user in MongoDB)
     - `user.updated` (sync user data changes)
     - `user.deleted` (optional - handle user deletion)
   - Copy the "Signing Secret" and add to `.env.local`:
     ```bash
     CLERK_WEBHOOK_SECRET=whsec_...
     ```
   
   **For local development:**
   - Use [ngrok](https://ngrok.com/) to expose your localhost: `ngrok http 3000`
   - Use the ngrok URL in Clerk webhook settings: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`

## User Metadata

The application stores `onboardingCompleted` in Clerk's public metadata. This is automatically synced when users complete onboarding.

## Troubleshooting

### Email Magic Links Not Working
- Make sure "Email verification link" is enabled in Clerk dashboard under "Email, Phone, Username"
- Check that your redirect URLs are correctly configured
- Verify that emails aren't going to spam folder
- Check Clerk dashboard logs for any errors

### Google OAuth Not Redirecting
- Ensure you've added `http://localhost:3000` (or your domain) to Google Cloud Console's authorized redirect URIs
- In Clerk, make sure Google connection is properly configured with valid Client ID and Secret
- Check that `/sso-callback` route is accessible and not blocked by middleware
- Verify redirect URLs are correct in the code

### "Not Authenticated" After Login
- Check that middleware is correctly configured to allow `/sso-callback` route
- Verify Clerk environment variables are set correctly
- Check browser console for any errors
- Make sure cookies are enabled in browser

### Users Can't Access /user Routes
- Ensure middleware isn't blocking authenticated routes
- Check that `onboardingCompleted` is correctly set in Clerk public metadata
- Verify user is properly authenticated (check Clerk dashboard → Users)

## Migration from NextAuth

If you have existing users in MongoDB from NextAuth, you need to:

1. Run the migration script to create Clerk accounts for existing users
2. The script will sync user data and add `clerkUserId` to MongoDB documents
3. Users will need to sign in again with Clerk (they'll receive an email invitation)

See `scripts/migrate-to-clerk.ts` for the migration script.

## Testing Checklist

Before going live, test the following:

- [ ] Google OAuth sign-in works
- [ ] Email magic link sign-in works
- [ ] User gets redirected to `/user` after sign-in
- [ ] New users get redirected to `/user/onboarding`
- [ ] Onboarding flow completes successfully
- [ ] User data persists to MongoDB with `clerkUserId`
- [ ] Sign-out works correctly
- [ ] Protected routes require authentication
- [ ] Public routes are accessible without login

