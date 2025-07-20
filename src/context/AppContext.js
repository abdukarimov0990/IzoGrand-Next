'use client'

import { createContext, useEffect, useState } from 'react'

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState([])

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedProducts')
    if (stored) {
      setSelectedProducts(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('selectedProducts', JSON.stringify(selectedProducts))
  }, [selectedProducts])

  return (
    <AppContext.Provider value={{ selectedProducts, setSelectedProducts }}>
      {children}
    </AppContext.Provider>
  )
}
