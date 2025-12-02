import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const checkToken = async () => {

      const fullUrl = window.location.href;
      
      let tokenPart = '';
      
      const hashMatch = fullUrl.match(/reset-password[#?](.+)/);
      if (hashMatch) {
        tokenPart = hashMatch[1];
      }
      
      const params = new URLSearchParams(tokenPart);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');

      console.log('Parsed tokens:', { access_token: !!access_token, type, refresh_token: !!refresh_token });

      if (type === 'recovery' && access_token) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || ''
          });
          
          if (!error && data.session) {
            setValidToken(true);
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('#')[0] + '#/reset-password');
          } else {
            console.error('Session error:', error);
            setError("Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.");
          }
        } catch (err) {
          console.error('Token verification error:', err);
          setError("Terjadi kesalahan saat memverifikasi link. Silakan coba lagi.");
        }
      } else {
        setError("Link reset password tidak valid. Pastikan Anda mengklik link yang benar dari email.");
      }
      
      setChecking(false);
    };

    checkToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password berhasil diubah! Anda akan dialihkan ke halaman login...");
      
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Memverifikasi link reset password...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-gray-50 flex items-center justify-center px-4 py-24 md:py-32">
        <div
          className={
            "max-w-md w-full bg-white rounded-lg shadow-md p-6 md:p-8 my-8 transform transition-all duration-500 ease-out " +
            (mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95")
          }
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
            Buat Password Baru
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Masukkan password baru untuk akun Anda
          </p>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
              {!validToken && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="block w-full text-center text-sm underline text-red-700 hover:text-red-800"
                  >
                    Kembali ke Login
                  </button>
                </div>
              )}
            </div>
          )}

          {validToken && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-2 md:py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 font-medium text-sm md:text-base"
              >
                {loading ? "Mengubah Password..." : "Ubah Password"}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Kembali ke Login
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;