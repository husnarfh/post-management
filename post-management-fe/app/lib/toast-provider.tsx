'use client'

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import Toast from '../components/toast'

interface ToastContextType {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<'success' | 'error' | 'info'>('info')

  const showToast = (
    msg: string,
    toastType: 'success' | 'error' | 'info' = 'info'
  ) => {
    setMessage(msg)
    setType(toastType)
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} type={type} />}
    </ToastContext.Provider>
  )
}

// Custom hook
export const useToast = () => useContext(ToastContext)
