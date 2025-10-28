'use client'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import SignIn from './components/signin'
import SignUp from './components/signup'
import { useRouter } from 'next/navigation'
import { useAuth } from './lib/auth-context'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/posts')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null
  }

  return (
    <div
      className={`${styles.page} bg-gradient-to-br from-slate-100 to-slate-300`}
    >
      <main className={styles.main}>
        <div
          className={`card w-xl shadow-sm ${styles.bgHorizontal} ${styles.glass}`}
        >
          <div className="card-body">
            <div className="tabs tabs-box justify-center bg-transparent">
              <input
                type="radio"
                name="my_tabs_6"
                className="tab"
                aria-label="Sign Up"
                defaultChecked
              />
              <div className="tab-content p-6">
                <SignUp></SignUp>
              </div>

              <input
                type="radio"
                name="my_tabs_6"
                className="tab"
                aria-label="Sign In"
              />
              <div className="tab-content p-6">
                <SignIn></SignIn>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
