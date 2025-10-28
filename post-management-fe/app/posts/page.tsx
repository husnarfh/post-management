'use client'
import { Visibility, Edit, Delete, Search, Add } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import fetchData from '../utils/fetchData'
import Image from 'next/image'
import moment from 'moment'
import Pagination from '../components/pagination'
import styles from '../page.module.css'
import { useToast } from '../lib/toast-provider'
import { useDialog } from '../lib/dialog-provider'

export default function Main() {
  const router = useRouter()
  const { showToast } = useToast()
  const { openDialog, closeDialog } = useDialog()
  const [posts, setPosts] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getAllPosts = async () => {
    setIsLoading(true)
    const res = await fetchData(
      `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/posts?search=${search}&page=`
    )

    try {
      if (res.ok) {
        const posts = await res.json()
        setPosts(posts.data)
        setPagination(posts.pagination)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Login failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (id) => {
    try {
      const res = await fetchData(
        `${process.env.NEXT_PUBLIC_LOCAL_API_URL}/api/posts/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (res.ok) {
        closeDialog()
        location.reload()
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete post',
        'error'
      )
    }
  }

  const handleConfirmDelete = (id, title) => {
    openDialog({
      id,
      title,
      onConfirm: deletePost,
    })
  }

  useEffect(() => {
    getAllPosts()
  }, [])

  return (
    <>
      <div className="h-screen w-full justify-center p-10">
        {/* search and add new posts */}
        <div className="flex justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <label className="input">
              <input
                type="search"
                required
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button className="btn btn-neutral" onClick={getAllPosts}>
              <Search />
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => router.push('/posts/new')}
          >
            <Add />
            Add New Post
          </button>
        </div>

        {/* table  */}
        {isLoading ? (
          <div className="text-center">
            <span className="loading loading-dots loading-xl"></span>
          </div>
        ) : (
          <div className={`${styles.glass} card w-full shadow-sm`}>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  {/* head */}
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Post Name</th>
                      <th className="w-3xl">Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  {posts.length ? (
                    <tbody>
                      {/* row 1 */}
                      {posts.map((post: any, arr) => (
                        <tr key={post.id}>
                          <th>{arr + 1}</th>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="mask mask-squircle h-12 w-12">
                                  <Image
                                    src={
                                      post.thumbnail
                                        ? `${process.env.NEXT_PUBLIC_LOCAL_API_URL}${post.thumbnail}`
                                        : '/no-image.svg'
                                    }
                                    alt="post-thumbnail"
                                    width={40}
                                    height={40}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-base">
                                  {post.title}
                                </div>
                                <span className="text-xs">
                                  <i>
                                    Created by {post.first_name}{' '}
                                    {post.last_name}
                                  </i>
                                </span>
                                <br />
                                <span className="text-xs">
                                  <i>
                                    on{' '}
                                    {moment(post.created_at).format(
                                      'DD MMMM YYYY'
                                    )}
                                  </i>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="longtext">
                              {isExpanded
                                ? post.text_description
                                : `${post.text_description.slice(0, 100)}...`}
                            </p>
                            {post.text_description.length > 100 && (
                              <button
                                id="toggleButton"
                                className="btn btn-ghost"
                                onClick={() => setIsExpanded(!isExpanded)}
                              >
                                {isExpanded ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                          </td>
                          <td className="flex">
                            <div
                              className="tooltip tooltip-bottom"
                              data-tip="View"
                            >
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => router.push(`/posts/${post.id}`)}
                              >
                                <Visibility />
                              </button>
                            </div>

                            <div
                              className="tooltip tooltip-bottom"
                              data-tip="Edit"
                            >
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() =>
                                  router.push(`/posts/${post.id}/edit`)
                                }
                              >
                                <Edit />
                              </button>
                            </div>
                            <div
                              className="tooltip tooltip-bottom"
                              data-tip="Delete"
                            >
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() =>
                                  handleConfirmDelete(post.id, post.title)
                                }
                              >
                                <Delete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody key={1}>
                      <tr>
                        <td colSpan={4}>
                          <p className="text-center font-semibold">
                            <i>Data not available</i>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>

                {/* pagination */}
                <div className="join flex justify-end">
                  <Pagination
                    totalPages={pagination.totalPages}
                    currentPage={pagination.page}
                    search={search}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
