'use client'

import React, { useContext, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import {db} from '../../lib/firebase'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { banner } from '../data/data'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from 'react-icons/md'
import Link from 'next/link'
import { AppContext } from '../context/AppContext'
import { FaInstagram, FaPhoneAlt, FaTelegramPlane, FaTimes } from 'react-icons/fa'
import Head from 'next/head'

const Home = () => {
  const { selectedProducts, setSelectedProducts } = useContext(AppContext)
  const [products, setProducts] = useState([])
  const [works, setWorks] = useState([])
  const [visibleCount, setVisibleCount] = useState(4)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'))
        const worksSnapshot = await getDocs(collection(db, 'works'))

        const productsData = productsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))
        const worksData = worksSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))

        setProducts(productsData)
        setWorks(worksData)
      } catch (error) {
        console.error('Firebase’dan maʼlumotlarni olishda xatolik:', error)
      }
    }

    fetchData()
  }, [])

  const toggleFavorite = (item, e) => {
    e.preventDefault()
    e.stopPropagation()
    const isSelected = selectedProducts.some(p => p._id === item._id)
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p._id !== item._id))
    } else {
      setSelectedProducts(prev => [...prev, item])
    }
  }

  const handleToggle = () => {
    const maxCount = Math.max(products.length, works.length)
    if (visibleCount >= maxCount) {
      setVisibleCount(4)
    } else {
      setVisibleCount(prev => prev + 4)
    }
  }

  return (
    <>
          <Head>
        <title>GAVHARGO — Qurilish mahsulotlari va xizmatlar O‘zbekiston bo‘ylab</title>
        <meta name="description" content="GAVHARGO — O‘zbekiston bo‘ylab tez yetkazib beriladigan qurilish mahsulotlari va xizmatlar onlayn do‘koni." />
        <meta name="keywords" content="qurilish, mahsulotlar, xizmatlar, O‘zbekiston, yetkazib berish, onlayn do‘kon" />
        <meta name="author" content="GAVHARGO" />
        <meta property="og:title" content="GAVHARGO — Qurilish mahsulotlari va xizmatlar" />
        <meta property="og:description" content="Tez va ishonchli qurilish mahsulotlari va xizmatlar O‘zbekiston bo‘ylab." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sizningsaytingiz.uz/" />
        <meta property="og:image" content="https://sizningsaytingiz.uz/preview-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Banner section */}
      <section className='py-5'>
        <div className="container">
          <div className="relative">
            <Swiper
              spaceBetween={30}
              slidesPerView={1.1}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              pagination={{ clickable: true, el: '.custom-pagination' }}
              navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper"
            >
              {banner.map((item, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={item.img}
                    alt=""
                    className="w-full rounded-2xl h-[300px] md:h-[600px] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="custom-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 opacity-50 hover:opacity-100 bg-white rounded-full shadow cursor-pointer">
              <MdKeyboardArrowLeft size={24} />
            </div>
            <div className="custom-next absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 opacity-50 hover:opacity-100 bg-white rounded-full shadow cursor-pointer">
              <MdKeyboardArrowRight size={24} />
            </div>
            <div className="custom-pagination mt-5 flex justify-center gap-2" />
          </div>
        </div>
      </section>

      {/* Products section */}
      <section className='py-10'>
        <div className="container">
          <Link href="/productslist">
            <h2 className='mb-8 text-3xl font-bold flex gap-3 items-center'>
              Qurilish mahsulotlari <MdKeyboardArrowRight />
            </h2>
          </Link>
          <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-6">
            {products.slice(0, visibleCount).map((product) => {
              const isLiked = selectedProducts.some(p => p._id === product._id)
              return (
                <li key={product._id} className="border border-gray-200 rounded-lg shadow-sm">
                  <div className="relative">
                    <button
                      className='absolute right-3 top-2 text-red-600 z-10'
                      onClick={(e) => toggleFavorite(product, e)}
                    >
                      {isLiked ? <BiSolidHeart size={24} /> : <BiHeart size={24} />}
                    </button>
                    <Link href={`/product/${product._id}`}>
                      <img src={product.img?.[0]} alt={product.name} className='w-full h-[280px] object-contain' />
                    </Link>
                  </div>
                  <div className="flex flex-col p-4 gap-2">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-gray-600 text-sm">{product.desc}</p>
                    <p className="text-base font-bold text-second">{product.price} so'm</p>
                    <button
                      onClick={() => setOpenModal(true)}
                      className="mt-auto px-4 py-2 bg-second text-white rounded-lg hover:opacity-80 transition"
                    >
                      Sotib olish
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          {products.length > 4 && (
            <div className="text-center mt-8">
              <button
                className="px-6 py-3 rounded-xl bg-second hover:opacity-50 text-white transition"
                onClick={handleToggle}
              >
                {visibleCount >= products.length ? "Yopish" : "Ko‘proq ko‘rish"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Works section */}
      <section className='py-10'>
        <div className="container">
          <Link href="/works">
            <h2 className='mb-8 text-3xl font-bold flex gap-3 items-center'>
              Xizmatlar <MdKeyboardArrowRight />
            </h2>
          </Link>
          <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-6">
            {works.slice(0, visibleCount).map((work) => {
              const isLiked = selectedProducts.some(p => p._id === work._id)
              return (
                <li key={work._id} className="border border-gray-200 rounded-lg shadow-sm">
                  <div className="relative">
                    <button
                      className='absolute right-3 top-2 text-red-600 z-10'
                      onClick={(e) => toggleFavorite(work, e)}
                    >
                      {isLiked ? <BiSolidHeart size={24} /> : <BiHeart size={24} />}
                    </button>
                    <Link href={`/work/${work._id}`}>
                      <img src={work.img?.[0]} alt={work.name} className='w-full h-[280px] object-contain' />
                    </Link>
                  </div>
                  <div className="flex flex-col p-4 gap-2">
                    <h2 className="text-lg font-semibold">{work.name}</h2>
                    <p className="text-gray-600 text-sm">{work.desc}</p>
                    <button
                      onClick={() => setOpenModal(true)}
                      className="mt-auto px-4 py-2 bg-second text-white rounded-lg hover:opacity-80 transition"
                    >
                      buyurtma
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          {works.length > 4 && (
            <div className="text-center mt-8">
              <button
                className="px-6 py-3 rounded-xl bg-second hover:opacity-50 text-white transition"
                onClick={handleToggle}
              >
                {visibleCount >= works.length ? "Yopish" : "Ko‘proq ko‘rish"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-200">
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"
              onClick={() => setOpenModal(false)}
            >
              <FaTimes size={26} />
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Biz bilan bog‘laning</h2>
            <p className="text-center text-gray-600 mb-8">
              Sotib olish yoki qo‘shimcha ma’lumot uchun quyidagi manzillarga murojaat qiling:
            </p>
            <div className="flex flex-col gap-5 text-center">
              <a href="https://t.me/your_telegram_username" className="flex items-center justify-center gap-3 px-5 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm">
                <FaTelegramPlane size={22} />
                <span className="font-medium">Telegram orqali yozish</span>
              </a>
              <a href="https://instagram.com/your_instagram_username" className="flex items-center justify-center gap-3 px-5 py-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition shadow-sm">
                <FaInstagram size={22} />
                <span className="font-medium">Instagram sahifamiz</span>
              </a>
              <div className="flex items-center justify-center gap-3 px-5 py-3 bg-green-50 text-green-700 rounded-xl shadow-sm">
                <FaPhoneAlt size={20} />
                <span className="font-semibold">+998 90 123 45 67</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Home
