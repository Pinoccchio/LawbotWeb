"use client"

import { useState } from "react"
import { Shield, Sun, Moon, BarChart3, Users, Lock, Zap, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginModal } from "@/components/auth/login-modal"

interface LandingPageProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export function LandingPage({ onViewChange, isDark, toggleTheme }: LandingPageProps) {
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; userType: "admin" | "pnp" }>({
    isOpen: false,
    userType: "admin",
  })

  const handleLoginClick = (userType: "admin" | "pnp") => {
    setLoginModal({ isOpen: true, userType })
  }

  const handleLoginSuccess = (userType: "admin" | "pnp") => {
    onViewChange(userType)
    setLoginModal({ isOpen: false, userType })
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
              <Button
                onClick={() => handleLoginClick("pnp")}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Users className="mr-2 h-4 w-4" />
                PNP Officer Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 border-0">
            🚔 Cybercrime Case Management System
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-12 leading-tight">
            Advanced Cybercrime
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Investigation Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            AI-powered case management system for PNP Officers and System Administrators. Automatic case routing,
            intelligent priority assignment, and comprehensive investigation tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleLoginClick("admin")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-105 transition-all"
            >
              <Shield className="mr-2 h-5 w-5" />
              Access Admin Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => handleLoginClick("pnp")}
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transform hover:scale-105 transition-all"
            >
              <Users className="mr-2 h-5 w-5" />
              PNP Officer Portal
            </Button>
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

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Investigation Tools
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive features designed for modern cybercrime investigation and case management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <CardHeader>
                  <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-slate-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Predictive Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200 border-0">
              🤖 AI-Powered Intelligence
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Predictive Case Analysis
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
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
        onClose={() => setLoginModal({ ...loginModal, isOpen: false })}
        userType={loginModal.userType}
        onLogin={handleLoginSuccess}
      />
    </div>
  )
}
