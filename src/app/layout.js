// src/app/layout.js

import './globals.css'
import { AppProvider } from '../context/AppContext'
import MainLayout from '../components/MainLayout'

export const metadata = {
  title: 'IzoGrand',
  description: 'Mahsulotlar do‘koni',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <AppProvider>
          <MainLayout>{children}</MainLayout>
        </AppProvider>
      </body>
    </html>
  )
}
