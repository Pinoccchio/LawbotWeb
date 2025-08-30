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
            role: metadata?.role || 'SUPER_ADMIN',
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
            phone_number: metadata?.phoneNumber || null,
            badge_number: metadata?.badgeNumber || '',
            rank: metadata?.rank || '',
            unit_id: metadata?.unitId || null,  // FIX: Changed from 'unit' to 'unit_id'
            region: metadata?.region || '',
            status: 'active',
            availability_status: 'available',  // ADD: Required field
            total_cases: 0,                    // ADD: Required field
            active_cases: 0,                   // ADD: Required field
            resolved_cases: 0,                 // ADD: Required field
            success_rate: 0.00,               // ADD: Required field
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

  // Validate user role access for specific dashboard type (legacy method - still used by other parts)
  static async validateUserAccess(firebaseUid: string, requiredRole: 'admin' | 'pnp'): Promise<{ isValid: boolean; userProfile: any | null; errorMessage?: string }> {
    try {
      console.log(`🔐 Validating access for role: ${requiredRole}, Firebase UID: ${firebaseUid}`)
      
      const userProfile = await this.getUserProfile(firebaseUid)
      console.log('👤 Retrieved user profile:', userProfile)
      
      if (!userProfile) {
        console.log('❌ No user profile found')
        return { 
          isValid: false, 
          userProfile: null, 
          errorMessage: 'User profile not found. Please contact support.' 
        }
      }

      console.log(`🔍 User type: ${userProfile.user_type}, Required: ${requiredRole === 'admin' ? 'ADMIN' : 'PNP_OFFICER'}`)

      // Check if user has the required role
      if (requiredRole === 'admin' && userProfile.user_type === 'ADMIN') {
        console.log('✅ Admin access granted')
        return { isValid: true, userProfile }
      }
      
      if (requiredRole === 'pnp' && userProfile.user_type === 'PNP_OFFICER') {
        console.log('✅ PNP access granted')
        return { isValid: true, userProfile }
      }

      // User doesn't have the required role
      const currentRole = userProfile.user_type === 'ADMIN' ? 'Administrator' : 
                         userProfile.user_type === 'PNP_OFFICER' ? 'PNP Officer' : 'Regular User'
      const requiredRoleText = requiredRole === 'admin' ? 'Administrator' : 'PNP Officer'
      
      console.log(`❌ Access denied. Current: ${currentRole}, Required: ${requiredRoleText}`)
      
      return { 
        isValid: false, 
        userProfile, 
        errorMessage: `Access denied. Your account (${currentRole}) doesn't have access to the ${requiredRoleText} dashboard. Please use the correct login portal for your role.` 
      }
    } catch (error: any) {
      console.error('💥 Error in validateUserAccess:', error)
      return { 
        isValid: false, 
        userProfile: null, 
        errorMessage: `Authentication error: ${error.message}` 
      }
    }
  }

  // Determine user role from profile (new method for single login system)
  static async determineUserRole(firebaseUid: string): Promise<{ role: 'admin' | 'pnp' | null; userProfile: any | null; errorMessage?: string }> {
    try {
      console.log('🔍 Determining user role for Firebase UID:', firebaseUid)
      
      const userProfile = await this.getUserProfile(firebaseUid)
      console.log('👤 Retrieved user profile:', userProfile)
      
      if (!userProfile) {
        console.log('❌ No user profile found')
        return { 
          role: null, 
          userProfile: null, 
          errorMessage: 'No profile found for your account. Please contact support to complete your registration.' 
        }
      }

      // Determine role based on user_type
      let role: 'admin' | 'pnp' | null = null
      if (userProfile.user_type === 'ADMIN') {
        role = 'admin'
        console.log('✅ User identified as Administrator')
      } else if (userProfile.user_type === 'PNP_OFFICER') {
        role = 'pnp'
        console.log('✅ User identified as PNP Officer')
      } else {
        console.log('❌ Invalid user type:', userProfile.user_type)
        return {
          role: null,
          userProfile,
          errorMessage: 'Your account type is not authorized for this portal. Please contact support.'
        }
      }

      return { role, userProfile }
    } catch (error: any) {
      console.error('💥 Error in determineUserRole:', error)
      return { 
        role: null, 
        userProfile: null, 
        errorMessage: `Error retrieving account information: ${error.message}` 
      }
    }
  }

  // Get user profile from Supabase - checks all profile tables
  static async getUserProfile(firebaseUid: string) {
    try {
      console.log('🔍 Looking up user profile for Firebase UID:', firebaseUid)
      
      // Use Promise.race with a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile lookup timeout')), 5000)
      })
      
      const profileLookup = async () => {
        // First try admin_profiles table - this is the most likely for web app users
        console.log('📋 Checking admin_profiles table...')
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .maybeSingle()
  
        if (adminData && !adminError) {
          console.log('✅ Found admin profile')
          return { ...adminData, user_type: 'ADMIN', profile_source: 'admin_profiles' }
        }
  
        // Then try pnp_officer_profiles table
        console.log('👮 Checking pnp_officer_profiles table...')
        const { data: pnpData, error: pnpError } = await supabase
          .from('pnp_officer_profiles')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .maybeSingle()
  
        if (pnpData && !pnpError) {
          console.log('✅ Found PNP profile')
          return { ...pnpData, user_type: 'PNP_OFFICER', profile_source: 'pnp_officer_profiles' }
        }
  
        // Finally try regular user_profiles table (for mobile app users)
        console.log('👤 Checking user_profiles table...')
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .maybeSingle()
  
        if (userData && !userError) {
          console.log('✅ Found user profile')
          return { ...userData, profile_source: 'user_profiles' }
        }
  
        // If user not found in any table
        console.log('❌ User not found in any profile table')
        return null
      }

      // Use Promise.race to handle timeouts
      return await Promise.race([profileLookup(), timeoutPromise]) as any
    } catch (error: any) {
      if (error.message === 'Profile lookup timeout') {
        console.error('⏱️ Profile lookup timed out')
        return null
      }
      console.error('💥 Error in getUserProfile:', error)
      return null // Return null instead of throwing to prevent crashes
    }
  }

  // Debug method to check table existence and structure
  static async debugDatabaseTables() {
    try {
      console.log('🔍 Testing database table access...')
      
      // Test admin_profiles table
      const { data: adminTest, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .limit(1)
      
      console.log('📋 admin_profiles table test:', { adminTest, adminError })
      
      // Test pnp_officer_profiles table  
      const { data: pnpTest, error: pnpError } = await supabase
        .from('pnp_officer_profiles')
        .select('*')
        .limit(1)
        
      console.log('👮 pnp_officer_profiles table test:', { pnpTest, pnpError })
      
      // Test user_profiles table
      const { data: userTest, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)
        
      console.log('👤 user_profiles table test:', { userTest, userError })
      
      return { adminError, pnpError, userError }
    } catch (error) {
      console.error('💥 Database test failed:', error)
      return { error }
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