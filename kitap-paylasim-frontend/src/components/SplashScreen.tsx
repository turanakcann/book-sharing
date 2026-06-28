"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"shelf" | "fall" | "zoom" | "open" | "flash" | "done">("shelf");

  useEffect(() => {
    // 100ms: Kitap boşlukta aşağı düşer
    const t1 = setTimeout(() => setPhase("fall"), 100);
    
    // 500ms: Kamera kitabın tepesine uçar (Üstten görünüm - Top-Down)
    const t2 = setTimeout(() => setPhase("zoom"), 500);
    
    // 1100ms: Kitap kapağı sağdan sola doğru açılır
    const t3 = setTimeout(() => setPhase("open"), 1100);
    
    // 1800ms: Kitabın içinden bembeyaz bir ışık parlar
    const t4 = setTimeout(() => setPhase("flash"), 1800);
    
    // 2200ms: Animasyon biter, pürüzsüzce ana sayfaya geçilir
    const t5 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  // Kitabın konum, açı ve yakınlaşma matematiği
  const getBookTransform = () => {
    if (phase === "shelf") return "translateY(-100px) rotateX(0deg) scale(0.6)";
    // Kitap yere düşerken arkaya doğru yatar (rotateX: 65deg), bu sayede yere düz düştüğünü anlarız
    if (phase === "fall") return "translateY(60px) rotateX(65deg) rotateZ(-5deg) scale(0.6)";
    // Kamera kitabın tepesine uçar: Kitap ekranı kaplar ve kameraya tam düz bakar
    return "translateY(0px) rotateX(0deg) rotateZ(0deg) scale(2.5)";
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-950 overflow-hidden" style={{ perspective: "1000px" }}>
      
      {/* SİNEMATİK 3D KİTAP KAPSAYICISI */}
      <div
        className="relative w-28 h-40 shadow-2xl rounded-r-md"
        style={{
          transformStyle: "preserve-3d",
          transform: getBookTransform(),
          transitionProperty: "transform",
          // Düşüş anında hızlanan (gravity), kameranın uçuş anında yavaşlayan (smooth) fizik eğrisi
          transitionDuration: phase === "fall" ? "400ms" : "600ms",
          transitionTimingFunction: phase === "fall" ? "cubic-bezier(0.55, 0.085, 0.68, 0.53)" : "cubic-bezier(0.2, 0.8, 0.2, 1)"
        }}
      >
        
        {/* KİTABIN İÇ SAYFALARI VE ARKA KAPAĞI (Sabit Kısım) */}
        <div 
          className="absolute inset-0 bg-zinc-100 rounded-r-md shadow-inner flex items-center justify-center overflow-hidden"
          style={{ transform: "translateZ(0px)" }}
        >
          {/* Sayfa Detayları (Kitap içi çizgiler) */}
          <div className="w-full h-full border-l-[4px] border-zinc-300 flex flex-col justify-evenly py-2 px-1 opacity-50">
            <div className="w-full h-px bg-zinc-300"></div>
            <div className="w-full h-[1px] bg-zinc-300"></div>
            <div className="w-full h-px bg-zinc-300"></div>
          </div>
          
          {/* İçeriden Yükselen Parlama Efekti */}
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-700 ${
              (phase === "open" || phase === "flash") ? "opacity-100" : "opacity-0"
            }`} 
            style={{ boxShadow: (phase === "open" || phase === "flash") ? "inset 0 0 20px rgba(255,255,255,1)" : "none" }}
          ></div>
        </div>

        {/* ÖN KAPAK (Sağdan Sola Açılan Hinge Mekanizması) */}
        <div 
          className="absolute inset-0 rounded-r-md bg-linear-to-br from-indigo-700 to-slate-900 border-l border-indigo-800 flex items-center justify-center shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
          style={{
            transformOrigin: "left center", // Menteşe sol tarafta (Sağdan sola açılması için)
            // Kapak açılınca -160 derece sola yatar, translateZ(1px) z-fighting'i (sayfa ile iç içe girmeyi) önler
            transform: (phase === "open" || phase === "flash") ? "translateZ(1px) rotateY(-160deg)" : "translateZ(1px) rotateY(0deg)",
            transition: "transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          {/* Sadece şık ve minimalist bir kapak detayı (Yazı yok) */}
          <div className="absolute left-1.5 inset-y-0 w-0.5 bg-indigo-950/40"></div>
          <div className="w-14 h-20 border border-indigo-500/30 rounded-sm"></div>
        </div>

      </div>

      {/* BEMBEYAZ SİNEMATİK GEÇİŞ EKRANI (FLASH) */}
      <div 
        className={`fixed inset-0 bg-gray-50 z-[110] transition-opacity duration-400 pointer-events-none ${
          phase === "flash" ? "opacity-100" : "opacity-0"
        }`}
      ></div>

    </div>
  );
}