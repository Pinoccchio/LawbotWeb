import { initializeApp, getApps } from 'firebase/app'
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

// Initialize Firebase app (only once)
function initializeFirebaseApp() {
  // Check if Firebase has already been initialized
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const config = getFirebaseConfig()
  return initializeApp(config)
}

// Get Firebase Auth instance
function getFirebaseAuth(): Auth {
  const app = initializeFirebaseApp()
  return getAuth(app)
}

// Export auth instance (lazy initialization)
export const auth = getFirebaseAuth()

// Export app for other uses
export default initializeFirebaseApp()