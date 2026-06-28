"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Link from "next/link";
import SplashScreen from "@/components/SplashScreen";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        const activeListings = response.data.filter((item: Listing) => item.is_active);
        setListings(activeListings);
      } catch (err) {
        console.error("İlanlar çekilirken hata:", err);
        setError("İlanlar yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const query = searchQuery.toLowerCase();
    return (
      listing.book.title.toLowerCase().includes(query) ||
      listing.book.author.toLowerCase().includes(query) ||
      listing.owner.city.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        /* bg-gray-50 yerine bg-theme-bg */
        <main className="min-h-[calc(100vh-64px)] bg-theme-bg pb-12 animate-fade-in transition-colors duration-300">
          
          {/* HERO BÖLÜMÜ - bg-blue-600 yerine bg-theme-primary */}
          <div className="bg-theme-primary py-16 px-4 sm:px-6 lg:px-8 shadow-inner mb-10 transition-colors duration-300">
            <div className="max-w-4xl mx-auto text-center">
              {/* text-white kalabilir çünkü primary üzerinde her iki temada da beyaz/açık renk şık durur */}
              <h1 className="text-4xl font-extrabold text-theme-bg sm:text-5xl tracking-tight mb-4">
                Aradığın Kitabı Keşfet
              </h1>
              <p className="text-lg text-theme-bg/80 mb-8 max-w-2xl mx-auto">
                Binlerce ikinci el kitap, takaslık eserler ve çok daha fazlası. Kitap adı, yazar veya şehir ara.
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {/* Arama Kutusu: bg-white yerine bg-theme-card, text-gray-900 yerine text-theme-text */}
                <input
                  type="text"
                  placeholder="Kitap, yazar veya şehir (Örn: İzmir) ara..."
                  className="block w-full pl-12 pr-4 py-4 rounded-full bg-theme-card border-2 border-transparent text-theme-text shadow-lg focus:border-theme-hover focus:outline-none text-lg transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* İLANLAR VİTRİNİ */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-theme-text">Güncel İlanlar</h2>
              <span className="text-sm font-medium text-theme-muted">
                {filteredListings.length} sonuç bulundu
              </span>
            </div>
            
            {error ? (
              <div className="rounded bg-red-100/10 border border-red-500/50 p-4 text-red-500">{error}</div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-xl bg-theme-card p-12 text-center shadow-sm border border-theme-border transition-colors">
                <p className="text-xl font-semibold text-theme-text">Aramana uygun kitap bulunamadı.</p>
                <p className="mt-2 text-theme-muted">Farklı kelimelerle tekrar aramayı dene.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="flex flex-col overflow-hidden rounded-xl bg-theme-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-theme-border relative group"
                  >
                    <div className="absolute top-3 left-3 z-10 rounded-full bg-theme-bg/90 px-3 py-1 text-xs font-bold text-theme-text backdrop-blur-sm shadow-sm border border-theme-border">
                      {listing.listing_type}
                    </div>

                    {/* Fotoğraf Alanı */}
                    <div className="h-56 w-full bg-theme-bg flex items-center justify-center relative border-b border-theme-border p-4 transition-colors">
                      {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                        <img 
                          src={listing.book.cover_image_url} 
                          alt={listing.book.title} 
                          className="h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                        />
                      ) : (
                        <svg className="h-16 w-16 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Alt Detaylar */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-theme-text line-clamp-1 flex-1 pr-2">
                          {listing.book.title}
                        </h3>
                        <span className="text-lg font-black text-theme-primary bg-theme-primary/10 px-2 py-0.5 rounded">
                          {parseFloat(listing.price) > 0 ? `${listing.price}₺` : "Hediye"}
                        </span>
                      </div>
                      
                      <p className="mb-3 text-sm font-medium text-theme-muted">{listing.book.author}</p>
                      
                      <div className="mb-4 flex items-center gap-2">
                        <span className="rounded bg-theme-bg border border-theme-border px-2 py-1 text-xs font-semibold text-theme-text">
                          ✨ {listing.condition}
                        </span>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-theme-border/50">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-theme-muted flex items-center gap-1">
                            👤 {listing.owner.username}
                          </span>
                          <span className="text-xs font-bold text-theme-primary flex items-center gap-1 mt-0.5">
                            📍 {listing.owner.city}
                          </span>
                        </div>
                        <Link 
                          href={`/ilan/${listing.id}`}
                          className="rounded-lg bg-theme-bg border border-theme-primary px-4 py-2 text-sm font-bold text-theme-primary transition-all hover:bg-theme-primary hover:text-theme-bg"
                        >
                          İncele
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}