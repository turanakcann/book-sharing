"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import Cookies from "js-cookie";
import Link from "next/link";

export default function LoginPage() {
  // E-posta state'i tamamen kaldırıldı, Username eklendi
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // FastAPI OAuth2PasswordRequestForm standardı
      const formData = new URLSearchParams();
      formData.append("username", username); // Direkt kullanıcı adını gönderiyoruz
      formData.append("password", password);

      const response = await api.post("/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Token'ı çereze sağlamca kazıyoruz
      Cookies.set("access_token", response.data.access_token, { expires: 7 });
      
      // Navbar'ın uyanması için sayfayı tam yenilemeli yönlendiriyoruz
      window.location.href = "/";
    } catch (err) {
      setError("Kullanıcı adı veya şifre hatalı.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-md bg-theme-card p-10 rounded-3xl border border-theme-border shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-theme-text tracking-tight">Tekrar Hoş Geldin</h2>
          <p className="mt-2 text-sm font-medium text-theme-muted">
            Hesabına giriş yap ve kitapları keşfetmeye devam et.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1.5 ml-1">Kullanıcı Adı</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:border-theme-primary transition-colors"
                placeholder="Kullanıcı adını gir..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1.5 ml-1">Şifre</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:border-theme-primary transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-theme-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 tracking-wide"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-theme-muted">
          Henüz hesabın yok mu?{" "}
          <Link href="/register" className="font-bold text-theme-primary hover:underline">
            Hemen Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}