"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/app/lib/api";

interface Listing {
  id: number; price: string; condition: string; is_active: boolean;
  book: { title: string; author: string; cover_image_url: string | null };
}

interface UserProfile {
  username: string; email: string; name: string; surname: string; city: string; district: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // GÜNCELLEME STATE'LERİ
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", surname: "", city: "", district: "" });
  const [saving, setSaving] = useState(false);

  const fetchProfileData = async () => {
    try {
      const userRes = await api.get("/users/me");
      setProfile(userRes.data);
      setEditData({
        name: userRes.data.name, surname: userRes.data.surname, 
        city: userRes.data.city, district: userRes.data.district
      });
      const listingsRes = await api.get("/listings/my-listings");
      setMyListings(listingsRes.data);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfileData(); }, [router]);

  // BİLGİLERİ KAYDETME FONKSİYONU
  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      // Backend'deki kullanıcı güncelleme endpoint'ine istek atıyoruz
      await api.put("/users/me", editData); // Eğer endpoint farklıysa burayı backend'e göre düzelt (örn: patch)
      setProfile(prev => prev ? { ...prev, ...editData } : null);
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

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-theme-primary"></div></div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-theme-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* PROFİL KART KÜNYESİ VE DÜZENLEME ALANI */}
        <div className="rounded-3xl bg-theme-card p-10 border border-theme-border shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative">
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-6 right-6 text-sm font-bold text-theme-muted hover:text-theme-primary transition"
          >
            {isEditing ? "İptal Et ✕" : "Düzenle ✎"}
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
            <div className="h-24 w-24 rounded-full bg-theme-primary text-white flex items-center justify-center text-4xl font-black shadow-md flex-shrink-0">
              {profile?.name.charAt(0)}{profile?.surname.charAt(0)}
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              {isEditing ? (
                // DÜZENLEME FORMU
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in w-full max-w-lg mt-2">
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="px-3 py-2 rounded-lg border border-theme-border bg-theme-bg text-theme-text text-sm focus:border-theme-primary outline-none" placeholder="Ad" />
                  <input type="text" value={editData.surname} onChange={e => setEditData({...editData, surname: e.target.value})} className="px-3 py-2 rounded-lg border border-theme-border bg-theme-bg text-theme-text text-sm focus:border-theme-primary outline-none" placeholder="Soyad" />
                  <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="px-3 py-2 rounded-lg border border-theme-border bg-theme-bg text-theme-text text-sm focus:border-theme-primary outline-none" placeholder="Şehir" />
                  <input type="text" value={editData.district} onChange={e => setEditData({...editData, district: e.target.value})} className="px-3 py-2 rounded-lg border border-theme-border bg-theme-bg text-theme-text text-sm focus:border-theme-primary outline-none" placeholder="İlçe" />
                  <button onClick={handleUpdateProfile} disabled={saving} className="md:col-span-2 bg-theme-primary text-white font-bold py-2 rounded-lg mt-2">
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </div>
              ) : (
                // NORMAL GÖRÜNÜM
                <>
                  <h1 className="text-3xl font-black text-theme-text tracking-tight mb-1">
                    {profile?.name} {profile?.surname}
                  </h1>
                  <p className="text-theme-muted font-medium mb-3">@{profile?.username} • {profile?.email}</p>
                  <span className="inline-block bg-theme-bg border border-theme-border text-theme-text text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                    📍 {profile?.city}, {profile?.district}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* İLANLARIM LİSTESİ (Aynı kaldı) */}
        {/* ... (Aşağıdaki kısımlar bir önceki mesajdaki Listeleme yapısıyla birebir aynıdır, buraya ekleyebilirsin) ... */}
        
        <div className="rounded-3xl bg-theme-card p-10 border border-theme-border shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-theme-border/60 pb-4">
            <h2 className="text-2xl font-bold text-theme-text">İlanların</h2>
            <Link href="/ilan-ekle" className="bg-theme-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              + Yeni İlan Ekle
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-12 bg-theme-bg rounded-2xl border border-theme-border/50">
              <p className="text-theme-muted mb-4 font-medium">Henüz hiç ilan vermemişsin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((listing) => (
                <div key={listing.id} className={`flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border transition-all ${listing.is_active ? 'border-theme-border bg-theme-bg' : 'border-theme-border/40 bg-theme-bg/50 opacity-80'}`}>
                  
                  <div className="flex items-center gap-5 mb-4 sm:mb-0 w-full sm:w-auto">
                    <div className="h-20 w-14 bg-theme-card flex-shrink-0 rounded-md border border-theme-border/50 overflow-hidden flex items-center justify-center">
                      {listing.book.cover_image_url && listing.book.cover_image_url !== "string" ? (
                        <img src={listing.book.cover_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl text-theme-muted">📖</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-theme-text text-lg">{listing.book.title}</h3>
                      <p className="text-sm font-medium text-theme-muted mb-1">{listing.book.author} • {listing.condition}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xl font-black text-theme-text">
                      {parseFloat(listing.price) > 0 ? `${listing.price} ₺` : "Ücretsiz"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(listing.id)} className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-lg text-theme-muted hover:text-red-500 hover:bg-red-50 transition-colors">
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