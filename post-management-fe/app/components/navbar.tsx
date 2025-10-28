'use client'
import Image from 'next/image'
import { useAuth } from '../lib/auth-context'
import styles from '../page.module.css'

export default function Navbar() {
  const { logout, user } = useAuth()

  return (
    <div className={`${styles.glass} navbar bg-base-100 shadow-sm`}>
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Posts Management</a>
      </div>
      <div className="flex gap-2">
        <div className="dropdown dropdown-end">
          <div className="flex flex-row gap-2 content-center">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <div className="w-auto rounded-full">
                <Image
                  alt="profile-picture"
                  src="/profile-picture.svg"
                  width={30}
                  height={30}
                />
              </div>
              <p>{user?.first_name}</p>
            </div>
          </div>

          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a onClick={logout}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
