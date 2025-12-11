'use client'

import { useState, useEffect, useRef } from 'react'
import { Company, supabase } from '@/lib/supabase'
import styles from './SlideDisplay.module.css'

interface SlideDisplayProps {
  company: Company
  onCompanyChange?: (company: Company) => void
}

export default function SlideDisplay({ company, onCompanyChange }: SlideDisplayProps) {
  const [logoError, setLogoError] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)
  
  // Debug: Log company data to help diagnose issues
  useEffect(() => {
    if (company) {
      console.log('Company data:', {
        name: company.company_name,
        base_price: company.base_price,
        revenue_2022: company.revenue_2022,
        revenue_2023: company.revenue_2023,
        base_price_type: typeof company.base_price,
        revenue_2022_type: typeof company.revenue_2022,
        revenue_2023_type: typeof company.revenue_2023,
      })
    }
  }, [company])
  
  // Check if logo_url exists and is not empty
  const hasLogo = company.logo_url && typeof company.logo_url === 'string' && company.logo_url.trim() !== ''
  const showLogo = hasLogo && !logoError
  
  // Reset states when company changes
  useEffect(() => {
    setLogoError(false)
    setLogoLoaded(false)
  }, [company.id, company.logo_url])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const enterFullscreen = async () => {
    if (slideRef.current) {
      try {
        if (slideRef.current.requestFullscreen) {
          await slideRef.current.requestFullscreen()
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error)
      }
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error)
    }
  }

  const handleFullscreenToggle = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  const handleFullscreenSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !onCompanyChange) return

    if (!supabase) {
      console.error('Supabase is not configured')
      return
    }

    setSearchLoading(true)
    try {
      const { data, error: searchError } = await supabase
        .from('companies')
        .select('*')
        .ilike('company_name', `%${searchQuery.trim()}%`)
        .limit(1)
        .single()

      if (!searchError && data) {
        // Ensure numeric fields are properly converted to numbers
        const companyData: Company = {
          ...data,
          base_price: Number(data.base_price) || 0,
          revenue_2022: Number(data.revenue_2022) || 0,
          revenue_2023: Number(data.revenue_2023) || 0,
        }
        onCompanyChange(companyData)
        setSearchQuery('')
        setShowSearchBar(false)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div 
      ref={slideRef}
      className={`${styles.slideContainer} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      {isFullscreen && (
        <div className={styles.fullscreenControls}>
          <button
            className={styles.searchIconButton}
            onClick={() => setShowSearchBar(!showSearchBar)}
            aria-label="Search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          {showSearchBar && (
            <form onSubmit={handleFullscreenSearch} className={styles.fullscreenSearchForm}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company..."
                className={styles.fullscreenSearchInput}
                autoFocus
                disabled={searchLoading}
              />
              <button 
                type="submit" 
                className={styles.fullscreenSearchButton}
                disabled={searchLoading}
              >
                {searchLoading ? '...' : 'Search'}
              </button>
            </form>
          )}
          <button
            className={styles.exitFullscreenButton}
            onClick={exitFullscreen}
            aria-label="Exit fullscreen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
          </button>
        </div>
      )}
      
      {!isFullscreen && (
        <button
          className={styles.fullscreenButton}
          onClick={handleFullscreenToggle}
          aria-label="Enter fullscreen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
      )}
      
      <div className={styles.templateBackground}></div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.leftSection}>
          <h1 className={styles.companyName}>{company.company_name}</h1>
          
          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ORIGIN COUNTRY :</span>
              <span className={styles.value}>{company.origin_country}</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>SECTOR:</span>
              <span className={styles.value}>{company.sector.toUpperCase()}</span>
            </div>
            
            <div className={styles.revenueTable}>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>INCOME 1st Year</div>
                <div className={styles.tableCell}>INCOME 2nd Year</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>{Math.round(Number(company.revenue_2022) || 0).toLocaleString('en-US')}</div>
                <div className={styles.tableCell}>{Math.round(Number(company.revenue_2023) || 0).toLocaleString('en-US')}</div>
              </div>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.label}>BASE PRICE:</span>
              <span className={styles.value}>{Math.round(Number(company.base_price) || 0).toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>
        
        {showLogo && (
          <div className={styles.rightSection}>
            <div className={styles.logoContainer}>
              {!logoLoaded && (
                <div className={styles.logoLoading}>Loading...</div>
              )}
              <img 
                src={company.logo_url!} 
                alt={`${company.company_name} logo`}
                className={styles.logo}
                onLoad={() => {
                  setLogoLoaded(true)
                  setLogoError(false)
                }}
                onError={() => {
                  setLogoError(true)
                  setLogoLoaded(false)
                }}
                style={{ display: logoLoaded ? 'block' : 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
