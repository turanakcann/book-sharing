"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Link from "next/link";

// Backend'den gelen detaylı JSON yapısına göre Interface'lerimizi jilet gibi tanımlıyoruz
interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url: string | null;
}

interface Owner {
  id: number;
  username: string;
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

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Rotayı gönderdiğin veriye uygun olarak /listings olarak ayarladık
        const response = await api.get("/listings");

        // Sadece aktif olan ilanları filtreleyip state'e atıyoruz
        const activeListings = response.data.filter((item: Listing) => item.is_active);
        setListings(activeListings);
      } catch (err) {
        console.error("İlanlar çekilirken hata:", err);
        setError("İlanlar yüklenirken bir sorun oluştu. Backend ayakta mı?");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Güncel İlanlar</h1>

        {error ? (
          <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>
        ) : listings.length === 0 ? (
          <div className="rounded bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-500">Şu an aktif bir ilan bulunmuyor.</p>
            <p className="mt-2 text-sm text-gray-400">İlk ilanı veren sen olmak ister misin?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl border border-gray-100 relative"
              >
                {/* İlan Tipi Rozeti (Örn: Satılık / Takaslık) */}
                <div className="absolute top-3 left-3 z-10 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {listing.listing_type}
                </div>

                {/* Kitap Görseli */}
                <div className="h-48 w-full bg-gray-100 flex items-center justify-center relative">
                  {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                    <img
                      src={listing.book.cover_image_url}
                      alt={listing.book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>

                {/* İlan Detayları */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1 pr-2" title={listing.book.title}>
                      {listing.book.title}
                    </h3>
                    <span className="text-lg font-extrabold text-blue-600">
                      {parseFloat(listing.price) > 0 ? `${listing.price} ₺` : "Ücretsiz"}
                    </span>
                  </div>

                  <p className="mb-2 text-sm font-medium text-gray-600">{listing.book.author}</p>

                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Kondisyon: {listing.condition}
                    </span>
                  </div>

                  <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-2">
                    {listing.description || "Açıklama belirtilmemiş."}
                  </p>

                  {/* Kartın Alt Kısmı: Şehir ve Kullanıcı */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-400">👤 {listing.owner.username}</span>
                      <span className="text-xs font-semibold text-blue-700">
                        📍 {listing.owner.city}, {listing.owner.district}
                      </span>
                    </div>
                    <button className="rounded bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white">
                      <Link
                        href={`/ilan/${listing.id}`}
                        className="rounded bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white text-center"
                      >
                        İncele
                      </Link>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}