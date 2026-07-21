import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Generic "fetch a table into state" hook.
 * Used for the simpler CRUD pages (Students, Subjects) so each page
 * doesn't have to repeat the same fetch/loading/error boilerplate.
 */
export function useTable(table, { orderBy, ascending = true } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from(table).select('*')
    if (orderBy) query = query.order(orderBy, { ascending })
    const { data, error } = await query
    setRows(data || [])
    setError(error)
    setLoading(false)
    return { data, error }
  }, [table, orderBy, ascending])

  useEffect(() => { refetch() }, [refetch])

  return { rows, setRows, loading, error, refetch }
}
