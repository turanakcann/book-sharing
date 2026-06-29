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

// SİHİRLİ DOKUNUŞ: Fotoğraf URL'sini Backend'e yönlendiren fonksiyon
const getImageUrl = (path: string | null) => {
  if (!path || path === "string") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `http://localhost:8000/${cleanPath}`;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        const activeListings = response.data.filter((item: Listing) => item.is_active);
        setListings(activeListings);
      } catch (err) {
        console.error("Hata:", err);
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
        <main className="min-h-[calc(100vh-64px)] bg-theme-bg pb-24 transition-colors duration-300">
          
          <section className="max-w-4xl mx-auto text-center py-20 px-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-theme-text mb-6">
              Aradığın Kitabı <br />
              <span className="text-theme-primary">Minimalist</span> Bir Çizgide Keşfet
            </h1>
            <p className="text-lg text-theme-muted max-w-2xl mx-auto mb-12 font-medium">
              Ağır ilan sitelerinden uzak, kitaba değer verenlerin buluşma noktası. Satın al, takas et veya hediyeleş.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Kitap başlığı, yazar veya şehir ara..."
                className="w-full px-6 py-4 rounded-full bg-theme-card border border-theme-border text-theme-text shadow-sm focus:outline-none focus:border-theme-primary text-base transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="flex justify-between items-center mb-8 border-b border-theme-border/60 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-theme-text">Katalogdaki Eserler</h2>
              <span className="text-sm font-semibold text-theme-muted bg-theme-card px-3 py-1 rounded-full border border-theme-border">
                {filteredListings.length} Kitap
              </span>
            </div>
            
            {filteredListings.length === 0 ? (
              <div className="rounded-2xl bg-theme-card p-16 text-center border border-theme-border">
                <p className="text-lg font-bold text-theme-text">Eser bulunamadı.</p>
                <p className="text-sm text-theme-muted mt-1">Farklı bir arama yapmayı deneyebilirsin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="flex flex-col rounded-2xl bg-theme-card border border-theme-border p-5 group transition-all duration-300 hover:border-theme-primary shadow-sm hover:shadow-md"
                  >
                    <div className="h-64 w-full bg-theme-bg rounded-xl flex items-center justify-center p-6 mb-5 relative border border-theme-border/40 overflow-hidden">
                      {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                        <img 
                          src={getImageUrl(listing.book.cover_image_url) as string} 
                          alt={listing.book.title} 
                          className="h-full object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                        />
                      ) : (
                        <span className="text-3xl">📖</span>
                      )}
                      
                      <span className="absolute top-3 left-3 text-[11px] font-bold tracking-wider uppercase bg-theme-text text-theme-bg px-2.5 py-1 rounded-md">
                        {listing.listing_type}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-lg font-bold tracking-tight text-theme-text line-clamp-1 flex-1">
                          {listing.book.title}
                        </h3>
                        <span className="text-xl font-black text-theme-primary">
                          {parseFloat(listing.price) > 0 ? `${listing.price}₺` : "0₺"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-theme-muted mb-4">{listing.book.author}</p>
                      
                      <div className="mt-auto pt-4 border-t border-theme-border/40 flex items-center justify-between">
                        <div className="text-[11px] font-bold text-theme-muted tracking-wide space-y-0.5">
                          <div>👤 {listing.owner.username}</div>
                          <div className="text-theme-primary">📍 {listing.owner.city}</div>
                        </div>
                        
                        <Link 
                          href={`/ilan/${listing.id}`}
                          className="text-xs font-bold tracking-wider uppercase bg-theme-bg border border-theme-border px-4 py-2 rounded-lg text-theme-text hover:bg-theme-text hover:text-theme-bg hover:border-theme-text transition-all"
                        >
                          Detaylar →
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      )}
    </>
  );
}