"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", name: "", surname: "", city: "", district: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/users/", formData);
      alert("Kayıt başarılı! Şimdi giriş yapabilirsin.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt işlemi başarısız oldu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg py-12 px-4 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-theme-card p-10 rounded-3xl border border-theme-border shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-theme-text tracking-tight">Aramıza Katıl</h2>
          <p className="mt-2 text-sm font-medium text-theme-muted">
            Bilgilerini doldur ve binlerce kitaba anında eriş.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">Ad</label>
              <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">Soyad</label>
              <input type="text" name="surname" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">Kullanıcı Adı</label>
              <input type="text" name="username" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">E-posta</label>
              <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">Şifre</label>
              <input type="password" name="password" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">Şehir</label>
              <input type="text" name="city" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-theme-muted mb-1 ml-1">İlçe</label>
              <input type="text" name="district" required className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:border-theme-primary focus:outline-none" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 mt-4 bg-theme-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity tracking-wide">
            {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-theme-muted">
          Zaten bir hesabın var mı?{" "}
          <Link href="/login" className="font-bold text-theme-primary hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}