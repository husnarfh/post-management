'use client'
import Navbar from '../components/navbar'
import { withAuth } from '../lib/with-auth'
import { ToastProvider } from '../lib/toast-provider'
import { DialogProvider } from '../lib/dialog-provider'

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-gradient-to-br from-slate-100 to-slate-300">
      <Navbar />
      <ToastProvider>
        <DialogProvider>{children}</DialogProvider>
      </ToastProvider>
    </section>
  )
}

export default withAuth(RootLayout)
