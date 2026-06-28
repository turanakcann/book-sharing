"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sayfa açıldığında tarayıcı hafızasına bakıyoruz
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    
    // Eğer hafızada dark varsa en tepe HTML etiketine "dark" class'ını çakıyoruz
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // HTML etiketine dark class'ını ekle veya çıkar
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Next.js hydration hatasını (sunucu ve tarayıcı uyuşmazlığı) önlemek için
  if (!mounted) return <div className="invisible">{children}</div>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Diğer sayfalardan temayı değiştirmek için kullanacağımız özel kanca (hook)
export const useTheme = () => useContext(ThemeContext);