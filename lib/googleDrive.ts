/**
 * Converts Google Drive share links to direct image URLs
 * Supports multiple Google Drive link formats
 */
export function convertGoogleDriveLink(url: string | null): string | null {
  if (!url || !url.trim()) {
    return null
  }

  const trimmedUrl = url.trim()

  // If it's already a direct image URL or not a Google Drive link, return as-is
  if (!trimmedUrl.includes('drive.google.com')) {
    return trimmedUrl
  }

  // Extract file ID from various Google Drive link formats
  let fileId: string | null = null

  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const match1 = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match1) {
    fileId = match1[1]
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    const match2 = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (match2) {
      fileId = match2[1]
    }
  }

  // Format 3: https://drive.google.com/uc?id=FILE_ID (already direct)
  if (trimmedUrl.includes('/uc?')) {
    return trimmedUrl
  }

  // If we found a file ID, convert to direct image URL
  if (fileId) {
    // Use the thumbnail API with large size for best quality
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  // If we can't parse it, return the original URL (might still work)
  return trimmedUrl
}
