"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  /** The child component to display the badge on (usually an Icon) */
  children: React.ReactNode
  /** The notification count to display (0 = no badge shown) */
  count: number
  /** Custom badge background color (default: iOS red #FF3B30) */
  badgeColor?: string
  /** Custom text color (default: white) */
  textColor?: string
  /** Custom position offset for the badge */
  offset?: { top?: number; right?: number }
  /** Whether to show animation when count changes (default: true) */
  animated?: boolean
  /** Maximum count to display before showing "99+" (default: 99) */
  maxCount?: number
  /** Additional CSS classes */
  className?: string
}

export function NotificationBadge({
  children,
  count,
  badgeColor = '#FF3B30',
  textColor = 'white',
  offset = { top: -6, right: -6 },
  animated = true,
  maxCount = 99,
  className
}: NotificationBadgeProps) {
  // Don't show badge if count is 0 or negative
  if (count <= 0) {
    return <>{children}</>
  }

  // Format the display text (matches Flutter 99+ format)
  const displayText = count > maxCount ? `${maxCount}+` : count.toString()
  
  // Calculate badge size based on text length (made larger for better visibility)
  const isLargeNumber = count > 9 || count > maxCount
  const badgeSize = isLargeNumber ? 22 : 20

  const badgeElement = (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full text-xs font-semibold shadow-sm border-2 border-white dark:border-slate-800 z-50",
        animated && "transition-transform duration-300 ease-out",
        className
      )}
      style={{
        top: offset.top,
        right: offset.right,
        minWidth: badgeSize,
        minHeight: badgeSize,
        backgroundColor: badgeColor,
        color: textColor,
        fontSize: '11px',
        lineHeight: '1',
        paddingLeft: isLargeNumber ? '6px' : '4px',
        paddingRight: isLargeNumber ? '6px' : '4px',
        paddingTop: '2px',
        paddingBottom: '2px'
      }}
    >
      {displayText}
    </div>
  )

  // Add elastic animation if enabled (matches Flutter elasticOut curve)
  const animatedBadge = animated ? (
    <div
      className="animate-in zoom-in-50 duration-300"
      style={{
        animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // elasticOut
      }}
    >
      {badgeElement}
    </div>
  ) : badgeElement

  return (
    <div className="relative inline-flex items-center justify-center">
      {children}
      {animatedBadge}
    </div>
  )
}

/**
 * Specialized notification badge for header icons
 * Matches the mobile app's BottomNavNotificationBadge design
 */
export function HeaderNotificationBadge({
  children,
  count,
  className
}: {
  children: React.ReactNode
  count: number
  className?: string
}) {
  return (
    <NotificationBadge
      count={count}
      offset={{ top: -8, right: -8 }} // Adjusted for better visibility
      badgeColor="#FF3B30" // iOS red
      animated={true}
      className={cn("shadow-lg", className)}
    >
      {children}
    </NotificationBadge>
  )
}

/**
 * Pulsing notification badge for urgent notifications
 */
export function UrgentNotificationBadge({
  children,
  count,
  className
}: {
  children: React.ReactNode
  count: number
  className?: string
}) {
  return (
    <div className="relative">
      <NotificationBadge
        count={count}
        badgeColor="#FF3B30"
        animated={true}
        className={cn("animate-pulse", className)}
      >
        {children}
      </NotificationBadge>
      {count > 0 && (
        <div 
          className="absolute -inset-1 rounded-full animate-ping"
          style={{
            backgroundColor: '#FF3B30',
            opacity: 0.3,
            top: -7,
            right: -7,
            width: '20px',
            height: '20px'
          }}
        />
      )}
    </div>
  )
}

/**
 * Hook to easily add badges to any element
 */
export function useBadge(count: number, options?: Partial<NotificationBadgeProps>) {
  return React.useCallback((children: React.ReactNode) => (
    <NotificationBadge count={count} {...options}>
      {children}
    </NotificationBadge>
  ), [count, options])
}

/**
 * Utility function to get badge text (matches Flutter notificationBadgeText)
 */
export function getBadgeText(count: number, maxCount = 99): string {
  if (count <= 0) return ''
  return count > maxCount ? `${maxCount}+` : count.toString()
}

export default NotificationBadge