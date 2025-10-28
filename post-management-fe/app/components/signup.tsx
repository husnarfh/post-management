'use client'

import { ChangeEvent, useState } from 'react'
import { VisibilityOff, Visibility, PhoneIphone } from '@mui/icons-material'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../lib/toast-provider'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}
export default function SignUp() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  })
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const { login } = useAuth()

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const visibleToggle = () => {
    setIsVisible(!isVisible)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const signupResponse = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/users`,
        {
          method: 'POST',
          body: JSON.stringify(formData),
        }
      )

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json()
        throw new Error(errorData.error || 'Sign up failed')
      }

      // Step 2: Automatically log in the user
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/users/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      )

      if (!loginResponse.ok) {
        showToast(
          'Account created but login failed. Please sign in manually.',
          'error'
        )
      } else {
        showToast('Account created successfully', 'success')
      }

      await login(formData.email, formData.password)

      // Force a page reload to update the auth context
      window.location.href = '/posts'
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to create account',
        'error'
      )
    }
  }

  return (
    <div>
      <h2 className="text-2xl/7 font-bold">Create Your Account</h2>
      <form className="my-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="flex-auto">
            <label>
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="First Name"
              required
              name="firstName"
              value={formData.firstName}
              className="input w-full my-2"
              onChange={handleChange}
            />
          </div>
          <div className="flex-auto">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              className="input w-full my-2"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid">
          <label>
            Email<span className="text-red-500">*</span>
          </label>
          <label className="input w-auto my-2 validator">
            <input
              type="email"
              placeholder="Email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <div className="validator-hint hidden mb-2 mt-0">
            Enter valid email address
          </div>
        </div>

        <div className="grid">
          <label>
            Password<span className="text-red-500">*</span>
          </label>
          <label className="input w-auto my-2 validator">
            <input
              type={isVisible ? 'text' : 'password'}
              placeholder="Password"
              required
              name="password"
              value={formData.password}
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              onChange={handleChange}
            />
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={visibleToggle}
            >
              {isVisible ? <Visibility /> : <VisibilityOff />}
            </button>
          </label>
          <p className="validator-hint hidden mb-2 mt-0">
            Must be more than 8 characters, including
            <br />
            At least one number <br />
            At least one lowercase letter <br />
            At least one uppercase letter
          </p>
        </div>

        <div className="grid">
          <label>Phone</label>
          <label className="input w-auto my-2">
            <PhoneIphone />
            <input
              type="tel"
              placeholder="Phone"
              name="phone"
              className="tabular-nums"
              pattern="[0-9]*"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
        </div>
        <button className="btn btn-primary btn-block mt-4" type="submit">
          Create an account
        </button>
      </form>
    </div>
  )
}
