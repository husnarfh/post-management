/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import fetchData from '@/app/utils/fetchData'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import styles from '../../page.module.css'
import { useToast } from '@/app/lib/toast-provider'

export default function New(props: { isEdit: boolean }) {
  const { push } = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [preview, setPreview] = useState('')
  const fileSizeMessage = document.getElementById('fileSizeMessage')
  const [isDisable, setIsDisable] = useState<boolean>(true)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    const fileSizeMB = file.size / (1024 * 1024) // Convert bytes to MB

    if (fileSizeMB > 5) {
      fileSizeMessage.textContent = `File size exceeds ${5}MB. Please choose a smaller file.`
      fileSizeMessage.style.color = 'red'
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setThumbnail(file)
  }

  const createPost = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()

    formData.append('title', title)
    formData.append('description', description)
    formData.append('thumbnail', thumbnail)

    try {
      const res = await fetchData(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/posts`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        showToast(errorData.error || 'Failed to create new post', 'error')
      } else {
        showToast('New post created successfully', 'success')
        push('/posts')
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to create new post',
        'error'
      )
    }
  }

  const editPost = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    const { id } = await params

    formData.append('title', title)
    formData.append('description', description)
    formData.append('thumbnail', thumbnail)

    try {
      const res = await fetchData(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/posts/${id}`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        showToast(errorData.error || 'Failed to edit post', 'error')
      } else {
        showToast('Post edited successfully', 'success')
        push('/posts')
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to edit post',
        'error'
      )
    }
  }

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
        setPreview(
          post.thumbnail
            ? `${process.env.NEXT_PUBLIC_LOCAL_API_URL}${post.thumbnail}`
            : ''
        )
        setThumbnail(post.thumbnail)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch', 'error')
    }
  }

  useEffect(() => {
    if (props.isEdit) {
      getPostById()
    }
  }, [])

  useEffect(() => {
    if (title && description) {
      setIsDisable(false)
    } else {
      setIsDisable(true)
    }
  }, [title, description])

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
            <h2 className="card-title">
              {props.isEdit ? 'Edit' : 'Add New'} Post
            </h2>
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="grid">
                  <label className="font-medium">Post Thumbnail</label>
                  <fieldset className="fieldset">
                    <input
                      type="file"
                      className="file-input"
                      accept=".jpg, .jpeg, .png, .webpm .gif"
                      onChange={handleFileChange}
                    />
                    <label className="label">Max size 5MB</label>
                    <p id="fileSizeMessage"></p>
                  </fieldset>
                  {thumbnail && (
                    <>
                      <p className="text-semibold">Preview</p>
                      <Image
                        id="preview"
                        src={preview}
                        alt="preview-img"
                        width={500}
                        height={500}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="flex-auto">
                <div className="grid">
                  <label className="font-medium">
                    Post Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Title"
                    required
                    className="input validator w-auto my-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="validator-hint mt-0 mb-2">
                    Please fill the title!
                  </p>

                  <label className="font-medium">
                    Post Description<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="textarea validator w-auto my-2"
                    placeholder="Description"
                    required
                    rows={20}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                  <p className="validator-hint mt-0 mb-2">
                    Please fill the description!
                  </p>
                </div>
              </div>
            </div>
            <button
              id="submitBtn"
              className="btn btn-primary"
              type="button"
              onClick={props.isEdit ? editPost : createPost}
              disabled={isDisable}
            >
              {props.isEdit ? 'Edit' : 'Create'} Post
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
