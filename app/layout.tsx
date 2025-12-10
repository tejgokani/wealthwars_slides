import type { Metadata } from 'next'
import './globals.css'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: 'Company Slide Display',
  description: 'Search and display company information slides',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className={styles.logoHeader}>
          <img 
            src="/BNB_Logo_Coloured.png" 
            alt="BNB Logo" 
            className={styles.logo}
          />
          <h2 className={styles.logoText}>BULLS AND BEARS</h2>
        </div>
        {children}
      </body>
    </html>
  )
}
