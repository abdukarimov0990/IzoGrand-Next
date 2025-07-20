'use client'

import { useSearchParams } from 'next/navigation'
import { useContext } from 'react'
import { products } from '@/data/data'
import { BiHeart, BiSolidHeart } from 'react-icons/bi'
import Image from 'next/image'
import result from "../../../public/img/result.svg"
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { AppContext } from '../../context/AppContext'

const Search = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.toLowerCase() || ''
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query)
  )

  const { selectedProducts, setSelectedProducts } = useContext(AppContext) || {}

  const toggleFavorite = (product) => {
    const isSelected = selectedProducts.some(p => p.name === product.name)
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.name !== product.name))
    } else {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {filteredProducts.length > 0 && (
        <h2 className="text-2xl font-bold mb-4">
          Qidiruv natijalari: "{query}"
        </h2>
      )}

      {filteredProducts.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const isLiked = selectedProducts.some(p => p.name === product.name)
            return (
              <li key={index} className="border border-gray-200 rounded-lg shadow-sm">
                <div className="relative">
                  <button
                    className="absolute right-3 top-2 text-red-600"
                    onClick={() => toggleFavorite(product)}
                  >
                    {isLiked ? <BiSolidHeart size={24} /> : <BiHeart size={24} />}
                  </button>
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-[280px] object-contain"
                  />
                </div>
                <div className="flex flex-col p-4 gap-2">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-600 text-sm">{product.desc}</p>
                  <p className="text-base font-bold text-second">{product.price} so'm</p>
                  <button className="mt-auto px-4 py-2 bg-second text-white rounded-lg hover:opacity-80 transition">
                    Sotib olish
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="w-full h-[50vh] flex justify-center flex-col gap-5 items-center text-center">
          <Image src={result} alt="result" width={300} height={200} />
          <h3 className="text-xl">
            <span className="font-bold">{query}</span> so‘rovi bo‘yicha hech qanday mahsulot topilmadi
          </h3>
        </div>
      )}
    </div>
  )
}

export default Search
