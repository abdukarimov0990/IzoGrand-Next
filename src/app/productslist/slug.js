import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Head from 'next/head'

export async function getStaticPaths() {
  const productsSnap = await getDocs(collection(db, 'products'))
  const paths = productsSnap.docs.map(doc => ({
    params: { slug: doc.data().slug }
  }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const q = query(collection(db, 'products'), where('slug', '==', params.slug), limit(1))
  const snap = await getDocs(q)

  if (snap.empty) return { notFound: true }

  const data = snap.docs[0].data()
  return {
    props: {
      product: {
        ...data,
        id: snap.docs[0].id,
      }
    },
    revalidate: 60,
  }
}

export default function ProductDetailPage({ product }) {
  return (
    <>
<Head>
  <title>{product.name} - Mahsulot tafsiloti | GAVHARGO</title>

  {/* Asosiy meta */}
  <meta name="description" content={product.desc.slice(0, 150)} />
  <meta name="keywords" content={`${product.name}, qurilish mahsulotlari, mahsulotlar, GAVHARGO, O'zbekiston`} />
  <meta name="author" content="GAVHARGO" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {/* Open Graph - ijtimoiy tarmoqlar uchun */}
  <meta property="og:title" content={`${product.name} - Mahsulot tafsiloti | GAVHARGO`} />
  <meta property="og:description" content={product.desc.slice(0, 150)} />
  <meta property="og:type" content="product" />
  <meta property="og:url" content={`https://sizningsaytingiz.uz/product/${product.slug}`} />
  <meta property="og:image" content={product.img?.[0] || 'https://sizningsaytingiz.uz/default-image.jpg'} />
  <meta property="og:site_name" content="GAVHARGO" />
  <meta property="og:locale" content="uz_UZ" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${product.name} - Mahsulot tafsiloti | GAVHARGO`} />
  <meta name="twitter:description" content={product.desc.slice(0, 150)} />
  <meta name="twitter:image" content={product.img?.[0] || 'https://sizningsaytingiz.uz/default-image.jpg'} />
</Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <img src={product.img?.[0]} alt={product.name} className="rounded-xl mb-4 w-full max-w-xl" />
        <p className="mb-2">Narxi: <b>{product.price} so‘m</b></p>
        <p>{product.desc}</p>
      </div>
    </>
  )
}
