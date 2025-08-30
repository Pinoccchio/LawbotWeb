"use client"

import React, { useState } from "react"
import { Shield, Sun, Moon, BarChart3, Users, Lock, Zap, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/contexts/AuthContext" 
import { AuthService } from "@/lib/auth"
import { MobileAppSection } from "@/components/mobile-app-section"
import { useLandingData } from "@/hooks/useLandingData"

interface LandingPageProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export function LandingPage({ onViewChange, isDark, toggleTheme }: LandingPageProps) {
  const { user, signOut } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = useLandingData()
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  })
  const [authError, setAuthError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Debug database tables on component mount
  React.useEffect(() => {
    AuthService.debugDatabaseTables()
  }, [])

  const handleLoginClick = () => {
    setAuthError(null)
    setLoginModal({ isOpen: true })
  }

  const handleLoginSuccess = async () => {
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

      console.log('🔍 Determining user role for:', currentUser.uid)

      try {
        // Use new determineUserRole method for cleaner role detection
        const { role, userProfile, errorMessage } = await AuthService.determineUserRole(currentUser.uid)
        
        if (role && userProfile) {
          console.log(`🚀 Redirecting to ${role} dashboard`)
          onViewChange(role)
          
          // Close the modal
          setLoginModal({ isOpen: false })
          setAuthError(null)
          setIsValidating(false)
        } else {
          console.log('❌ Role determination failed:', errorMessage)
          setAuthError(errorMessage || 'Unable to determine account permissions.')
          setIsValidating(false)
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
    setLoginModal({ isOpen: false })
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

  // Dynamic stats from database with fallback data
  const dynamicStats = [
    { 
      label: "Active Cases", 
      value: stats?.activeCases?.toLocaleString() || "1,247", 
      change: stats?.activeCasesChange || "+12%"
    },
    { 
      label: "Resolved This Month", 
      value: stats?.resolvedThisMonth?.toString() || "89", 
      change: stats?.resolvedThisMonthChange || "+23%"
    },
    { 
      label: "PNP Units", 
      value: stats?.pnpUnits?.toString() || "10", 
      change: "100%" 
    },
    { 
      label: "Response Time", 
      value: stats?.avgResponseTime || "2.4hrs", 
      change: stats?.avgResponseTimeChange || "-15%"
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  LawBot Web
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Cybercrime Investigation Platform
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6 mr-4">
                <a href="#features" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors duration-200">Features</a>
                <a href="#ai-analysis" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors duration-200">AI Analysis</a>
                <a href="#mobile-app" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors duration-200">Mobile App</a>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme}
                className="h-10 w-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <div className="hidden sm:flex items-center">
                <Button
                  onClick={handleLoginClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Portal Access
                </Button>
              </div>
              
              {/* Mobile Login Button */}
              <div className="sm:hidden">
                <Button
                  onClick={handleLoginClick}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-pattern-grid opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900 dark:to-purple-900 dark:text-blue-200 border-0 px-6 py-2 text-sm font-semibold">
            🚔 Cybercrime Case Management System
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
            Advanced Cybercrime
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
              Investigation Platform
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI-powered cybercrime investigation platform for Philippine National Police. Featuring automatic case routing, intelligent priority assessment, and comprehensive investigation tools.
          </p>
          
          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Error state - shows fallback data */}
            {statsError && (
              <div className="col-span-2 lg:col-span-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  📊 Showing cached statistics (database currently updating)
                </p>
              </div>
            )}
            {dynamicStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded h-10 w-20 mx-auto"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm lg:text-base text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-xs lg:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {statsLoading ? (
                    <div className="animate-pulse bg-emerald-200 dark:bg-emerald-800 rounded h-4 w-12 mx-auto"></div>
                  ) : (
                    stat.change
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 dark:from-emerald-900 dark:to-blue-900 dark:text-emerald-200 border-0">
              ⚡ Core Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent dark:from-white dark:to-blue-400 mb-6">
              Powerful Investigation Tools
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Essential tools built for efficient cybercrime investigation and seamless case management
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
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced AI Prescriptive Section */}
      <section id="ai-analysis" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 border-0 px-6 py-2 text-sm font-semibold">
              🧠 AI-Powered Analysis
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-6">
              Prescriptive Case Analytics
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Advanced AI automatically analyzes cybercrime reports, determines priority levels, and generates specific action plans for investigators
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🧠 How AI Analysis Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Report Analysis</h4>
                      <p className="text-gray-700 dark:text-gray-300">AI analyzes content, keywords, timestamps, and patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Priority Assignment</h4>
                      <p className="text-gray-700 dark:text-gray-300">Assigns High, Medium, or Low priority based on urgency and impact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Action Planning</h4>
                      <p className="text-gray-700 dark:text-gray-300">Generates specific, actionable recommendations and next steps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 Sample AI Output</h3>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-700">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">Case #CYB-2025-1053</div>
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1">HIGH PRIORITY</Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">📍 ASSIGNMENT</div>
                      <div className="font-semibold text-gray-900 dark:text-white">Cybercrime Investigation Unit – Region 4A</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">⏱️ RESPONSE TIME</div>
                      <div className="font-semibold text-red-600 dark:text-red-400">Respond within 2 hours</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">📋 RECOMMENDED ACTIONS</div>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Contact victim immediately for verification</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Analyze phishing email headers and attachments</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span>Coordinate with bank security team</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <div id="mobile-app">
        <MobileAppSection isDark={isDark} />
      </div>

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