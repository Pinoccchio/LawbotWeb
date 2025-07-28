import { 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User,
  UserCredential 
} from 'firebase/auth'
import { secondaryAuth } from './firebase'
import { supabase } from './supabase'

export interface SecondaryAuthError {
  code: string
  message: string
}

export class SecondaryAuthService {
  // Create PNP officer using secondary auth (doesn't affect admin session)
  static async createOfficerAccount(
    email: string, 
    password: string, 
    fullName: string, 
    metadata: {
      phoneNumber?: string
      badgeNumber: string
      rank: string
      unit: string
      region: string
    }
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      console.log('🔥 Creating officer account with secondary auth...')
      
      // Create user with secondary Firebase app
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        email, 
        password
      )
      const user = userCredential.user

      if (user) {
        console.log('✅ Firebase user created:', user.uid)
        
        // Update display name in Firebase Auth (secondary app)
        await updateProfile(user, {
          displayName: fullName
        })

        console.log('📝 Creating PNP officer profile in Supabase...')
        
        // Create PNP officer profile in Supabase
        await this.createPNPOfficerProfile({
          firebaseUid: user.uid,
          email: user.email || '',
          fullName,
          phoneNumber: metadata.phoneNumber || '',
          badgeNumber: metadata.badgeNumber,
          rank: metadata.rank,
          unit: metadata.unit,
          region: metadata.region
        })

        console.log('🔓 Signing out from secondary auth to avoid session conflicts...')
        
        // IMPORTANT: Sign out from secondary auth to avoid any session conflicts
        // This doesn't affect the primary admin session
        await signOut(secondaryAuth)

        console.log('✅ Officer account created successfully!')
        
        return { 
          success: true, 
          userId: user.uid 
        }
      }

      return { 
        success: false, 
        error: 'Failed to create user account' 
      }
    } catch (error: any) {
      console.error('💥 Secondary auth error:', error)
      
      // Ensure secondary auth is signed out even on error
      try {
        await signOut(secondaryAuth)
      } catch (signOutError) {
        console.error('Error signing out secondary auth:', signOutError)
      }
      
      return { 
        success: false, 
        error: this.handleFirebaseAuthException(error) 
      }
    }
  }

  // Create PNP officer profile in Supabase
  private static async createPNPOfficerProfile({
    firebaseUid,
    email,
    fullName,
    phoneNumber,
    badgeNumber,
    rank,
    unit,
    region
  }: {
    firebaseUid: string
    email: string
    fullName: string
    phoneNumber: string
    badgeNumber: string
    rank: string
    unit: string
    region: string
  }): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      const { error } = await supabase
        .from('pnp_officer_profiles')
        .insert({
          firebase_uid: firebaseUid,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          badge_number: badgeNumber,
          rank: rank,
          unit: unit,
          region: region,
          status: 'active',
          total_cases: 0,
          active_cases: 0,
          resolved_cases: 0,
          success_rate: 0.00,
          created_at: now,
          updated_at: now
        })

      if (error) {
        throw new Error(`Failed to create PNP officer profile: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to create PNP officer profile: ${error.message}`)
    }
  }

  // Handle Firebase Auth exceptions (matching main AuthService)
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

  // Get current secondary auth user (mostly for debugging)
  static getCurrentSecondaryUser(): User | null {
    return secondaryAuth.currentUser
  }

  // Debug method to check secondary auth state
  static debugSecondaryAuth() {
    console.log('🔍 Secondary Auth Debug:', {
      currentUser: secondaryAuth.currentUser,
      appName: secondaryAuth.app.name,
      config: secondaryAuth.config
    })
  }
}