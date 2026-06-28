"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // Kullanıcı bilgilerini tutacağımız state
  const [user, setUser] = useState<{ username: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");

      // Token yoksa hiç backend'i yorma, direkt loading'i bitir
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        // Token varsa backend'den kim olduğunu sor
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Oturum süresi dolmuş veya geçersiz token.");
        setUser(null);
        // Token patlaksa temizle
        Cookies.remove("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  const handleLogout = () => {
    // Çıkış yaparken token'ı sil ve ana sayfaya/login'e fırlat
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Sol Kısım: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                Kitap<span className="text-gray-800">Paylaş</span>
              </span>
            </Link>
          </div>

          {/* Sağ Kısım: Kullanıcı İşlemleri */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <>
                <span className="text-gray-700 font-medium hidden sm:block">
                  Hoş geldin, <span className="font-bold text-blue-600">{user.username}</span>
                </span>

                {/* YENİ EKLENEN İLAN EKLE BUTONU */}
                <Link
                  href="/ilan-ekle"
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 shadow-sm"
                >
                  + İlan Ekle
                </Link>
                <Link
                  href="/profil"
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2"
                >
                  Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
                  Giriş Yap
                </Link>
                <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm">
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