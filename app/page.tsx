'use client'

import { useState } from 'react'
import { supabase, Company } from '@/lib/supabase'
import SlideDisplay from '@/components/SlideDisplay'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    if (!supabase) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
      return
    }

    setLoading(true)
    setError(null)
    setCompany(null)

    try {
      const { data, error: searchError } = await supabase
        .from('companies')
        .select('*')
        .ilike('company_name', `%${searchQuery.trim()}%`)
        .limit(1)
        .single()

      if (searchError) {
        if (searchError.code === 'PGRST116') {
          setError('Company not found. Please try a different search term.')
        } else {
          setError('Error searching for company: ' + searchError.message)
        }
      } else if (data) {
        // Ensure numeric fields are properly converted to numbers
        const companyData: Company = {
          ...data,
          base_price: Number(data.base_price) || 0,
          revenue_2022: Number(data.revenue_2022) || 0,
          revenue_2023: Number(data.revenue_2023) || 0,
        }
        setCompany(companyData)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company name..."
              className={styles.searchInput}
              disabled={loading}
            />
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <Link href="/upload" className={styles.uploadLink}>
            Upload CSV
          </Link>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {company && (
          <div className={styles.slideWrapper}>
            <SlideDisplay 
              company={company} 
              onCompanyChange={setCompany}
            />
          </div>
        )}
      </div>
    </main>
  )
}
