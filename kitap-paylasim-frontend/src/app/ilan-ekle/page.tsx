"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";

export default function AddListingPage() {
  const router = useRouter();

  // AŞAMALAR: 1 (Kitap), 2 (Fotoğraf), 3 (İlan)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Kitap Verileri
  const [bookData, setBookData] = useState({
    title: "", author: "", isbn: "", published_year: "", page_count: "", description: "",
  });
  const [createdBookId, setCreatedBookId] = useState<number | null>(null);

  // Step 2: Kapak Fotoğrafı
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Step 3: İlan Verileri
  const [listingData, setListingData] = useState({
    listing_type: "Satılık", condition: "Yeni Gibi", price: "", description: "",
  });

  // --- API İSTEKLERİ ---

  // Adım 1'i onayla: Kitabı Yarat
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // FRONTEND KATI KONTROLLERİ (Pydantic gelmeden biz kesiyoruz)
    const isbnClean = bookData.isbn.trim();
    if (isbnClean.length !== 10 && isbnClean.length !== 13) {
      return setError("ISBN numarası tam olarak 10 veya 13 hane olmalıdır!");
    }
    const year = parseInt(bookData.published_year);
    if (year < 1000 || year > new Date().getFullYear()) {
      return setError(`Basım yılı 1000 ile ${new Date().getFullYear()} arasında olmalıdır!`);
    }
    if (parseInt(bookData.page_count) <= 0) {
      return setError("Sayfa sayısı 0'dan büyük olmalıdır!");
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/books/", {
        title: bookData.title,
        author: bookData.author,
        isbn: isbnClean, // Zorunlu 10/13 hane
        published_year: year,
        page_count: parseInt(bookData.page_count),
        description: bookData.description || "Açıklama girilmedi."
      });
      setCreatedBookId(res.data.id);
      setStep(2);
    } catch (err: any) {
      console.log(err.response?.data);
      setError("Kitap oluşturulurken hata oluştu. Lütfen bilgileri kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  // Adım 2'yi onayla: Fotoğraf Yükle (veya Atla)
  const handleUploadCover = async () => {
    if (!selectedFile) {
      setStep(3); // Dosya yoksa direkt 3. adıma geç
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await api.post(`/books/${createdBookId}/upload-cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStep(3);
    } catch (err) {
      setError("Fotoğraf yüklenemedi. 'Atla' butonunu kullanabilirsin.");
    } finally {
      setLoading(false);
    }
  };

  // Adım 3'ü onayla: İlanı Yayınla
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/listings/", {
        ...listingData,
        book_id: createdBookId,
        price: listingData.price ? listingData.price : "0",
      });
      router.push("/profil");
    } catch (err) {
      setError("İlan oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI YARDIMCILARI ---
  const inputClass = "w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:border-theme-primary transition-colors font-medium";
  const labelClass = "block text-sm font-bold text-theme-muted mb-1.5 ml-1";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-theme-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-3xl bg-theme-card p-8 md:p-12 rounded-3xl border border-theme-border shadow-sm">

        {/* ÜST BAŞLIK VE İLERLEME ÇUBUĞU */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-theme-text tracking-tight mb-2">Yeni İlan Oluştur</h1>
          <p className="text-sm font-medium text-theme-muted mb-6">
            Eserini diğer okurlarla paylaşmak için 3 kısa adımı tamamla.
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-colors duration-500 ${step >= s ? 'bg-theme-primary' : 'bg-theme-border/50'}`}></div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${step >= s ? 'text-theme-primary' : 'text-theme-muted'}`}>
                  {s === 1 ? "Kitap Künyesi" : s === 2 ? "Kapak" : "İlan Detayı"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50/50 border border-red-200 text-red-600 text-sm p-4 rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* --- ADIM 1: KİTAP BİLGİLERİ --- */}
        {step === 1 && (
          <form onSubmit={handleCreateBook} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Kitap Adı</label>
                <input type="text" required className={inputClass} placeholder="Örn: Suç ve Ceza" value={bookData.title} onChange={e => setBookData({ ...bookData, title: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Yazar</label>
                <input type="text" required className={inputClass} placeholder="Örn: Dostoyevski" value={bookData.author} onChange={e => setBookData({ ...bookData, author: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>ISBN <span className="text-red-500">*</span></label>
                <input type="text" required maxLength={13} minLength={10} className={inputClass} placeholder="Sadece sayı (10 veya 13 hane)" value={bookData.isbn} onChange={e => setBookData({ ...bookData, isbn: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <label className={labelClass}>Basım Yılı</label>
                <input type="number" required min={1000} max={new Date().getFullYear()} className={inputClass} placeholder="Örn: 2020" value={bookData.published_year} onChange={e => setBookData({ ...bookData, published_year: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Sayfa Sayısı</label>
                <input type="number" required min={1} className={inputClass} placeholder="Örn: 687" value={bookData.page_count} onChange={e => setBookData({ ...bookData, page_count: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Kitap Hakkında Kısa Açıklama</label>
                <textarea rows={3} required className={`${inputClass} resize-none`} placeholder="Kitabın konusundan kısaca bahset..." value={bookData.description} onChange={e => setBookData({ ...bookData, description: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-theme-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity tracking-wide mt-4">
              {loading ? "Kaydediliyor..." : "İleri: Kapak Fotoğrafı →"}
            </button>
          </form>
        )}

        {/* --- ADIM 2: KAPAK FOTOĞRAFI --- */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in text-center py-6">
            <div className="border-2 border-dashed border-theme-border rounded-2xl p-10 bg-theme-bg/50 hover:bg-theme-bg transition-colors">
              <span className="text-4xl mb-4 block">📸</span>
              <label className="cursor-pointer">
                <span className="bg-theme-text text-theme-bg px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity inline-block mb-3">
                  Fotoğraf Seç
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
              {selectedFile ? (
                <p className="text-sm font-bold text-theme-primary mt-2">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-theme-muted font-medium mt-2">Sadece JPG, PNG formatları desteklenir.</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(3)} className="flex-1 py-4 font-bold text-theme-muted hover:text-theme-text transition-colors">
                Fotoğrafı Atla
              </button>
              <button onClick={handleUploadCover} disabled={loading} className="flex-1 bg-theme-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity tracking-wide">
                {loading ? "Yükleniyor..." : "Yükle ve İlerle →"}
              </button>
            </div>
          </div>
        )}

        {/* --- ADIM 3: İLAN DETAYLARI --- */}
        {step === 3 && (
          <form onSubmit={handleCreateListing} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>İlan Tipi</label>
                <select className={inputClass} value={listingData.listing_type} onChange={e => setListingData({ ...listingData, listing_type: e.target.value })}>
                  <option value="Satılık">Satılık</option>
                  <option value="Hediye">Hediye</option>
                  <option value="Takaslık">Takaslık</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Kitap Durumu</label>
                <select className={inputClass} value={listingData.condition} onChange={e => setListingData({ ...listingData, condition: e.target.value })}>
                  <option value="Yeni">Sıfır / Yeni</option>
                  <option value="Yeni Gibi">Yeni Gibi</option>
                  <option value="İyi">İyi (Hafif Yıpranmış)</option>
                  <option value="Yıpranmış">Yıpranmış (Okunabilir)</option>
                </select>
              </div>

              {/* Sadece satılıksa fiyat göster */}
              {listingData.listing_type === "Satılık" && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Fiyat (₺)</label>
                  <input type="number" required className={inputClass} placeholder="Örn: 150" value={listingData.price} onChange={e => setListingData({ ...listingData, price: e.target.value })} />
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelClass}>İlan Açıklaması</label>
                <textarea rows={4} required className={`${inputClass} resize-none`} placeholder="Alıcılara iletmek istediğin notlar (Örn: İlk 10 sayfası çizili)..." value={listingData.description} onChange={e => setListingData({ ...listingData, description: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-theme-primary text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity tracking-wide mt-4">
              {loading ? "Yayınlanıyor..." : "🚀 İlanı Yayınla"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}