'use client'

import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout({ children }) {
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("selectedProducts")
    setSelectedProducts(saved ? JSON.parse(saved) : [])
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts))
    }
  }, [selectedProducts, isClient])

  if (!isClient) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
      />
      <main className="flex-grow mt-[90px]">{children}</main>
      <Footer />
    </div>
  )
}