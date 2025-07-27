import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Head from 'next/head'

export async function getStaticPaths() {
  const worksSnap = await getDocs(collection(db, 'works'))
  const paths = worksSnap.docs.map(doc => ({
    params: { slug: doc.data().slug }
  }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const q = query(collection(db, 'works'), where('slug', '==', params.slug), limit(1))
  const snap = await getDocs(q)

  if (snap.empty) return { notFound: true }

  const data = snap.docs[0].data()
  return {
    props: {
      work: {
        ...data,
        id: snap.docs[0].id,
      }
    },
    revalidate: 60,
  }
}

export default function WorkDetailPage({ work }) {
  return (
    <>
<Head>
  <title>{work.name} - Xizmat tafsiloti | GAVHARGO</title>

  {/* Asosiy meta */}
  <meta name="description" content={work.desc.slice(0, 150)} />
  <meta name="keywords" content={`${work.name}, xizmatlar, qurilish xizmatlari, GAVHARGO, O'zbekiston`} />
  <meta name="author" content="GAVHARGO" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {/* Open Graph - ijtimoiy tarmoqlar uchun */}
  <meta property="og:title" content={`${work.name} - Xizmat tafsiloti | GAVHARGO`} />
  <meta property="og:description" content={work.desc.slice(0, 150)} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={`https://sizningsaytingiz.uz/work/${work.slug}`} />
  <meta property="og:image" content={work.img?.[0] || 'https://sizningsaytingiz.uz/default-image.jpg'} />
  <meta property="og:site_name" content="GAVHARGO" />
  <meta property="og:locale" content="uz_UZ" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${work.name} - Xizmat tafsiloti | GAVHARGO`} />
  <meta name="twitter:description" content={work.desc.slice(0, 150)} />
  <meta name="twitter:image" content={work.img?.[0] || 'https://sizningsaytingiz.uz/default-image.jpg'} />
</Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{work.name}</h1>
        <img src={work.img?.[0]} alt={work.name} className="rounded-xl mb-4 w-full max-w-xl" />
        <p>{work.desc}</p>
      </div>
    </>
  )
} 