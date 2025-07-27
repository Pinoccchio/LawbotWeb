# Environment Variables Setup Guide

## Understanding Environment Files

### `.env.example`
- **Purpose**: Template file showing required environment variables
- **Contains**: Placeholder values and variable names
- **Version Control**: ✅ **SHOULD** be committed to Git
- **Usage**: Copy this file to create your actual environment file

### `.env.local`
- **Purpose**: Your actual environment variables with real values
- **Contains**: Sensitive API keys, URLs, and secrets
- **Version Control**: ❌ **NEVER** commit to Git (should be in .gitignore)
- **Usage**: Used by Next.js during development and build

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual values:**
   ```bash
   # Open in your preferred editor
   nano .env.local
   # or
   code .env.local
   ```

3. **Replace all placeholder values** with your actual Firebase and Supabase credentials

## Where to Get Your Values

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `lawbotfirebase`
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your Apps** section
5. Click on your web app or **Add App** > **Web** if you haven't created one
6. Copy the config values:

```javascript
// Firebase config example
const firebaseConfig = {
  apiKey: "AIzaSyB...",           // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com", // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
  projectId: "project-id",        // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com", // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"      // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### Supabase Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lawbotfirebase` project
3. Go to **Settings** > **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

## Security Best Practices

### ✅ Safe for Client-Side (NEXT_PUBLIC_*)
These variables are exposed in the browser and should be non-sensitive:
- Firebase configuration (API keys are restricted by domain)
- Supabase URL and anon key (protected by Row Level Security)

### ⚠️ Server-Side Only
These should NEVER be exposed to the client:
- `SUPABASE_SERVICE_ROLE_KEY` - Has full database access
- Database passwords
- JWT secrets
- API secrets

## Example .env.local

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB7clmGkru3fQZAIJpfvOGlhgCkAb5VF8A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lawbotfirebase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lawbotfirebase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lawbotfirebase.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=940247359181
NEXT_PUBLIC_FIREBASE_APP_ID=1:940247359181:web:your_actual_web_app_id

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://knoahdsfthalbdqockmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Troubleshooting

### "Missing required environment variable" Error
- Check that all variables in `.env.local` are set
- Restart your development server after adding variables
- Verify variable names match exactly (case-sensitive)

### Firebase Authentication Not Working
- Verify your Firebase web app is configured
- Check that your domain is added to Firebase authorized domains
- Ensure `NEXT_PUBLIC_FIREBASE_APP_ID` is correct

### Supabase Connection Issues
- Verify your Supabase project URL is correct
- Check that your anon key is valid and not expired
- Ensure your database has proper Row Level Security policies

## Development vs Production

### Development (.env.local)
- Use your development Firebase project
- Point to development Supabase project
- Can use relaxed security settings

### Production (.env.production.local)
- Use production Firebase project
- Point to production Supabase project
- Implement strict security policies
- Use separate API keys and secrets

## .gitignore Configuration

Ensure your `.gitignore` includes:
```
# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local
.env
```

But NOT:
```
.env.example  # This should be committed
```