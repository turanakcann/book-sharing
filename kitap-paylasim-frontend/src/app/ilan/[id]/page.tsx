"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";

interface Listing {
  id: number;
  listing_type: string;
  condition: string;
  description: string;
  price: string;
  book: { title: string; author: string; isbn: string; published_year: number; page_count: number; description: string; cover_image_url: string | null };
  owner: { username: string; email: string; name: string; surname: string; city: string; district: string };
}

// SİHİRLİ DOKUNUŞ: Fotoğraf URL'sini Backend'e yönlendiren fonksiyon
const getImageUrl = (path: string | null) => {
  if (!path || path === "string") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `http://localhost:8000/${cleanPath}`;
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params.id) return;
      try {
        const response = await api.get(`/listings/${params.id}`);
        setListing(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-theme-bg"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-theme-primary"></div></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-text">İlan bulunamadı.</div>;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-theme-bg py-16 px-6 transition-colors duration-300">
      <div className="mx-auto max-w-5xl bg-theme-card rounded-2xl border border-theme-border overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 p-8 md:p-12">
        
        {/* SOL KOLON: YÜZEN KİTAP KAPAK ALANI */}
        <div className="bg-theme-bg rounded-xl border border-theme-border/40 p-8 flex items-center justify-center min-h-[400px] shadow-inner relative">
          <span className="absolute top-4 left-4 bg-theme-text text-theme-bg text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
            {listing.listing_type}
          </span>
          {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
            <img 
              src={getImageUrl(listing.book.cover_image_url) as string} 
              alt="" 
              className="max-h-[400px] object-contain drop-shadow-2xl animate-fade-in" 
            />
          ) : (
            <span className="text-6xl">📖</span>
          )}
        </div>

        {/* SAĞ KOLON: KÜNYE VE AKSİYON BUTONLARI */}
        <div className="flex flex-col justify-between space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-theme-text mb-2">{listing.book.title}</h1>
            <p className="text-lg font-medium text-theme-muted mb-6">Yazan: {listing.book.author}</p>
            
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-theme-text">
                {parseFloat(listing.price) > 0 ? `${listing.price} ₺` : "Ücretsiz"}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider border border-theme-border bg-theme-bg px-3 py-1 rounded-md text-theme-muted">
                Kondisyon: {listing.condition}
              </span>
            </div>

            <div className="border-t border-b border-theme-border/60 py-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-theme-muted font-medium">Sayfa Sayısı</span><span className="font-bold text-theme-text">{listing.book.page_count}</span></div>
              <div className="flex justify-between"><span className="text-theme-muted font-medium">Basım Yılı</span><span className="font-bold text-theme-text">{listing.book.published_year}</span></div>
              <div className="flex justify-between"><span className="text-theme-muted font-medium">ISBN</span><span className="font-mono text-theme-text">{listing.book.isbn !== "string" ? listing.book.isbn : "Yok"}</span></div>
            </div>
          </div>

          <div className="bg-theme-bg border border-theme-border p-5 rounded-xl space-y-2">
            <h4 className="font-bold text-sm tracking-wider uppercase text-theme-text">👤 Kitap Sahibi</h4>
            <p className="text-sm text-theme-muted font-medium">Ad Soyad: <span className="text-theme-text font-bold">{listing.owner.name} {listing.owner.surname}</span></p>
            <p className="text-sm text-theme-muted font-medium">Konum: <span className="text-theme-primary font-bold">{listing.owner.city}, {listing.owner.district}</span></p>
          </div>

          <div className="bg-theme-bg border border-theme-border p-5 rounded-xl space-y-2">
            <h5 className="font-bold text-sm tracking-wider uppercase text-theme-text">Açıklama</h5>
            <p className="text-sm text-theme-muted font-medium">{listing.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parseFloat(listing.price) > 0 && (
              <a 
                href={`mailto:${listing.owner.email}?subject=${listing.book.title} Satın Alma Talebi`}
                className="bg-theme-primary text-white text-center font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity tracking-wide text-sm"
              >
                Satın Al
              </a>
            )}
            <a 
              href={`mailto:${listing.owner.email}?subject=${listing.book.title} İletişim Talebi`}
              className="bg-theme-secondary text-theme-text text-center font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity tracking-wide text-sm"
            >
              Bağış / Takas İste
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}