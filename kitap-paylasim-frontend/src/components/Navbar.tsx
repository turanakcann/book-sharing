"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { theme, toggleTheme } = useTheme();

  // Dışarı tıklanınca dropdown'ı kapatma mekanizması
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsLoggedIn(!!token);
    setIsDropdownOpen(false); // Sayfa değiştiğinde menüyü kapat
  }, [pathname]);

  const handleLogout = () => {
    // Hem kök dizinden hem de olası alt dizinlerden çerezi siliyoruz
    Cookies.remove("access_token", { path: '/' });
    Cookies.remove("access_token"); 
    
    // Tarayıcıdaki tüm önbelleği (cache) ve state'leri temizliyoruz
    localStorage.clear();
    sessionStorage.clear();
    
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    
    // Tam yenileme yaparak eski kullanıcının verilerini RAM'den siliyoruz
    window.location.href = "/login";
  };

  return (
    // Max-w'yi genişlettik, sağa sola daha çok yaslandı
    <nav className="bg-theme-card shadow-sm transition-colors duration-300 border-b border-theme-border relative z-50">
      <div className="mx-auto max-w-[1400px] w-full px-6 md:px-12">
        <div className="flex h-20 justify-between items-center">
          
          {/* LOGO */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black text-theme-text transition-colors tracking-tight flex items-center gap-2">
              <span className="text-theme-primary">📚</span> KitapPaylaş
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {/* TEMA DEĞİŞTİRME BUTONU */}
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-theme-bg text-theme-text hover:text-theme-primary transition-all duration-300 shadow-inner border border-theme-border flex items-center justify-center">
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* AVATAR BUTONU */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center h-11 w-11 rounded-full bg-theme-primary text-white font-bold text-lg shadow-md border-2 border-theme-card hover:scale-105 transition-transform"
                >
                  KP
                </button>

                {/* AÇILIR MENÜ (DROPDOWN) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-theme-card border border-theme-border shadow-xl py-2 animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-theme-border/50 mb-2">
                      <p className="text-sm font-medium text-theme-muted">Hoş geldin</p>
                      <p className="text-sm font-bold text-theme-text truncate">Kitap Kurdu</p>
                    </div>
                    
                    <Link href="/profil" className="flex items-center px-4 py-2.5 text-sm font-bold text-theme-text hover:bg-theme-bg transition-colors">
                      👤 Profilim
                    </Link>
                    <Link href="/kitaplik" className="flex items-center px-4 py-2.5 text-sm font-bold text-theme-text hover:bg-theme-bg transition-colors">
                      🏛️ Kitaplığım
                    </Link>
                    <Link href="/ilan-ekle" className="flex items-center px-4 py-2.5 text-sm font-bold text-theme-primary hover:bg-theme-bg transition-colors">
                      ➕ İlan Ekle
                    </Link>
                    <div className="h-px bg-theme-border/50 my-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                      🚪 Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link href="/login" className="text-theme-text hover:text-theme-primary font-bold px-2 py-2">Giriş Yap</Link>
                <Link href="/register" className="rounded-xl bg-theme-text text-theme-bg px-5 py-2.5 font-bold transition hover:opacity-80">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}