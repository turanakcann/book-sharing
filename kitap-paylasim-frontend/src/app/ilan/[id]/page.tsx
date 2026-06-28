"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";

// Backend şemamıza uygun interface'ler
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  published_year: number;
  page_count: number;
  description: string;
  cover_image_url: string | null;
}

interface Owner {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  city: string;
  district: string;
}

interface Listing {
  id: number;
  listing_type: string;
  condition: string;
  description: string;
  price: string;
  is_active: boolean;
  book: Book;
  owner: Owner;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListingDetail = async () => {
      if (!params.id) return;
      
      try {
        // Dinamik URL'den gelen ID ile backend'e istek atıyoruz
        const response = await api.get(`/listings/${params.id}`);
        setListing(response.data);
      } catch (err: any) {
        console.error("Detay getirilirken hata oluştu:", err);
        setError("İlan bulunamadı veya kaldırılmış olabilir.");
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="rounded bg-red-100 p-4 text-red-700 max-w-md text-center shadow-sm">
          {error || "Bir şeyler ters gitti."}
        </div>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        
        {/* Üst Kısım: Grid Yapısı (Fotoğraf ve Temel Bilgiler) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          
          {/* Sol Kolon: Büyük Kitap Görseli */}
          <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[350px] relative border border-gray-200 shadow-inner">
            <span className="absolute top-4 left-4 z-10 rounded bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-md">
              {listing.listing_type}
            </span>
            
            {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
              <img 
                src={listing.book.cover_image_url} 
                alt={listing.book.title} 
                className="h-full w-full object-contain max-h-[450px] p-4"
              />
            ) : (
              <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>

          {/* Sağ Kolon: İlan ve Fiyat Detayları */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                {listing.book.title}
              </h1>
              <p className="text-xl font-medium text-gray-600 mb-6">Yazar: {listing.book.author}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-black text-blue-600">
                  {parseFloat(listing.price) > 0 ? `${listing.price} ₺` : "Ücretsiz / Hediye"}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 border">
                  Durum: {listing.condition}
                </span>
              </div>

              {/* Kitap Teknik Künyesi */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-150 space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Sayfa Sayısı:</span><span className="font-bold text-gray-800">{listing.book.page_count}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Basım Yılı:</span><span className="font-bold text-gray-800">{listing.book.published_year}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ISBN:</span><span className="font-mono text-gray-800">{listing.book.isbn !== "string" ? listing.book.isbn : "Belirtilmemiş"}</span></div>
              </div>
            </div>

            {/* İlan Sahibi Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-auto">
              <h3 className="font-bold text-blue-900 mb-2">👤 İlan Sahibi Bilgileri</h3>
              <p className="text-sm text-gray-700 font-medium mb-1">Kullanıcı: <span className="font-bold">{listing.owner.username}</span></p>
              <p className="text-sm text-gray-700 font-medium mb-1">Ad Soyad: {listing.owner.name} {listing.owner.surname}</p>
              <p className="text-sm text-gray-700 font-medium mb-1">📍 Konum: <span className="text-blue-700 font-bold">{listing.owner.city}, {listing.owner.district}</span></p>
              <p className="text-sm text-gray-700 font-medium">✉️ E-posta: <a href={`mailto:${listing.owner.email}`} className="text-blue-600 underline hover:text-blue-800">{listing.owner.email}</a></p>
            </div>

          </div>
        </div>

        {/* Alt Kısım: Açıklamalar */}
        <div className="border-t border-gray-100 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">📝 İlan Açıklaması</h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border">
              {listing.description || "Bu ilan için özel bir açıklama girilmemiş."}
            </p>
          </div>

          {listing.book.description && listing.book.description !== "string" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">📖 Kitap Özeti / Açıklaması</h2>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                {listing.book.description}
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}