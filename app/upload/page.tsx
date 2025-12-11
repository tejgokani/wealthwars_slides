'use client'

import { useState } from 'react'
import { supabase, Company } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { convertGoogleDriveLink } from '@/lib/googleDrive'
import styles from './page.module.css'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const [skippedRows, setSkippedRows] = useState<number[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const parseCSV = (csvText: string): { companies: Company[], skipped: number[] } => {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line)
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim())
    
    // Expected columns
    const requiredColumns = [
      'company_name',
      'origin_country',
      'sector',
      'base_price',
      'revenue_2022',
      'revenue_2023'
    ]

    // Check if all required columns exist
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    const companies: Company[] = []
    const skipped: number[] = []

    for (let i = 1; i < lines.length; i++) {
      // Skip completely empty lines
      if (!lines[i] || lines[i].trim() === '' || lines[i].split(',').every(v => v.trim() === '')) {
        continue
      }
      
      let values = parseCSVLine(lines[i]).map(v => {
        // Remove quotes and trim
        let cleaned = v.replace(/^"|"$/g, '').trim()
        return cleaned
      })
      
      // If we have more values than headers, numbers with commas might have been split
      // Try to reconstruct by merging numeric columns
      if (values.length > headers.length) {
        const numericColumns = ['base_price', 'revenue_2022', 'revenue_2023']
        const extraValues = values.length - headers.length
        
        // Count numeric columns
        const numericColIndices: number[] = []
        headers.forEach((h, idx) => {
          if (numericColumns.includes(h)) {
            numericColIndices.push(idx)
          }
        })
        
        // Calculate fragments per numeric column (distribute evenly)
        const fragmentsPerCol = numericColIndices.length > 0 
          ? Math.floor(extraValues / numericColIndices.length)
          : 0
        const remainder = numericColIndices.length > 0 
          ? extraValues % numericColIndices.length
          : 0
        
        const reconstructed: string[] = []
        let valueIdx = 0
        
        for (let hIdx = 0; hIdx < headers.length; hIdx++) {
          const header = headers[hIdx]
          const isNumeric = numericColumns.includes(header)
          
          if (isNumeric && valueIdx < values.length) {
            // Start with first value
            let merged = values[valueIdx] || ''
            valueIdx++
            
            // Calculate how many fragments this numeric column should get
            const colIndex = numericColIndices.indexOf(hIdx)
            const fragmentsForThisCol = fragmentsPerCol + (colIndex < remainder ? 1 : 0)
            
            // Merge the calculated number of fragments
            for (let f = 0; f < fragmentsForThisCol && valueIdx < values.length; f++) {
              const fragment = values[valueIdx]
              
              // Only merge if it looks numeric
              if (fragment === '' || /^[\d.]+$/.test(fragment)) {
                // Handle decimal point - only allow one per number
                if (fragment.includes('.')) {
                  if (!merged.includes('.')) {
                    merged += fragment
                  }
                } else {
                  // Pure digits - merge
                  merged += fragment
                }
                valueIdx++
              } else {
                break
              }
            }
            
            reconstructed.push(merged)
          } else {
            // Non-numeric column - take one value
            if (valueIdx < values.length) {
              reconstructed.push(values[valueIdx])
              valueIdx++
            } else {
              reconstructed.push('')
            }
          }
        }
        
        // Use reconstruction if we got the right number of columns
        if (reconstructed.length === headers.length) {
          values = reconstructed
        }
      }
      
      if (values.length !== headers.length) {
        skipped.push(i + 1)
        continue // Skip malformed rows
      }

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index] : ''
      })
      
      // Ensure logo_url exists in row (even if column doesn't exist in CSV)
      if (!row.hasOwnProperty('logo_url')) {
        row.logo_url = ''
      }

      // Check for empty required fields
      if (!row.company_name || !row.origin_country || !row.sector) {
        skipped.push(i + 1)
        continue
      }

      // Helper function to clean numeric strings (remove all commas and whitespace)
      // Handles Indian numbering format like "1,80,00,000" or "1,43,04,572"
      const cleanNumber = (value: string): string => {
        if (!value) return ''
        // Remove all commas, spaces, and any other non-numeric characters except decimal point
        return value.toString().replace(/,/g, '').replace(/\s/g, '').trim()
      }

      // Validate and convert numeric fields (remove commas before parsing)
      const basePriceStr = cleanNumber(row.base_price || '')
      const revenue2022Str = cleanNumber(row.revenue_2022 || '')
      const revenue2023Str = cleanNumber(row.revenue_2023 || '')
      
      // Check if cleaned strings are empty
      if (!basePriceStr || !revenue2022Str || !revenue2023Str) {
        skipped.push(i + 1)
        continue
      }
      
      // Parse numbers - use parseFloat for all to handle decimals
      const basePrice = parseFloat(basePriceStr)
      const revenue2022 = parseFloat(revenue2022Str)
      const revenue2023 = parseFloat(revenue2023Str)

      // Validate parsed numbers
      if (isNaN(basePrice) || isNaN(revenue2022) || isNaN(revenue2023)) {
        skipped.push(i + 1)
        continue
      }
      
      // Ensure base_price is an integer (round it)
      const basePriceInt = Math.round(basePrice)

      // All validations passed, create company object
      // Convert Google Drive links to direct image URLs
      const logoUrl = row.logo_url && row.logo_url.trim() 
        ? convertGoogleDriveLink(row.logo_url.trim()) 
        : null

      // Normalize sector to lowercase for consistency (DEFENCE -> defense, etc.)
      const normalizedSector = row.sector.trim().toLowerCase()
      // Map common variations
      const sectorMap: { [key: string]: string } = {
        'defence': 'defense',
        'defense': 'defense',
        'tech': 'tech',
        'technology': 'tech',
        'health': 'health',
        'healthcare': 'health',
        'finance': 'finance',
        'financial': 'finance',
        'agriculture': 'agriculture',
        'agri': 'agriculture'
      }
      const finalSector = sectorMap[normalizedSector] || normalizedSector

      const company: Company = {
        id: '', // Will be generated by database
        company_name: row.company_name.trim(),
        origin_country: row.origin_country.trim(),
        sector: finalSector,
        base_price: basePriceInt,
        revenue_2022: revenue2022,
        revenue_2023: revenue2023,
        logo_url: logoUrl
      }

      // Debug: Log first few companies to verify values
      if (companies.length < 3) {
        console.log(`Parsed company ${companies.length + 1}:`, {
          name: company.company_name,
          base_price: company.base_price,
          revenue_2022: company.revenue_2022,
          revenue_2023: company.revenue_2023,
          raw_base_price: row.base_price,
          raw_revenue_2022: row.revenue_2022,
          raw_revenue_2023: row.revenue_2023
        })
      }

      companies.push(company)
    }

    return { companies, skipped }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not configured. Please set environment variables.' })
      return
    }

    setLoading(true)
    setMessage(null)
    setImportedCount(0)
    setSkippedRows([])

    try {
      const text = await file.text()
      const { companies, skipped } = parseCSV(text)

      if (companies.length === 0) {
        setMessage({ 
          type: 'error', 
          text: skipped.length > 0 
            ? `No valid companies found. ${skipped.length} row(s) were skipped due to invalid data.` 
            : 'No valid companies found in CSV file' 
        })
        setSkippedRows(skipped)
        setLoading(false)
        return
      }

      // Prepare data for insert (remove id field as it's auto-generated)
      const insertData = companies.map(({ id, ...company }) => company)

      // Insert companies in batches
      const batchSize = 100
      let inserted = 0

      for (let i = 0; i < insertData.length; i += batchSize) {
        const batch = insertData.slice(i, i + batchSize)
        const { error } = await supabase
          .from('companies')
          .insert(batch)

        if (error) {
          throw new Error(`Error inserting data: ${error.message}`)
        }

        inserted += batch.length
        setImportedCount(inserted)
      }

      let successMessage = `Successfully imported ${inserted} companies!`
      if (skipped.length > 0) {
        successMessage += ` (${skipped.length} row(s) skipped: ${skipped.slice(0, 10).join(', ')}${skipped.length > 10 ? '...' : ''})`
      }
      
      setMessage({ 
        type: 'success', 
        text: successMessage
      })
      setSkippedRows(skipped)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to import CSV file' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Upload Company Data (CSV)</h1>
        
        <div className={styles.uploadSection}>
          <div className={styles.fileInputWrapper}>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={loading}
            />
            <label htmlFor="csv-file" className={styles.fileLabel}>
              {file ? file.name : 'Choose CSV File'}
            </label>
          </div>

          <button
            onClick={handleUpload}
            className={styles.uploadButton}
            disabled={loading || !file}
          >
            {loading ? `Importing... (${importedCount} imported)` : 'Import CSV'}
          </button>
        </div>

        {message && (
          <div className={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </div>
        )}

        {skippedRows.length > 0 && (
          <div className={styles.warning}>
            <strong>Skipped Rows:</strong> The following rows were skipped due to invalid or missing data: {skippedRows.slice(0, 20).join(', ')}
            {skippedRows.length > 20 && ` (and ${skippedRows.length - 20} more)`}
            <br />
            <small>Common issues: Invalid numbers or missing required fields</small>
          </div>
        )}

        <div className={styles.infoSection}>
          <h2 className={styles.infoTitle}>CSV Format Requirements</h2>
          <p className={styles.infoText}>
            Your CSV file must have the following columns (in this order):
          </p>
          <ul className={styles.columnsList}>
            <li><strong>company_name</strong> - Name of the company</li>
            <li><strong>origin_country</strong> - Country of origin</li>
            <li><strong>sector</strong> - Business sector</li>
            <li><strong>base_price</strong> - Base price (integer, commas are automatically removed)</li>
            <li><strong>revenue_2022</strong> - Income for 2022 (decimal, commas are automatically removed)</li>
            <li><strong>revenue_2023</strong> - Income for 2023 (decimal, commas are automatically removed)</li>
            <li><strong>logo_url</strong> - URL to company logo image (optional - leave empty for "NO LOGO")</li>
          </ul>
          <p className={styles.infoText} style={{ marginTop: '15px', fontSize: '0.9rem', color: '#aaa' }}>
            <strong>Note:</strong> Numbers with commas (e.g., 3,00,00,000 or "1,43,04,572") are automatically handled. The system supports Indian numbering format. Make sure numeric values are properly quoted in your CSV if they contain commas.
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
            <a href="/defence-ww.csv" download="defence-ww.csv" className={styles.downloadLink}>
              Download Defence WW CSV
            </a>
            <a href="/ww-final-data.csv" download="ww-final-data.csv" className={styles.downloadLink}>
              Download WW Final Data CSV
            </a>
            <a href="/sample-companies.csv" download="sample-companies.csv" className={styles.downloadLink}>
              Download Sample CSV Template
            </a>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className={styles.backButton}
        >
          Back to Search
        </button>
      </div>
    </main>
  )
}
