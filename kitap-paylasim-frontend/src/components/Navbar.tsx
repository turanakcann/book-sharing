"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
// Tema kontrolcüsünü içeri alıyoruz
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Tema state'ini ve değiştirme fonksiyonunu alıyoruz
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    // bg-white yerine bg-theme-card kullandık ki temaya göre otomatik renk alsın
    <nav className="bg-theme-card shadow-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className="text-2xl font-bold text-theme-text transition-colors">
              📚 KitapPaylaş
            </Link>
          </div>

          <div className="flex items-center gap-4">
            
            {/* TEMA DEĞİŞTİRME BUTONU */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-theme-bg text-theme-text hover:text-theme-primary transition-all duration-300 shadow-inner border border-theme-border flex items-center justify-center"
              title="Temayı Değiştir"
            >
              {theme === "light" ? (
                // Ay İkonu
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                // Güneş İkonu
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link href="/ilan-ekle" className="rounded-md bg-theme-primary px-4 py-2 font-bold text-white transition hover:bg-theme-hover">
                  + İlan Ekle
                </Link>
                <Link href="/profil" className="text-theme-text hover:text-theme-primary font-medium">Profilim</Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium">
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-theme-text hover:text-theme-primary font-medium">Giriş Yap</Link>
                <Link href="/register" className="rounded-md bg-theme-primary px-4 py-2 font-bold text-white transition hover:bg-theme-hover">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}