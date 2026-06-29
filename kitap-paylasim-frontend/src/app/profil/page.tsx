"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/api";
import Cookies from "js-cookie";

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

// SİHİRLİ DOKUNUŞ: Fotoğraf URL'sini Backend'e yönlendiren fonksiyon
const getImageUrl = (path: string | null) => {
  if (!path || path === "string") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `http://localhost:8000/${cleanPath}`;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", surname: "", city: "", district: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await api.get("/users/me");
        setProfile(userRes.data);
        setEditData({
          name: userRes.data.name, 
          surname: userRes.data.surname, 
          city: userRes.data.city, 
          district: userRes.data.district
        });

        const listingsRes = await api.get("/listings/my-listings");
        setMyListings(listingsRes.data);
      } catch (err: any) {
        console.error("Profil yüklenirken hata:", err);
        if (err.response?.status === 401) {
          Cookies.remove("access_token");
          router.push("/login");
        } else {
          alert(`Profil çekilemedi! Hata Kodu: ${err.response?.status}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [router]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/me", editData); 
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Bilgiler güncellenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (listingId: number) => {
    if (!window.confirm("Bu ilanı kalıcı olarak silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setMyListings(myListings.filter(l => l.id !== listingId));
    } catch (err) { alert("Silinemedi."); }
  };

  const handleToggleStatus = async (listingId: number) => {
    try {
      const res = await api.patch(`/listings/${listingId}/toggle-status`);
      setMyListings(myListings.map(l => l.id === listingId ? { ...l, is_active: res.data.is_active } : l));
    } catch (err) { alert("Durum güncellenemedi."); }
  };

  if (loading) return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-theme-primary"></div>
      </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-theme-bg py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-4xl space-y-12"> 
        
        <div className="rounded-2xl bg-theme-card p-10 border border-theme-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center sm:items-start sm:flex-row gap-8 relative transition-all">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-6 right-6 text-sm font-semibold tracking-wide text-theme-muted hover:text-theme-text transition-colors flex items-center gap-1"
          >
            {isEditing ? (
              <><span className="text-lg">✕</span> İptal</>
            ) : (
              <><span className="text-lg">✎</span> Düzenle</>
            )}
          </button>

          <div className="h-28 w-28 rounded-full bg-theme-primary/10 border-2 border-theme-primary/20 text-theme-primary flex items-center justify-center text-4xl font-light tracking-tighter flex-shrink-0">
            {profile?.name.charAt(0)}{profile?.surname.charAt(0)}
          </div>
            
          <div className="flex-1 w-full text-center sm:text-left mt-2 sm:mt-0">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in w-full max-w-lg mx-auto sm:mx-0">
                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="px-4 py-3 rounded-xl border border-theme-border bg-transparent text-theme-text text-sm focus:border-theme-primary outline-none transition-colors" placeholder="Ad" />
                <input type="text" value={editData.surname} onChange={e => setEditData({...editData, surname: e.target.value})} className="px-4 py-3 rounded-xl border border-theme-border bg-transparent text-theme-text text-sm focus:border-theme-primary outline-none transition-colors" placeholder="Soyad" />
                <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="px-4 py-3 rounded-xl border border-theme-border bg-transparent text-theme-text text-sm focus:border-theme-primary outline-none transition-colors" placeholder="Şehir" />
                <input type="text" value={editData.district} onChange={e => setEditData({...editData, district: e.target.value})} className="px-4 py-3 rounded-xl border border-theme-border bg-transparent text-theme-text text-sm focus:border-theme-primary outline-none transition-colors" placeholder="İlçe" />
                <button 
                  onClick={handleUpdateProfile} 
                  disabled={saving} 
                  className="sm:col-span-2 bg-theme-text hover:bg-theme-primary text-theme-bg font-semibold tracking-wide py-3 rounded-xl mt-2 transition-colors flex justify-center items-center gap-2"
                >
                  {saving ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div> Kaydediliyor...</>
                  ) : "Değişiklikleri Kaydet"}
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h1 className="text-4xl font-extrabold text-theme-text tracking-tight mb-2">
                  {profile?.name} {profile?.surname}
                </h1>
                <p className="text-theme-muted font-medium mb-4 text-lg">@{profile?.username}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-transparent border border-theme-border text-theme-text text-xs font-semibold px-4 py-2 rounded-full tracking-wide">
                    ✉️ {profile?.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-transparent border border-theme-border text-theme-text text-xs font-semibold px-4 py-2 rounded-full tracking-wide">
                    📍 {profile?.city}, {profile?.district}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-theme-border/60 pb-4 gap-4">
            <h2 className="text-3xl font-extrabold text-theme-text tracking-tight">İlanların</h2>
            <Link href="/ilan-ekle" className="text-sm font-semibold tracking-wide text-theme-primary border-b-2 border-transparent hover:border-theme-primary transition-colors pb-1">
              + Yeni İlan Ekle
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-20 bg-theme-card/50 rounded-3xl border border-theme-border border-dashed">
              <span className="text-4xl mb-4 block">📚</span>
              <p className="text-theme-muted mb-2 font-medium text-lg">Kütüphanen henüz boş.</p>
              <p className="text-sm text-theme-muted/70">Okuduğun kitapları paylaşarak başkalarına ilham ol.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myListings.map((listing) => (
                <div 
                  key={listing.id} 
                  className={`group flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${listing.is_active ? 'border-theme-border bg-theme-card' : 'border-theme-border/40 bg-theme-card/40 grayscale-[20%]'}`}
                >
                  
                  <div className="flex items-center gap-6 mb-4 sm:mb-0 w-full sm:w-auto">
                    <div className="h-28 w-20 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-transparent drop-shadow-md group-hover:-translate-y-1 transition-transform">
                      {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                        <img src={getImageUrl(listing.book.cover_image_url) as string} alt={listing.book.title} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <div className="h-full w-full bg-theme-border/20 flex items-center justify-center rounded-lg border border-theme-border/50">
                            <span className="text-2xl opacity-50">📖</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-theme-text text-xl mb-1 group-hover:text-theme-primary transition-colors">{listing.book.title}</h3>
                      <p className="text-sm font-medium text-theme-muted mb-2">{listing.book.author}</p>
                      <span className="inline-block px-3 py-1 bg-theme-bg border border-theme-border rounded-md text-xs font-semibold text-theme-text">
                        {listing.condition}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <span className="text-2xl font-black text-theme-text">
                      {parseFloat(listing.price) > 0 ? `${listing.price}₺` : "Ücretsiz"}
                    </span>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleToggleStatus(listing.id)}
                            className="text-xs font-semibold text-theme-muted hover:text-theme-text transition-colors"
                        >
                            {listing.is_active ? "Pasife Al" : "Aktifleştir"}
                        </button>
                        <span className="text-theme-border">|</span>
                        <button 
                            onClick={() => handleDelete(listing.id)} 
                            className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
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