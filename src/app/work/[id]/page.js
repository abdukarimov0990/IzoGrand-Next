'use client'

import { useParams } from 'next/navigation'
import { useContext, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import { works } from '../../../../bot/src/data/data'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'

const Product = () => {
  const { id } = useParams()
  const { selectedProducts, setSelectedProducts } = useContext(AppContext)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  const product = works.find(p => p.id.toString() === id)
  const isLiked = selectedProducts.some(p => p.id === product?.id)

  const toggleFavorite = () => {
    if (!product) return
    if (isLiked) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
    } else {
      setSelectedProducts(prev => [...prev, product])
    }
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-red-500">
        Mahsulot topilmadi
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row ">
      <div className="w-full md:w-1/2">
        {/* Swiper gallery */}
        <Swiper
          style={{
            '--swiper-navigation-color': '#000',
            '--swiper-pagination-color': '#000',
          }}
          spaceBetween={10}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mb-4"
        >
          {product.img.map((imgUrl, index) => (
            <SwiperSlide key={index}>
              <img
                src={imgUrl}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-[400px] object-contain rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnails */}
        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
        >
          {product.img.map((imgUrl, index) => (
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

      <div className="md:w-1/2">
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
  )
}

export default Product
