import { db } from '../../../../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function GET() {
  const productsSnap = await getDocs(collection(db, 'products'))
  const worksSnap = await getDocs(collection(db, 'works'))

  const products = productsSnap.docs.map(doc => doc.data())
  const works = worksSnap.docs.map(doc => doc.data())

  const pages = [
    ...products.map(p => `/products/${p.slug}`),
    ...works.map(w => `/works/${w.slug}`)
  ]

  const baseUrl = 'https://izogrand-next.onrender.com'

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'text/xml'
    }
  })
}
