"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";

export default function AddListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fotoğrafı tutacağımız yeni state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    published_year: "",
    page_count: "",
    book_description: "",
    listing_type: "Satılık",
    condition: "Yeni Gibi",
    price: "",
    listing_description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dosya seçildiğinde çalışacak fonksiyon
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // --- 1. AŞAMA: Kitabı Oluştur ---
      const bookPayload = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || "string",
        published_year: parseInt(formData.published_year) || 2024,
        page_count: parseInt(formData.page_count) || 1,
        description: formData.book_description || "string",
        cover_image_url: "string" // Arka plan fotoğrafı yükleyene kadar geçici
      };

      const bookResponse = await api.post("/books", bookPayload);
      const createdBookId = bookResponse.data.id;

      // --- 2. AŞAMA: Kapak Fotoğrafını Yükle (Eğer seçilmişse) ---
      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedFile);

        await api.post(`/books/${createdBookId}/upload-cover`, imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // --- 3. AŞAMA: İlanı Oluştur ---
      const listingPayload = {
        book_id: createdBookId,
        listing_type: formData.listing_type,
        condition: formData.condition,
        description: formData.listing_description,
        price: parseFloat(formData.price) || 0.0
      };

      await api.post("/listings", listingPayload);
      router.push("/");
      
    } catch (err: any) {
      console.error("Hata Detayı:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(JSON.stringify(err.response.data.detail));
      } else {
        setError("İlan eklenirken bir hata oluştu. Lütfen tüm alanları kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-8 text-3xl font-bold text-gray-900 border-b pb-4">Yeni İlan Oluştur</h2>
        
        {error && <div className="mb-6 rounded bg-red-100 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. BÖLÜM: KİTAP BİLGİLERİ */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Kitap Bilgileri</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kitap Adı</label>
                <input type="text" name="title" required className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.title} onChange={handleChange} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Yazar</label>
                <input type="text" name="author" required className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.author} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kapak Fotoğrafı</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN (Opsiyonel)</label>
                <input type="text" name="isbn" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.isbn} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Basım Yılı</label>
                  <input type="number" name="published_year" required className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.published_year} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sayfa Sayısı</label>
                  <input type="number" name="page_count" required className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.page_count} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* 2. BÖLÜM: İLAN BİLGİLERİ */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🏷️ İlan Detayları</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">İlan Tipi</label>
                <select name="listing_type" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.listing_type} onChange={handleChange}>
                  <option value="Satılık">Satılık</option>
                  <option value="Takaslık">Takaslık</option>
                  <option value="Hediye">Hediye</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisyon</label>
                <select name="condition" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.condition} onChange={handleChange}>
                  <option value="Sıfır">Sıfır</option>
                  <option value="Yeni Gibi">Yeni Gibi</option>
                  <option value="İyi">İyi</option>
                  <option value="Yıpranmış">Yıpranmış</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
                <input type="number" step="0.01" name="price" placeholder="Takaslık veya hediyeyse 0 bırakabilirsiniz" className="mt-1 w-full md:w-1/2 rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.price} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">İlan Açıklaması</label>
                <textarea name="listing_description" rows={3} placeholder="Alıcılara iletmek istediğiniz notlar..." className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1" value={formData.listing_description} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 py-3 text-lg font-bold text-white transition hover:bg-blue-700 focus:outline-none disabled:bg-blue-400">
            {loading ? "İlan Yükleniyor..." : "İlanı Yayına Al"}
          </button>
        </form>
      </div>
    </div>
  );
}