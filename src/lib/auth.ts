import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  User,
  UserCredential 
} from 'firebase/auth'
import { auth } from './firebase'
import { supabase } from './supabase'

export interface AuthError {
  code: string
  message: string
}

export class AuthService {
  // Sign up with email and password
  static async signUpWithEmail(email: string, password: string, fullName: string, userType: string = 'CLIENT', metadata?: any): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        // Update display name in Firebase Auth
        await updateProfile(user, {
          displayName: fullName
        })

        // Create user profile in appropriate table based on user type
        if (userType === 'ADMIN' || userType === 'PNP_OFFICER') {
          await this.createAdminOrPNPProfile({
            firebaseUid: user.uid,
            email: user.email || '',
            fullName,
            userType,
            metadata
          })
        } else {
          // Create regular user profile
          await this.createUserProfile({
            firebaseUid: user.uid,
            email: user.email || '',
            fullName,
            phoneNumber: metadata?.phoneNumber || '',
            userType
          })
        }
      }

      return user
    } catch (error: any) {
      throw this.handleFirebaseAuthException(error)
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      throw this.handleFirebaseAuthException(error)
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw this.handleFirebaseAuthException(error)
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw this.handleFirebaseAuthException(error)
    }
  }

  // Create user profile in Supabase (matching Flutter implementation)
  static async createUserProfile({
    firebaseUid,
    email,
    fullName,
    phoneNumber,
    userType = 'CLIENT'
  }: {
    firebaseUid: string
    email: string
    fullName: string
    phoneNumber: string
    userType?: string
  }): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          firebase_uid: firebaseUid,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          user_type: userType,
          user_status: 'active',
          last_active: now,
          created_at: now,
          updated_at: now
        })

      if (error) {
        throw new Error(`Failed to create user profile: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }
  }

  // Create admin or PNP officer profile
  static async createAdminOrPNPProfile({
    firebaseUid,
    email,
    fullName,
    userType,
    metadata
  }: {
    firebaseUid: string
    email: string
    fullName: string
    userType: string
    metadata?: any
  }): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      if (userType === 'ADMIN') {
        // Create admin profile
        const { error } = await supabase
          .from('admin_profiles')
          .insert({
            firebase_uid: firebaseUid,
            email,
            full_name: fullName,
            phone_number: metadata?.phoneNumber || '',
            role: metadata?.role || 'SYSTEM_ADMIN',
            status: 'active',
            created_at: now,
            updated_at: now
          })

        if (error) {
          throw new Error(`Failed to create admin profile: ${error.message}`)
        }
      } else if (userType === 'PNP_OFFICER') {
        // Create PNP officer profile
        const { error } = await supabase
          .from('pnp_officer_profiles')
          .insert({
            firebase_uid: firebaseUid,
            email,
            full_name: fullName,
            phone_number: metadata?.phoneNumber || '',
            badge_number: metadata?.badgeNumber || '',
            rank: metadata?.rank || '',
            unit: metadata?.unit || '',
            region: metadata?.region || '',
            status: 'active',
            created_at: now,
            updated_at: now
          })

        if (error) {
          throw new Error(`Failed to create PNP officer profile: ${error.message}`)
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to create ${userType} profile: ${error.message}`)
    }
  }

  // Get user profile from Supabase
  static async getUserProfile(firebaseUid: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to get user profile: ${error.message}`)
      }

      return data
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`)
    }
  }

  // Handle Firebase Auth exceptions (matching Flutter implementation)
  private static handleFirebaseAuthException(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No user found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.'
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.'
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.'
      case 'auth/invalid-credential':
        return 'Invalid login credentials. Please check your email and password.'
      default:
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }
}