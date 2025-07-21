// lib/uploadToImgBB.js

import axios from 'axios'
import FormData from 'form-data'

export async function uploadToImgBB(imageBuffer, fileName) {
  const form = new FormData()
  form.append('image', imageBuffer.toString('base64'))
  form.append('name', fileName)

  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    form,
    { headers: form.getHeaders() }
  )

  return res.data?.data?.url
}
