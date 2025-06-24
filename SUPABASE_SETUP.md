# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Infina PFA application.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New project"
3. Choose your organization
4. Set up your project:
   - **Name**: Infina PFA
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
5. Wait for the project to be created

### 2. Get Your Project Credentials

1. Go to Settings → API
2. Copy the following values:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Anon/Public Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Replace the placeholder values with your actual Supabase credentials

### 4. Set Up Authentication

The authentication is already configured in the codebase. Supabase will automatically create the necessary tables for authentication.

### 5. Configure Email Authentication (Optional)

If you want to customize email templates:

1. Go to Authentication → Settings
2. Configure SMTP settings if needed
3. Customize email templates under "Email Templates"

### 6. Test the Setup

1. Start your development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:3000/auth/sign-up`
3. Try creating a new account
4. Check your Supabase dashboard under Authentication → Users

## Features Implemented

✅ **Email/Password Authentication**

- Sign up with email verification
- Sign in with email/password
- Sign out functionality

✅ **Protected Routes**

- Dashboard page requires authentication
- Automatic redirection to sign-in page

✅ **UI Components**

- Flat design following Infina guidelines
- Responsive authentication forms
- Loading states and error handling

✅ **Authentication Context**

- Global authentication state management
- Real-time auth state updates

## File Structure

```
├── lib/
│   ├── supabase.ts              # Supabase client configuration
│   └── supabase/
│       ├── server.ts            # Server-side Supabase client
│       └── middleware.ts        # Authentication middleware
├── hooks/
│   └── use-auth.ts              # Authentication hook
├── components/
│   ├── auth/
│   │   ├── auth-form.tsx        # Reusable auth form
│   │   └── auth-layout.tsx      # Auth page layout
│   ├── providers/
│   │   └── auth-provider.tsx    # Authentication context provider
│   └── ui/
│       ├── auth-nav.tsx         # Navigation with auth states
│       └── header.tsx           # Main header component
├── app/
│   ├── auth/
│   │   ├── page.tsx             # Combined auth page
│   │   ├── sign-in/page.tsx     # Dedicated sign-in page
│   │   └── sign-up/page.tsx     # Dedicated sign-up page
│   └── dashboard/
│       └── page.tsx             # Protected dashboard page
└── middleware.ts                # Next.js middleware for auth
```

## Troubleshooting

**Authentication not working?**

- Check that your environment variables are set correctly
- Verify your Supabase project URL and keys
- Make sure your Supabase project is active

**Email verification not working?**

- Check your Supabase project's email settings
- Verify SMTP configuration if using custom SMTP

**Users not redirecting after login?**

- Check the middleware configuration
- Verify protected routes setup

## Next Steps

After successful setup, you can:

1. Customize the authentication UI
2. Add social login providers (Google, GitHub, etc.)
3. Implement user profiles and additional user data
4. Add role-based access control
5. Implement password reset functionality

For more advanced features, refer to the [Supabase Documentation](https://supabase.com/docs).
