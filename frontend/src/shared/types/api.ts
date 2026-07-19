export interface Paginated<T> {
  count: number
  total_pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiErrorPayload {
  detail: unknown
  code?: string
}
