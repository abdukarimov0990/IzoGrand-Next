'use client';

import React from 'react';
import { FaInstagram, FaTelegramPlane, FaPhoneAlt } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white border-t shadow-sm mt-10">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo va nom */}
        <div className="flex items-center gap-3">
          <Image src="/img/izoLogo.png" alt="Logo" width="90" height="10" />
          <p className="text-gray-600 text-sm">© 2025 Izo. Barcha huquqlar himoyalangan.</p>
        </div>

        {/* Kontaktlar */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-gray-700 text-sm">
          <a href="tel:+998901234567" className="flex items-center gap-2 hover:text-blue-600 transition">
            <FaPhoneAlt size={16} />
            +998 90 123 45 67
          </a>
          <a href="https://t.me/your_telegram_username" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition">
            <FaTelegramPlane size={16} />
            Telegram
          </a>
          <a href="https://instagram.com/your_instagram_username" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-500 transition">
            <FaInstagram size={16} />
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
