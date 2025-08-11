"use client"

import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeComponentProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeComponent({ value, size = 200, className = '' }: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      if (canvasRef.current && value) {
        try {
          setError(null)
          await QRCode.toCanvas(canvasRef.current, value, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          })
        } catch (err) {
          console.error('Error generating QR code:', err)
          setError('Failed to generate QR code')
        }
      }
    }

    generateQRCode()
  }, [value, size])

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm text-center">QR Code Error</p>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`border-2 border-gray-200 rounded-lg shadow-sm ${className}`}
    />
  )
}