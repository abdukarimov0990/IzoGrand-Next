'use client';

import React, { useState, useContext } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { HiHeart } from 'react-icons/hi';
import { PiPhoneFill } from 'react-icons/pi';
import { MdDesignServices } from 'react-icons/md';
import {
  AiFillProduct,
  AiOutlineClose,
  AiOutlineMenu,
  AiOutlineSearch,
} from 'react-icons/ai';
import { AppContext } from '../context/AppContext'; // 🔥 MUHIM
import { FaInstagram, FaPhoneAlt, FaTelegramPlane, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false)

  const { selectedProducts, setSelectedProducts } = useContext(AppContext); // ✅ SHU YERDA

  const handleRemove = (itemToRemove) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.name !== itemToRemove.name)
    );
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
      }
    }
  };


  return (
    <header className="bg-white text-black shadow-md fixed w-full z-50">
      <div className="container py-4 flex justify-between items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/img/izoLogo.png" alt="Logo" width="90" height="10" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Mahsulot qidirish..."
            className="w-full py-2 px-4 border border-gray-300 rounded-xl outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileSearchOpen((prev) => !prev)} className="md:hidden text-gray-700">
            <AiOutlineSearch size={24} />
          </button>

          <button
            onClick={() => setOpen(true)}
            className="relative p-2 bg-black/5 rounded-lg text-second"
          >
            <HiHeart size={26} />
            {selectedProducts.length > 0 && (
              <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-xs rounded-full px-1.5">
                {selectedProducts.length}
              </span>
            )}
          </button>

          <Link href="/works">
            <button className="hidden md:flex items-center gap-2 bg-second text-white py-2 px-4 rounded-lg hover:opacity-80 transition">
              <MdDesignServices size={20} />
              <span>Xizmatlar</span>
            </button>
          </Link>

          <Link href="/productslist">
            <button className="hidden md:flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:opacity-80 transition">
              <AiFillProduct />
              <span>Mahsulotlar</span>
            </button>
          </Link>

            <button onClick={()=>setOpenModal(true)} className="hidden md:flex items-center gap-2 bg-gray-800 text-white py-2 px-4 rounded-lg hover:opacity-80 transition">
              <PiPhoneFill size={20} />
              <span>Bizga bog'laning</span>
            </button>

          <button className="md:hidden" onClick={() => setMenuOpen((prev) => !prev)}>
            <AiOutlineMenu size={26} />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            autoFocus
            placeholder="Mahsulot qidirish..."
            className="w-full py-2 px-4 border border-gray-300 rounded-xl outline-none"
          />
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50">
          <div className="bg-white w-64 h-full p-6 relative shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-600"
              onClick={() => setMenuOpen(false)}
            >
              <AiOutlineClose size={24} />
            </button>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Mahsulot qidirish..."
              className="w-full py-2 px-4 border border-gray-300 rounded-xl outline-none mb-6"
            />

            <Link href="#" className="flex items-center gap-2 py-2 text-second font-medium" onClick={() => setMenuOpen(false)}>
              <MdDesignServices size={20} />
              Xizmatlar
            </Link>

            <Link href="/products" className="flex items-center gap-2 py-2 text-second font-medium" onClick={() => setMenuOpen(false)}>
              <AiFillProduct />
              Mahsulotlar
            </Link>

            <Link href="/contact" className="flex items-center gap-2 py-2 text-second font-medium" onClick={() => setMenuOpen(false)}>
              <PiPhoneFill size={20} />
              Bog'lanish
            </Link>
          </div>
        </div>
      )}

      {/* Drawer - Favorites */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
          <div className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold">Tanlangan Mahsulotlar</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-black"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            {selectedProducts.length === 0 ? (
              <p className="text-gray-500">Hozircha mahsulot tanlanmagan</p>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-3 border rounded-lg shadow-sm relative"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 object-contain border rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                      <p className="text-blue-600 font-bold">{item.price} so'm</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-red-500 absolute top-2 right-2"
                    >
                      <AiOutlineClose />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div className="mt-6">
                <button onClick={()=>setOpenModal(true)} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Buyurtma berish
                </button>
              </div>
            )}
          </div>
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

              <div className="flex items-center justify-center gap-3 px-5 py-3 bg-blue-50 text-blue-700 rounded-xl shadow-sm">
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
    </header>
  );
};

export default Header;
