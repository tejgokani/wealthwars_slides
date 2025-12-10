# Using Google Drive Links for Logos

## How to Use Google Drive Links

The system automatically converts Google Drive share links to direct image URLs when you upload your CSV file.

## Step-by-Step Instructions

### 1. Upload Your Logo to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Upload your logo image file
3. Right-click on the file and select **"Share"** or **"Get link"**

### 2. Set Sharing Permissions

**Important:** The file must be accessible to anyone with the link:

1. In the sharing dialog, click **"Change to anyone with the link"**
2. Set permission to **"Viewer"** (not "Editor")
3. Click **"Done"**

### 3. Copy the Share Link

Copy the full Google Drive share link. It will look like one of these formats:

```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

or

```
https://drive.google.com/open?id=FILE_ID
```

### 4. Use in Your CSV File

Simply paste the Google Drive share link in the `logo_url` column of your CSV file. The system will automatically convert it to a direct image URL when you upload.

## Example CSV Entry

```csv
company_name,origin_country,sector,base_price,revenue_2022,revenue_2023,growth_rate,logo_url
My Company,USA,TECHNOLOGY,50000000,120000000,150000000,HIGH,https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
```

## Supported Link Formats

The system automatically handles these Google Drive link formats:

- `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/uc?id=FILE_ID` (already direct, used as-is)

## Troubleshooting

### Logo Not Showing?

1. **Check Sharing Settings**: Make sure the file is set to "Anyone with the link can view"
2. **Verify the Link**: Try opening the Google Drive link in an incognito/private browser window
3. **File Format**: Supported formats: JPG, PNG, GIF, WebP
4. **File Size**: Very large files may take longer to load

### Alternative: Use Direct Image Hosting

If Google Drive links don't work, consider using:
- **Imgur**: Upload and get direct image link
- **Cloudinary**: Professional image hosting
- **Your own server**: Host images on your website

## Notes

- The conversion happens automatically during CSV upload
- Original Google Drive links are converted to direct image URLs
- The converted URLs are stored in the database
- Logos are displayed when available, or "NO LOGO" when not provided
