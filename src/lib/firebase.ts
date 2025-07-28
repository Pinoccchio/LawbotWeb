import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

// Firebase configuration function that validates environment variables
function getFirebaseConfig() {
  const requiredEnvVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return {
    apiKey: requiredEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: requiredEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: requiredEnvVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_APP_ID!
  }
}

// Initialize Primary Firebase app (only once)
function initializePrimaryApp(): FirebaseApp {
  // Check if primary app has already been initialized
  const existingApp = getApps().find(app => app.name === '[DEFAULT]')
  if (existingApp) {
    return existingApp
  }

  const config = getFirebaseConfig()
  return initializeApp(config)
}

// Initialize Secondary Firebase app (for user creation without affecting admin session)
function initializeSecondaryApp(): FirebaseApp {
  // Check if secondary app has already been initialized
  const existingApp = getApps().find(app => app.name === 'secondary')
  if (existingApp) {
    return existingApp
  }

  const config = getFirebaseConfig()
  return initializeApp(config, 'secondary')
}

// Get Primary Firebase Auth instance (for admin authentication)
function getPrimaryAuth(): Auth {
  const app = initializePrimaryApp()
  return getAuth(app)
}

// Get Secondary Firebase Auth instance (for creating new users)
function getSecondaryAuth(): Auth {
  const app = initializeSecondaryApp()
  return getAuth(app)
}

// Export primary auth instance (for admin authentication)
export const auth = getPrimaryAuth()

// Export secondary auth instance (for user creation)
export const secondaryAuth = getSecondaryAuth()

// Export apps for other uses
export const primaryApp = initializePrimaryApp()
export const secondaryApp = initializeSecondaryApp()

// Default export remains the primary app for backward compatibility
export default primaryApp