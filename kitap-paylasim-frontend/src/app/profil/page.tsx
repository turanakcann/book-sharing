"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/api";

interface Listing {
  id: number;
  price: string;
  condition: string;
  is_active: boolean;
  book: { title: string; author: string; cover_image_url: string | null };
}

interface UserProfile {
  username: string;
  email: string;
  name: string;
  surname: string;
  city: string;
  district: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Verileri çekme fonksiyonunu dışarı aldık ki silme işleminden sonra sayfayı yenileyebilelim
  const fetchProfileData = async () => {
    try {
      const userRes = await api.get("/users/me");
      setProfile(userRes.data);

      const listingsRes = await api.get("/listings/my-listings");
      setMyListings(listingsRes.data);
    } catch (err) {
      console.error("Profil yüklenirken hata:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [router]);

  // --- YENİ EKLENEN SİLME FONKSİYONU ---
  const handleDelete = async (listingId: number) => {
    const isConfirmed = window.confirm("Bu ilanı kalıcı olarak silmek istediğine emin misin?");
    if (!isConfirmed) return;

    try {
      await api.delete(`/listings/${listingId}`);
      // Sildikten sonra listeyi ekrandan anında kaldır (Optimizasyon)
      setMyListings(myListings.filter(l => l.id !== listingId));
    } catch (err) {
      alert("İlan silinirken bir hata oluştu.");
    }
  };

  // --- YENİ EKLENEN DURUM DEĞİŞTİRME FONKSİYONU ---
  const handleToggleStatus = async (listingId: number) => {
    try {
      const res = await api.patch(`/listings/${listingId}/toggle-status`);
      // Listeyi güncelle (Sadece değişen ilanın is_active durumunu değiştir)
      setMyListings(myListings.map(l => 
        l.id === listingId ? { ...l, is_active: res.data.is_active } : l
      ));
    } catch (err) {
      alert("İlan durumu güncellenemedi.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* PROFİL KARTI */}
        <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Hoş geldin, {profile?.name} {profile?.surname}
            </h1>
            <p className="text-gray-500 font-medium">@{profile?.username} • {profile?.email}</p>
            <p className="text-blue-600 font-semibold mt-2">📍 {profile?.city}, {profile?.district}</p>
          </div>
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-2 border-blue-200">
            {profile?.name.charAt(0)}{profile?.surname.charAt(0)}
          </div>
        </div>

        {/* KULLANICININ İLANLARI */}
        <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Senin İlanların</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
              Toplam: {myListings.length}
            </span>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Henüz hiç ilan vermemişsin.</p>
              <Link href="/ilan-ekle" className="rounded-md bg-blue-600 px-4 py-2 text-white font-bold transition hover:bg-blue-700">
                İlk İlanını Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((listing) => (
                <div key={listing.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition ${listing.is_active ? 'border-gray-200 bg-white hover:bg-gray-50' : 'border-gray-200 bg-gray-100 opacity-75'}`}>
                  
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="h-16 w-12 bg-gray-200 flex-shrink-0 rounded border">
                      {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                        <img src={listing.book.cover_image_url} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Foto</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{listing.book.title}</h3>
                      <p className="text-sm text-gray-500">{listing.book.author} • {listing.condition}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-bold text-gray-700 mr-2 sm:mr-4">
                      {parseFloat(listing.price) > 0 ? `${listing.price} ₺` : "Ücretsiz"}
                    </span>
                    <span className={`px-2 py-1 text-xs font-bold rounded mr-2 ${listing.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {listing.is_active ? "Yayında" : "Pasif"}
                    </span>
                    
                    {/* CANLANDIRILMIŞ BUTONLAR */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(listing.id)}
                        className={`font-medium text-sm px-3 py-1.5 rounded transition ${listing.is_active ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {listing.is_active ? 'Yayından Kaldır' : 'Tekrar Yayınla'}
                      </button>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm px-3 py-1.5 rounded transition"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}