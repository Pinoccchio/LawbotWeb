import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"

// Simplified font approach - using system fonts with optional Google Fonts
let fontClassName = "font-sans"
try {
  const { Inter } = require("next/font/google")
  const inter = Inter({ 
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
  })
  fontClassName = inter.className
} catch (error) {
  console.log("Using fallback system fonts")
}

export const metadata: Metadata = {
  title: "LawBot Web - Cybercrime Case Management System",
  description: "Advanced cybercrime investigation platform for PNP Officers and System Administrators",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontClassName}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
