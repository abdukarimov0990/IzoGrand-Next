// uploadToImgBB.js
import axios from 'axios'
import FormData from 'form-data'

export async function uploadToImgBB(imageBuffer, fileName) {
  const form = new FormData()
  form.append('image', imageBuffer.toString('base64'))
  form.append('name', fileName)

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    )
    const url = res.data?.data?.url
    if (!url || typeof url !== 'string') throw new Error('❌ ImgBB URL qaytmadi')
    return url
  } catch (err) {
    console.error("❌ ImgBB xatosi:", err?.response?.data || err)
    return null
  }
}
