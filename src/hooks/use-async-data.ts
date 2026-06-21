import { useEffect, useState } from 'react'

type AsyncDataState<T> = {
  data: T | null
  isLoading: boolean
  error: string
}

export function useAsyncData<T>(loader: () => Promise<T>): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    setIsLoading(true)
    setError('')

    loader()
      .then((result) => {
        if (!active) {
          return
        }

        setData(result)
      })
      .catch((reason: unknown) => {
        if (!active) {
          return
        }

        const message = reason instanceof Error ? reason.message : 'Não foi possível carregar os dados.'
        setError(message)
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [loader])

  return { data, isLoading, error }
}
