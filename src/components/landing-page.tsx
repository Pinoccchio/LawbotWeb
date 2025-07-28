"use client"

import React, { useState } from "react"
import { Shield, Sun, Moon, BarChart3, Users, Lock, Zap, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/contexts/AuthContext" 
import { AuthService } from "@/lib/auth"

interface LandingPageProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export function LandingPage({ onViewChange, isDark, toggleTheme }: LandingPageProps) {
  const { user, signOut } = useAuth()
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; userType: "admin" | "pnp" }>({
    isOpen: false,
    userType: "admin",
  })
  const [authError, setAuthError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Debug database tables on component mount
  React.useEffect(() => {
    AuthService.debugDatabaseTables()
  }, [])

  const handleLoginClick = (userType: "admin" | "pnp") => {
    setAuthError(null)
    setLoginModal({ isOpen: true, userType })
  }

  const handleLoginSuccess = async (userType: "admin" | "pnp") => {
    setIsValidating(true)
    setAuthError(null)
    
    try {
      // Get current user from Firebase auth directly to avoid race conditions
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        console.error('❌ No current user found after login')
        setAuthError("Authentication failed. Please try again.")
        setIsValidating(false)
        // Keep modal open to show error
        return
      }

      console.log(`🔐 Validating ${userType} access for user:`, currentUser.uid)

      try {
        // Validate user has the correct role for the requested dashboard
        const { isValid, userProfile, errorMessage } = await AuthService.validateUserAccess(currentUser.uid, userType)
        
        if (isValid && userProfile) {
          // Success - user has correct role
          console.log(`✅ Access granted for ${userType} dashboard`, userProfile)
          
          // IMPORTANT: Instead of closing the modal and showing the general loading screen,
          // we keep the modal open with its own loading state until we're ready to switch views
          // Then redirect to the appropriate dashboard (this will trigger the view change)
          onViewChange(userType)
          
          // Close the modal only after the view change has been triggered
          setLoginModal({ isOpen: false, userType })
          // Then clear loading state
          setAuthError(null)
          setIsValidating(false)
        } else {
          // Access denied - user doesn't have required role
          console.log(`❌ Access denied: ${errorMessage}`)
          setAuthError(errorMessage || 'Access denied')
          setIsValidating(false)
          
          // IMPORTANT: Keep modal open to show the error message
          // The modal will only be closed when the user clicks the close button
          // or when authentication is successful
        }
      } catch (error: any) {
        // Error during role validation
        console.error('❌ Role validation error:', error)
        setAuthError(error.message || 'Authentication validation failed')
        setIsValidating(false)
        
        // Keep modal open to show error message
        return
      }
    } catch (error: any) {
      // Error getting current user
      console.error('❌ Auth error:', error)
      setAuthError('Authentication error: ' + (error.message || 'Unknown error'))
      setIsValidating(false)
      
      // Keep modal open to show error message
      return
    }
  }

  const handleCloseModal = () => {
    // Don't allow closing while validation is in progress
    if (isValidating) {
      console.log('⚠️ Cannot close modal while validation is in progress')
      return
    }
    
    console.log('🔒 Closing login modal')
    // Reset all form state when closing the modal
    setLoginModal({ isOpen: false, userType: loginModal.userType })
    setAuthError(null)
    setIsValidating(false)
  }

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "AI-Powered Case Routing",
      description: "Automatic case assignment to specialized PNP units using Gemini AI analysis",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards with priority-based case management and performance metrics",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Evidence Management",
      description: "End-to-end encrypted evidence handling with chain of custody tracking",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Role Access",
      description: "Role-based access for Admins, PNP Officers, and seamless mobile app integration",
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "5-Status Workflow",
      description: "Streamlined case progression from Pending to Resolution with automated notifications",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Advanced Security",
      description: "GDPR compliant with comprehensive audit trails and multi-factor authentication",
    },
  ]

  const stats = [
    { label: "Active Cases", value: "1,247", change: "+12%" },
    { label: "Resolved This Month", value: "89", change: "+23%" },
    { label: "PNP Units", value: "10", change: "100%" },
    { label: "Response Time", value: "2.4hrs", change: "-15%" },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LawBot Web
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => handleLoginClick("admin")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
              <Button
                onClick={() => handleLoginClick("pnp")}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
              >
                <Users className="mr-2 h-4 w-4" />
                PNP Officer Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lawbot-blue-50 via-white to-lawbot-purple-50 dark:from-lawbot-slate-900 dark:via-lawbot-slate-800 dark:to-lawbot-slate-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-pattern-grid opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-lawbot-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-lawbot-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-lawbot-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-8 bg-gradient-to-r from-lawbot-blue-100 to-lawbot-purple-100 text-lawbot-blue-800 dark:from-lawbot-blue-900 dark:to-lawbot-purple-900 dark:text-lawbot-blue-200 border-0 px-6 py-2 text-sm font-semibold animate-bounce-subtle">
            🚔 Cybercrime Case Management System
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-lawbot-slate-900 dark:text-white mb-8 leading-tight animate-fade-in-up">
            Advanced Cybercrime
            <span className="block bg-gradient-to-r from-lawbot-blue-600 via-lawbot-purple-600 to-lawbot-blue-700 bg-clip-text text-transparent">
              Investigation Platform
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            AI-powered case management system for PNP Officers and System Administrators. Automatic case routing,
            intelligent priority assignment, and comprehensive investigation tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Button
              size="lg"
              onClick={() => handleLoginClick("admin")}
              className="btn-gradient px-8 py-4 text-lg font-semibold"
            >
              <Shield className="mr-3 h-6 w-6" />
              Access Admin Dashboard
              <ChevronRight className="ml-3 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => handleLoginClick("pnp")}
              variant="outline"
              className="border-2 border-lawbot-emerald-600 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-400 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20 px-8 py-4 text-lg font-semibold btn-modern"
            >
              <Users className="mr-3 h-6 w-6" />
              PNP Officer Portal
            </Button>
          </div>
          
          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">{stat.label}</div>
                <div className="text-xs lg:text-sm text-lawbot-emerald-600 dark:text-lawbot-emerald-400 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-lawbot-slate-50 to-lawbot-blue-50 dark:from-lawbot-slate-900 dark:to-lawbot-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-blue-100 text-lawbot-emerald-800 dark:from-lawbot-emerald-900 dark:to-lawbot-blue-900 dark:text-lawbot-emerald-200 border-0">
              🔧 Advanced Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-lawbot-slate-900 to-lawbot-blue-800 bg-clip-text text-transparent dark:from-white dark:to-lawbot-blue-400 mb-6">
              Powerful Investigation Tools
            </h2>
            <p className="text-xl lg:text-2xl text-lawbot-slate-600 dark:text-lawbot-slate-400 max-w-3xl mx-auto">
              Comprehensive features designed for modern cybercrime investigation and case management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-interactive bg-white/90 dark:bg-lawbot-slate-800/90 backdrop-blur-sm border-lawbot-slate-200 dark:border-lawbot-slate-700 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="p-3 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-purple-500 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white group-hover:text-lawbot-blue-600 dark:group-hover:text-lawbot-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced AI Predictive Section */}
      <section className="py-20 bg-white dark:bg-lawbot-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-lawbot-purple-100 to-lawbot-pink-100 text-lawbot-purple-800 dark:from-lawbot-purple-900 dark:to-lawbot-pink-900 dark:text-lawbot-purple-200 border-0 px-6 py-2 text-sm font-semibold">
              🤖 AI-Powered Intelligence
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-lawbot-purple-600 via-lawbot-pink-600 to-lawbot-purple-700 bg-clip-text text-transparent mb-6">
              Predictive Case Analysis
            </h2>
            <p className="text-xl lg:text-2xl text-lawbot-slate-600 dark:text-lawbot-slate-400 max-w-3xl mx-auto mb-8">
              Our AI system automatically analyzes reports, assigns priorities, and suggests action plans
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 How It Works:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      The AI reads the report and checks for keywords, time, and details.
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">It marks it as:</span>
                  </li>
                  <li className="ml-6 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">High Priority</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Medium Priority</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Low Priority</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">Then it gives a suggested action plan.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔮 Example Output:</h3>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Report #1053</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">High</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Action:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      Assign to Cybercrime Unit – Region 4A
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">Respond within 2 hours</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Next Steps:</span>
                    <ul className="ml-4 mt-1 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• "Call the victim"</li>
                      <li>• "Check attached files"</li>
                      <li>• "Report to supervisor if phishing is confirmed"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 dark:from-slate-950 dark:to-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">LawBot Web</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Advanced cybercrime investigation platform for law enforcement agencies.
            </p>
            <p className="text-gray-500 text-xs">
              &copy; 2025 LawBot Web. All rights reserved. | Philippine National Police Cybercrime Division
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={handleCloseModal}
        userType={loginModal.userType}
        onLogin={handleLoginSuccess}
        authError={authError}
        isValidating={isValidating}
      />

      {/* Loading Overlay */}
      {isValidating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-slate-900 dark:text-white font-medium">Validating access...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}