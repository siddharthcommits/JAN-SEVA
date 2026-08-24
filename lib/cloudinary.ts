import { v2 as cloudinary } from 'cloudinary'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''

if (process.env.CLOUDINARY_URL) {
  // Cloudinary automatically picks up CLOUDINARY_URL from process.env if it exists
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}

export async function uploadImageFromBase64(base64Data: string) {
  if (!base64Data) return ''
  // base64Data should be like 'data:image/jpeg;base64,/9j/4AAQ...'
  try {
    const res = await cloudinary.uploader.upload(base64Data, { folder: 'civic-vibe' })
    return res.secure_url
  } catch (err) {
    console.error('Cloudinary upload failed', err)
    return ''
  }
}

export default cloudinary
