"use client"

import { useState, useEffect } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

let toastCounter = 0
const toastTimeouts = new Map<string, NodeJS.Timeout>()

const listeners: Array<(toasts: Toast[]) => void> = []
let memoryToasts: Toast[] = []

function dispatch(action: { type: "ADD_TOAST" | "REMOVE_TOAST"; toast?: Toast; id?: string }) {
  switch (action.type) {
    case "ADD_TOAST":
      if (action.toast) {
        memoryToasts = [...memoryToasts, action.toast]
        
        // Auto dismiss after 5 seconds
        const timeout = setTimeout(() => {
          dispatch({ type: "REMOVE_TOAST", id: action.toast!.id })
        }, 5000)
        
        toastTimeouts.set(action.toast.id, timeout)
      }
      break
    case "REMOVE_TOAST":
      if (action.id) {
        memoryToasts = memoryToasts.filter((t) => t.id !== action.id)
        
        // Clear timeout
        const timeout = toastTimeouts.get(action.id)
        if (timeout) {
          clearTimeout(timeout)
          toastTimeouts.delete(action.id)
        }
      }
      break
  }

  listeners.forEach((listener) => {
    listener(memoryToasts)
  })
}

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast(options: ToastOptions) {
  const id = String(toastCounter++)
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...options,
      id,
    },
  })
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "REMOVE_TOAST", id }),
  }
}

// Toast Component
export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] rounded-lg p-4 shadow-lg transition-all duration-300
            ${toast.variant === "destructive" 
              ? "bg-red-600 text-white" 
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-4 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}