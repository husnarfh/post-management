'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
  search: string
}

export default function Pagination({
  totalPages,
  currentPage,
  search,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?search=${search}&${params.toString()}`)
  }

  // helpers
  const isDisabledPrev = currentPage <= 1
  const isDisabledNext = currentPage >= totalPages

  return (
    <div className="flex justify-center mt-6">
      <div className="join">
        <button
          className="join-item btn"
          disabled={isDisabledPrev}
          onClick={() => goToPage(currentPage - 1)}
        >
          «
        </button>

        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1
          return (
            <button
              key={page}
              className={`join-item btn ${
                page === currentPage ? 'btn-active' : ''
              }`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          )
        })}

        <button
          className="join-item btn"
          disabled={isDisabledNext}
          onClick={() => goToPage(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  )
}
