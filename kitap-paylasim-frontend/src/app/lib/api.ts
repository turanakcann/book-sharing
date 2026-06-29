import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  // Backend URL'imiz
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

// REQUEST INTERCEPTOR (Gümrük Memuru)
api.interceptors.request.use(
  (config) => {
    // İŞTE SİHİRLİ DÜZELTME: "token" yerine "access_token" okuyoruz!
    const token = Cookies.get("access_token");
    
    // Token varsa Authorization başlığına çak
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;