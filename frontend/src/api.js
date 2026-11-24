import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use(config => { const token=localStorage.getItem("ATHLON_token"); if(token) config.headers.Authorization=`Bearer ${token}`; return config; });
api.interceptors.response.use(r=>r,err=>{ if(err.response?.status===401 && !["/auth/login","/auth/register"].some(x=>err.config?.url?.includes(x))) { localStorage.removeItem("ATHLON_token"); localStorage.removeItem("ATHLON_user"); window.dispatchEvent(new Event("ATHLON:logout")); } return Promise.reject(err); });
export default api;
