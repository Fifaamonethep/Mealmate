import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_URL') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
    console.log('⚡ Supabase Client initialized successfully!')
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message)
  }
} else {
  console.log('ℹ️ SUPABASE_URL / SUPABASE_KEY not configured. Falling back to local JsonDB engine.')
}

export async function uploadSlipImage(fileData, filename) {
  if (!supabase) return fileData

  try {
    let buffer
    let contentType = 'image/png'

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
      if (matches) {
        contentType = matches[1]
        buffer = Buffer.from(matches[2], 'base64')
      } else {
        return fileData
      }
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData
    } else {
      return fileData
    }

    const path = `slips/${filename}`
    const { data, error } = await supabase.storage
      .from('payment-slips')
      .upload(path, buffer, {
        contentType,
        upsert: true
      })

    if (error) {
      console.warn('Supabase storage upload warning:', error.message)
      return fileData
    }

    return data.path || path
  } catch (err) {
    console.error('Error uploading slip image to Supabase storage:', err.message)
    return fileData
  }
}

export async function getSignedSlipUrl(filePath, expiresIn = 600) {
  if (!filePath) return null
  if (!supabase) return filePath

  // If it's already a full data URI or non-supabase HTTP URL, return as-is
  if (typeof filePath === 'string' && (filePath.startsWith('data:') || (filePath.startsWith('http') && !filePath.includes('payment-slips')))) {
    return filePath
  }

  try {
    // Extract object key if full Supabase URL was saved
    let objectKey = filePath
    if (filePath.includes('/payment-slips/')) {
      objectKey = filePath.split('/payment-slips/').pop().split('?')[0]
    }

    const { data, error } = await supabase.storage
      .from('payment-slips')
      .createSignedUrl(objectKey, expiresIn)

    if (error || !data?.signedUrl) {
      return filePath
    }

    return data.signedUrl
  } catch (err) {
    console.error('Error creating signed URL for slip:', err.message)
    return filePath
  }
}

export { supabase }

