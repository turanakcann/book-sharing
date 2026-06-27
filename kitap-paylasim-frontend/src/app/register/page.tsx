"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  
  // Tüm form verilerini tek bir merkezde topluyoruz
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    birth_date: "",
    city: "",
    district: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inputlara veri girildikçe state'i otomatik güncelleyen dinamik fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend'e tüm objeyi JSON olarak fırlatıyoruz
      await api.post("/users/register", formData);

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Kayıt işlemi başarısız oldu. Lütfen bilgileri kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Kayıt Ol</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Formu 2 Kolona Böldük (MD ekranlardan itibaren) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Sol Kolon / Sağ Kolon Elemanları */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
              <input type="text" name="username" required placeholder="örn: Ahmet9834"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.username} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input type="email" name="email" required placeholder="örn: mail@ornek.com"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input type="text" name="name" required placeholder="Adınız"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input type="text" name="surname" required placeholder="Soyadınız"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.surname} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <input type="password" name="password" required minLength={8}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.password} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
              <input type="date" name="birth_date" required
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.birth_date} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">İl</label>
              <input type="text" name="city" required placeholder="örn: İzmir"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.city} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">İlçe</label>
              <input type="text" name="district" required placeholder="örn: Bornova"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.district} onChange={handleChange} />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="mt-6 w-full rounded-md bg-green-600 py-3 text-white font-medium transition hover:bg-green-700 focus:outline-none disabled:bg-green-400"
          >
            {loading ? "Kayıt İşlemi Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}