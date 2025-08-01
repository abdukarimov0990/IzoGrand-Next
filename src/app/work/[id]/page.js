'use client'

import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import { FaArrowLeft, FaHome } from 'react-icons/fa'
import Link from 'next/link'


const Product = () => {
  const { id } = useParams()
  const { selectedProducts, setSelectedProducts } = useContext(AppContext)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'works', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProduct({ _id: docSnap.id, ...docSnap.data() })
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error("Mahsulot yuklanmadi", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const isLiked = selectedProducts.some(p => p._id === product?._id)

  const toggleFavorite = () => {
    if (!product) return
    if (isLiked) {
      setSelectedProducts(prev => prev.filter(p => p._id !== product._id))
    } else {
      setSelectedProducts(prev => [...prev, product])
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Yuklanmoqda...</div>
  }

  if (!product) {
    return <div className="text-center py-20 text-red-500">Mahsulot topilmadi</div>
  }

  return (
    <div className='container'>
      <Link href="/" className='pt-10 mb-5'>
        <button className="flex items-center gap-2 py-2 px-5 border border-gray-300 text-gray-600 rounded-lg transition hover:bg-gray-100 hover:text-black hover:shadow-sm">
          <FaHome size={24} />
          <span>Bosh sahifa</span>
        </button>
      </Link>
          <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row">

      <div className="w-full md:w-1/2">
        <Swiper
          style={{ '--swiper-navigation-color': '#000', '--swiper-pagination-color': '#000' }}
          spaceBetween={10}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mb-4"
        >
          {product.img?.map((imgUrl, index) => (
            <SwiperSlide key={index}>
              <img
                src={imgUrl}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-[400px] object-contain rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
        >
          {product.img?.map((imgUrl, index) => (
            <SwiperSlide key={index}>
              <img
                src={imgUrl}
                alt={`thumb-${index + 1}`}
                className="h-[100px] w-[100px] object-contain border rounded"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="md:w-1/2 mt-6 md:mt-0 md:pl-10">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <p className="text-lg text-gray-700">{product.desc}</p>

        <button
          onClick={toggleFavorite}
          className="mt-4 flex items-center gap-2 text-red-600"
        >
          {isLiked ? <BiSolidHeart size={24} /> : <BiHeart size={24} />}
          {isLiked ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}
        </button>
      </div>
    </div>

    </div>
  )
}

export default Product
