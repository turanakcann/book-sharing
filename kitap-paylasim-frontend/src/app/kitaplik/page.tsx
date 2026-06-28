"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import Link from "next/link";

// --- TİPLER ---
interface BookData {
  id: number;
  title: string;
  author: string;
  page_count: number;
  condition: string;
  description: string;
  isbn: string;
  created_at: string; // Yükleme tarihi
  cover_image_url: string | null;
}

export default function LibraryDashboard() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "a-z" | "z-a">("desc");

  // Seçili Kitap ve Sinematik Modal State'i
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Pomodoro State'leri
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Veri Çekme (Şimdilik ilanlar endpoint'inden çekiyoruz)
  useEffect(() => {
    const fetchMyLibrary = async () => {
      try {
        const res = await api.get("/listings/my-listings");
        // Gelen veriyi kitap şemasına mapliyoruz
        const mappedBooks = res.data.map((l: any) => ({
          id: l.book.id,
          title: l.book.title,
          author: l.book.author,
          page_count: l.book.page_count || "Bilinmiyor",
          condition: l.condition,
          description: l.book.description || l.description,
          isbn: l.book.isbn !== "string" ? l.book.isbn : "",
          created_at: new Date().toLocaleDateString("tr-TR"), // Backend'den tarih gelmiyorsa bugünü baz aldık
          cover_image_url: l.book.cover_image_url !== "string" ? l.book.cover_image_url : null,
        }));
        setBooks(mappedBooks);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyLibrary();
  }, []);

  // Pomodoro Mantığı
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      alert("Pomodoro bitti! Mola zamanı.");
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Sıralama Mantığı
  const sortedBooks = [...books].sort((a, b) => {
    if (sortOrder === "a-z") return a.title.localeCompare(b.title);
    if (sortOrder === "z-a") return b.title.localeCompare(a.title);
    if (sortOrder === "desc") return b.id - a.id;
    return a.id - b.id;
  });

  // Kitaba Tıklama ve Animasyon
  const handleBookClick = (book: BookData) => {
    setSelectedBook(book);
    setIsAnimating(true);
    // 2 saniyelik sinematik animasyon bekleme süresi
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-theme-bg flex flex-col lg:flex-row transition-colors">
      {/* SOL PANEL (Araçlar ve Liste) */}
      <aside className="w-full lg:w-96 bg-theme-card border-r border-theme-border flex flex-col p-6 overflow-y-auto shadow-sm z-10">
        
        {/* POMODORO */}
        <div className="bg-theme-bg rounded-2xl p-6 border border-theme-border text-center mb-6 shadow-inner relative group">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-theme-muted uppercase tracking-widest">⏱️ Pomodoro</h3>
            {/* Dakika Ayarlama Kutusu */}
            <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
              <input
                type="number"
                value={pomodoroMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setPomodoroMinutes(val);
                  if (!isTimerRunning) setTimeLeft(val * 60);
                }}
                min="1"
                max="120"
                className="w-12 bg-theme-card text-theme-text text-xs text-center border border-theme-border rounded px-1 py-0.5 outline-none"
              />
              <span className="text-[10px] font-bold text-theme-muted">dk</span>
            </div>
          </div>

          <div className="text-5xl font-black text-theme-text font-mono tracking-tighter mb-4">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="bg-theme-primary text-white px-5 py-2 rounded-lg font-bold hover:opacity-90 transition"
            >
              {isTimerRunning ? "Durdur" : "Başlat"}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimeLeft(pomodoroMinutes * 60);
              }}
              className="bg-theme-text text-theme-bg px-5 py-2 rounded-lg font-bold hover:opacity-90 transition"
            >
              Sıfırla
            </button>
          </div>
        </div>

        {/* MİNİ TAKVİM (Görsel) */}
        <div className="bg-theme-bg rounded-2xl p-5 border border-theme-border mb-6">
          <h3 className="text-sm font-bold text-theme-text mb-3">🗓️ Bugün</h3>
          <div className="flex justify-between items-center bg-theme-card p-3 rounded-xl border border-theme-border/50">
            <div className="text-center">
              <span className="block text-xs font-bold text-theme-primary uppercase">Ay</span>
              <span className="block text-xl font-black text-theme-text">
                {new Date().toLocaleString("tr-TR", { month: "short" })}
              </span>
            </div>
            <div className="text-5xl font-black text-theme-text opacity-20">
              {new Date().getDate()}
            </div>
          </div>
        </div>

        {/* KİTAP LİSTESİ VE FİLTRE */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-theme-muted uppercase tracking-widest">📚 Arşivim</h3>
            <div className="flex items-center gap-2">
              <select
                className="bg-theme-bg border border-theme-border text-xs font-bold text-theme-text p-1.5 rounded-lg outline-none cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="desc">Yeniden Eskiye ⬇</option>
                <option value="asc">Eskiden Yeniye ⬆</option>
                <option value="a-z">A'dan Z'ye</option>
                <option value="z-a">Z'den A'ya</option>
              </select>
              <Link
                href="/ilan-ekle"
                title="Yeni Kitap Ekle"
                className="bg-theme-primary text-white flex items-center justify-center w-7 h-7 rounded-lg hover:scale-105 transition-transform font-bold text-lg leading-none"
              >
                +
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {sortedBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="w-full text-left bg-theme-bg hover:bg-theme-border/30 border border-theme-border p-3 rounded-xl transition flex items-center gap-3 group"
              >
                <div className="h-10 w-8 bg-theme-card rounded border border-theme-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-[10px] m-1">📖</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-theme-text truncate group-hover:text-theme-primary transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-theme-muted truncate">{book.author}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* SAĞ PANEL (Görsel Kitaplık) */}
      <main className="flex-1 p-8 lg:p-12 flex flex-col relative overflow-hidden bg-gradient-to-b from-theme-bg to-theme-card">
        <h2 className="text-3xl font-black text-theme-text tracking-tight mb-12 text-center">
          Dijital Kitaplığın
        </h2>

        {/* Kitaplık Rafları Sahnemiz */}
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-12 relative z-10">
          {[1, 2, 3].map((shelf) => (
            <div key={shelf} className="relative flex items-end px-12 pb-4">
              {/* Rafın Kendisi (Tahta Görünümü) */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#8B5A2B] rounded shadow-[0_10px_20px_rgba(0,0,0,0.2)] border-b-2 border-[#5C3A21]"></div>

              {/* Kitaplar (Sırayla Raflara Dizilir) */}
              <div className="flex gap-2 relative z-10 w-full overflow-hidden">
                {sortedBooks.slice((shelf - 1) * 8, shelf * 8).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book)}
                    className="w-12 h-36 bg-theme-primary rounded-sm shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-4 transition-transform duration-300 border-l-2 border-white/20 origin-bottom"
                    style={{
                      backgroundColor: book.id % 2 === 0 ? "var(--theme-text)" : "var(--theme-primary)",
                    }}
                  >
                    <span className="text-theme-bg text-[10px] font-bold transform -rotate-90 whitespace-nowrap truncate w-28 text-center tracking-wider">
                      {book.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* SİNEMATİK MODAL (Kitap Tıklandığında Açılan Ekran) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          {isAnimating ? (
            // AÇILIŞ ANİMASYONU
            <div
              className="w-48 h-64 bg-theme-primary rounded-r-xl shadow-2xl flex items-center justify-center border-l-4 border-theme-text transform transition-all duration-[1500ms] animate-book-open"
              style={{ perspective: "1000px" }}
            >
              <div className="absolute inset-0 bg-white origin-left transition-transform duration-[1500ms] style-preserve-3d -rotate-y-180 flex items-center justify-center shadow-inner">
                <div className="w-8 h-8 rounded-full border-4 border-t-theme-primary animate-spin"></div>
              </div>
            </div>
          ) : (
            // KİTAP KÜNYESİ (Animasyon bitince gösterilir)
            <div className="bg-theme-card max-w-2xl w-full rounded-3xl p-8 relative shadow-2xl border border-theme-border animate-fade-in flex flex-col md:flex-row gap-8">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-5 text-theme-muted hover:text-red-500 text-2xl font-black transition"
              >
                ✕
              </button>

              <div className="w-full md:w-1/3 bg-theme-bg rounded-2xl border border-theme-border p-4 flex items-center justify-center">
                {selectedBook.cover_image_url ? (
                  <img
                    src={selectedBook.cover_image_url}
                    className="w-full object-contain rounded drop-shadow-md"
                    alt={selectedBook.title}
                  />
                ) : (
                  <span className="text-6xl">📖</span>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-black text-theme-text leading-tight">
                    {selectedBook.title}
                  </h2>
                  <p className="text-lg font-bold text-theme-primary">{selectedBook.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-theme-bg p-4 rounded-xl border border-theme-border">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-theme-muted">Kondisyon</p>
                    <p className="font-bold text-theme-text">{selectedBook.condition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-theme-muted">Sayfa Sayısı</p>
                    <p className="font-bold text-theme-text">{selectedBook.page_count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-theme-muted">ISBN</p>
                    <p className="font-bold text-theme-text font-mono">
                      {selectedBook.isbn || "Girilmemiş"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-theme-muted">Yükleme Tarihi</p>
                    <p className="font-bold text-theme-text">{selectedBook.created_at}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-theme-muted mb-1">
                    Kitap Açıklaması
                  </p>
                  <p className="text-sm font-medium text-theme-text leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {selectedBook.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ekstra CSS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--theme-border);
          border-radius: 10px;
        }
        @keyframes bookOpen {
          0% {
            transform: scale(0.5) rotateY(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(2) rotateY(-30deg);
            opacity: 0;
          }
        }
        .animate-book-open {
          animation: bookOpen 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}