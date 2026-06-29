"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import Cookies from "js-cookie";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. ZOMBİ TEMİZLİĞİ: Tüm hafızayı değil, SADECE bizim erişim çerezimizi (access_token) siliyoruz.
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("token", { path: "/" }); // Eski hatalı kayıtlar varsa onları da uçur

    try {
      const formData = new URLSearchParams();
      formData.append("username", username.trim());
      formData.append("password", password.trim());

      // Backend'in /login rotasına Form-Data atıyoruz
      const response = await api.post("/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // FastAPI default olarak token'ı "access_token" key'i içinde döndürür.
      const incomingToken = response.data.access_token;

      if (!incomingToken) {
        throw new Error("Backend'den token gelmedi!");
      }

      // 2. TERTEMİZ YENİ TOKEN'I DOĞRU İSİMLE YAZIYORUZ (Interceptor'ın aradığı isim: access_token)
      Cookies.set("access_token", incomingToken, { expires: 7, path: "/" });
      
      // 3. HARD REFRESH: Next.js'in önbelleğini kırıp Navbar'ın token'ı görmesini sağlıyoruz
      window.location.href = "/";
    } catch (err: any) {
      console.error("Login Hatası:", err);
      setError(err.response?.data?.detail || "Kullanıcı adı veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-md bg-theme-card p-10 rounded-3xl border border-theme-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-theme-text tracking-tight">Tekrar Hoş Geldin</h2>
          <p className="mt-2 text-sm font-medium text-theme-muted">
            Hesabına giriş yap ve kitapları keşfetmeye devam et.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-3 rounded-xl text-center font-bold animate-fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1.5 ml-1">Kullanıcı Adı</label>
              <input
                type="text"
                autoComplete="off"
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
                autoComplete="off"
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
            className="w-full py-3.5 px-4 bg-theme-text hover:bg-theme-primary text-theme-bg font-bold rounded-xl transition-colors duration-300 disabled:opacity-50 tracking-wide flex justify-center items-center gap-2"
          >
            {loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-b-2 border-theme-bg"></div> Giriş Yapılıyor...</>
            ) : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-theme-muted">
          Henüz hesabın yok mu?{" "}
          <Link href="/register" className="font-bold text-theme-primary hover:text-theme-text transition-colors">
            Hemen Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}