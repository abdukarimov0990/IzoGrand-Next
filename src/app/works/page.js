'use client'

import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import { FaInstagram, FaPhoneAlt, FaTelegramPlane, FaTimes } from 'react-icons/fa'
import { AppContext } from '../../context/AppContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../lib/firebase' // agar firebase.js `lib` ichida bo‘lsa

const WorksList = () => {
  const { selectedProducts, setSelectedProducts } = useContext(AppContext)
  const [visibleCount, setVisibleCount] = useState(8)
  const [openModal, setOpenModal] = useState(false)
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'works'))
        const worksArray = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }))
        setWorks(worksArray)
      } catch (error) {
        console.error("Xizmatlar yuklanmadi:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorks()
  }, [])

  const toggleFavorite = (work, e) => {
    e.stopPropagation()
    e.preventDefault()
    const isSelected = selectedProducts?.some(p => p._id === work._id)
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== work._id))
    } else {
      setSelectedProducts([...selectedProducts, work])
    }
  }

  const handleToggle = () => {
    setVisibleCount(visibleCount >= works.length ? 8 : visibleCount + 8)
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Yuklanmoqda...</div>
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {works.slice(0, visibleCount).map((work, index) => {
          const isLiked = selectedProducts?.some(p => p._id === work._id)
          return (
            <li key={index} className="border border-gray-200 rounded-lg shadow-sm">
              <div className="relative">
                <button
                  className="absolute right-3 top-2 text-red-600 z-10"
                  onClick={(e) => toggleFavorite(work, e)}
                >
                  {isLiked ? <BiSolidHeart size={24} /> : <BiHeart size={24} />}
                </button>
                <Link href={`/work/${work._id}`}>
                  <img src={work.img?.[0]} alt={work.name} className="w-full h-[280px] object-contain" />
                </Link>
              </div>
              <div className="flex flex-col p-4 gap-2">
                <h2 className="text-lg font-semibold">{work.name}</h2>
                <p className="text-gray-600 text-sm">{work.desc}</p>

                <button
                  onClick={() => setOpenModal(true)}
                  className="mt-auto px-4 py-2 bg-second text-white rounded-lg hover:opacity-80 transition"
                >
                  Xizmatdan foydalanish
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {works.length > 8 && (
        <div className="text-center mt-8">
          <button
            className="px-6 py-3 bg-white text-second border border-second rounded-xl hover:bg-second hover:text-white transition"
            onClick={handleToggle}
          >
            {visibleCount >= works.length ? 'Yopish' : 'Ko‘proq ko‘rish'}
          </button>
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-200">
            <button
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"
              onClick={() => setOpenModal(false)}
            >
              <FaTimes size={26} />
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Biz bilan bog‘laning
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Sotib olish yoki qo‘shimcha ma’lumot uchun quyidagi manzillarga murojaat qiling:
            </p>

            <div className="flex flex-col gap-5 text-center">
              <a
                href="https://t.me/your_telegram_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-5 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm"
              >
                <FaTelegramPlane size={22} />
                <span className="font-medium">Telegram orqali yozish</span>
              </a>

              <a
                href="https://instagram.com/your_instagram_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-5 py-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition shadow-sm"
              >
                <FaInstagram size={22} />
                <span className="font-medium">Instagram sahifamiz</span>
              </a>

              <div className="flex items-center justify-center gap-3 px-5 py-3 bg-green-50 text-green-700 rounded-xl shadow-sm">
                <FaPhoneAlt size={20} />
                <span className="font-semibold">+998 90 123 45 67</span>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
              <p>Sizning murojaatingiz biz uchun muhim ❤️</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorksList
