import { initializeApp, getApps, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { credential } from 'firebase-admin'

// Firebase Admin configuration - server-side only
let adminApp: App | null = null
let adminAuth: Auth | null = null

export function getFirebaseAdmin(): { app: App; auth: Auth } {
  if (adminApp && adminAuth) {
    return { app: adminApp, auth: adminAuth }
  }

  try {
    // Check if admin app already exists
    const existingApps = getApps()
    if (existingApps.length > 0) {
      adminApp = existingApps[0]
      adminAuth = getAuth(adminApp)
      return { app: adminApp, auth: adminAuth }
    }

    console.log('🔑 Initializing Firebase Admin with environment variables...')

    // Create service account object from environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: 'googleapis.com'
    }

    // Validate required environment variables
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Missing required Firebase Admin SDK environment variables')
    }

    // Initialize Firebase Admin with the service account
    adminApp = initializeApp({
      credential: credential.cert(serviceAccount as any),
      projectId: process.env.FIREBASE_PROJECT_ID
    })

    adminAuth = getAuth(adminApp)
    
    console.log('✅ Firebase Admin initialized successfully')
    
    return { app: adminApp, auth: adminAuth }
  } catch (error) {
    console.error('💥 Firebase Admin initialization failed:', error)
    throw new Error(`Firebase Admin initialization failed: ${error}`)
  }
}

// Create a user with Firebase Admin (server-side only)
export async function createUserWithAdmin(
  email: string,
  password: string,
  displayName: string
): Promise<{ uid: string; email: string | undefined }> {
  try {
    const { auth } = getFirebaseAdmin()
    
    console.log('👤 Creating user with Firebase Admin:', email)
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    })
    
    console.log('✅ User created successfully:', userRecord.uid)
    
    return {
      uid: userRecord.uid,
      email: userRecord.email
    }
  } catch (error: any) {
    console.error('💥 Error creating user with Admin SDK:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }
}

// Verify ID token (for API authentication)
export async function verifyIdToken(idToken: string) {
  try {
    const { auth } = getFirebaseAdmin()
    const decodedToken = await auth.verifyIdToken(idToken)
    return decodedToken
  } catch (error: any) {
    console.error('💥 Error verifying ID token:', error)
    throw new Error(`Invalid token: ${error.message}`)
  }
}

// Get user by UID
export async function getUserByUid(uid: string) {
  try {
    const { auth } = getFirebaseAdmin()
    const userRecord = await auth.getUser(uid)
    return userRecord
  } catch (error: any) {
    console.error('💥 Error getting user by UID:', error)
    throw new Error(`Failed to get user: ${error.message}`)
  }
}

// Delete user (if needed for cleanup)
export async function deleteUser(uid: string) {
  try {
    const { auth } = getFirebaseAdmin()
    await auth.deleteUser(uid)
    console.log('✅ User deleted successfully:', uid)
  } catch (error: any) {
    console.error('💥 Error deleting user:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

export default getFirebaseAdmin