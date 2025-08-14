"use client"

import React from 'react'
import { Smartphone, Download, Shield, Zap, Eye, Users, ExternalLink, QrCode } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRCodeComponent } from '@/components/ui/qr-code'

const APK_DOWNLOAD_URL = 'https://drive.google.com/file/d/1Lo1Tu4NDgolRpbcq8rStp0ii2Yhop7rm/view?usp=sharing'

interface MobileAppSectionProps {
  isDark: boolean
}

export function MobileAppSection({ isDark }: MobileAppSectionProps) {
  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered Reporting",
      description: "Smart forms that adapt based on crime type with AI evidence suggestions"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Secure Evidence Upload",
      description: "Upload up to 5 evidence files (25MB total) with encryption"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Real-time Case Tracking",
      description: "Track your complaint status through the 5-stage workflow"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Direct PNP Connection",
      description: "Automatic routing to specialized cybercrime units"
    }
  ]

  const specs = [
    { label: "Version", value: "1.2.0" },
    { label: "Platform", value: "Android 6.0+" },
    { label: "Size", value: "~58.6MB" },
    { label: "Updated", value: "August 2024" }
  ]

  const handleDownloadClick = () => {
    window.open(APK_DOWNLOAD_URL, '_blank')
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 dark:from-emerald-900 dark:to-blue-900 dark:text-emerald-200 border-0 px-6 py-2">
            📱 Mobile Application
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent dark:from-white dark:to-blue-400 mb-6 px-2">
            LawBot Mobile App
          </h2>
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Report cybercrimes on-the-go with our AI-powered mobile application. Available for immediate download.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* App Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Key Features
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  App Specifications
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  System requirements and app information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {spec.label}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleDownloadClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold flex-1 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="mr-3 h-6 w-6" />
                Download APK
                <ExternalLink className="ml-3 h-5 w-5" />
              </Button>
            </div>

            {/* Installation Instructions */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Installation Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li><strong>1.</strong> Download the APK file using the button above or QR code</li>
                  <li><strong>2.</strong> Enable "Install from Unknown Sources" in Android Settings</li>
                  <li><strong>3.</strong> Open the downloaded APK file and tap "Install"</li>
                  <li><strong>4.</strong> Create your account and start reporting cybercrimes</li>
                </ol>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> This app is optimized for Philippine users and includes localized content for PNP procedures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code and Download Section */}
          <div className="flex flex-col items-center space-y-8">
            <Card className="bg-white dark:bg-slate-800 shadow-2xl border-2 border-blue-200 dark:border-blue-700">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center">
                  <QrCode className="mr-2 h-6 w-6" />
                  Scan to Download
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Point your camera at the QR code to download directly
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeComponent 
                  value={APK_DOWNLOAD_URL} 
                  size={200}
                  className="shadow-lg border-4 border-white dark:border-slate-700"
                />
              </CardContent>
            </Card>

            {/* App Statistics */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-md text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  67+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Crime Types
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  10
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  PNP Units
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  5
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  AI Services
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  PNP Verified
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center">
                Official application approved by the Philippine National Police Cybercrime Division
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}