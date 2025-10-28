'use client'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
}

export default function Toast({ message, type = 'info' }: ToastProps) {
  let toastClass = 'alert-info'
  if (type === 'success') toastClass = 'alert-success'
  if (type === 'error') toastClass = 'alert-error'

  return (
    <div className="toast toast-top toast-center z-50">
      <div className={`alert ${toastClass}`}>
        <span>{message}</span>
      </div>
    </div>
  )
}
