/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import fetchData from '@/app/utils/fetchData'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useToast } from '@/app/lib/toast-provider'
import styles from '../../page.module.css'

export default function View() {
  const params = useParams()
  const { push } = useRouter()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  const getPostById = async () => {
    const { id } = await params

    const res = await fetchData(
      `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/posts/${id}`
    )
    try {
      if (res.ok) {
        const post = await res.json()
        setTitle(post.title)
        setDescription(post.text_description)
        setThumbnail(
          `${process.env.NEXT_PUBLIC_LOCAL_API_URL}${post.thumbnail}`
        )
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch', 'error')
    }
  }

  useEffect(() => {
    getPostById()
  }, [])

  return (
    <>
      <div className="h-screen w-full justify-center p-10">
        <div className={`${styles.glass} card bg-base-100 w-full shadow-sm`}>
          <div className="card-body">
            <button
              className="btn btn-neutral w-fit"
              onClick={() => push('/posts')}
            >
              Back
            </button>

            <div className="flex gap-6">
              <div className="flex-initial">
                <Image
                  id="preview"
                  src={thumbnail}
                  alt="preview-img"
                  width={500}
                  height={500}
                />
              </div>
              <div className="flex-auto">
                <div className="grid justify-center">
                  <h2 className="text-center text-2xl font-bold mb-6">
                    {title}
                  </h2>
                  <p>{description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
