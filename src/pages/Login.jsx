import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      try {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const errorType = params.get("error");
        const errorDesc = params.get("error_description");
        const type = params.get("type");
        const accessToken = params.get("access_token");

        if (errorType) {
          const message = errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, " ")) : errorType;
          setError(message);
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        } else if (type === "recovery" && accessToken) {
          setShowResetPasswordForm(true);
          setError("");
        }
      } catch (e) {
        console.error("Error parsing URL hash:", e);
      }
    }
  }, []);

  useEffect(() => {
    // trigger entrance animation after mount
    const id = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(id);
      setMounted(false);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e?.preventDefault();
    setForgotError("");
    setForgotMessage("");
    if (!forgotEmail) {
      setForgotError("Masukkan alamat email");
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `https://yoanfkransyh.github.io/E-LearningKoperasi/#/login`,
      });
      if (error) throw error;
      setForgotMessage("Link reset password telah dikirim. Silakan cek email Anda.");
    } catch (err) {
      console.error("Error sending reset email:", err);
      setForgotError(err.message || "Gagal mengirim email reset");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (newPassword !== confirmPassword) {
      setResetError("Password dan konfirmasi tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Password minimal 6 karakter");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setResetMessage("Password berhasil diubah! Silakan login dengan password baru.");
      setShowResetPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      setTimeout(() => {
        setResetMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setResetError(err.message || "Gagal mengubah password");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-gray-50 flex items-center justify-center px-4 py-24 md:py-32">
        <div
          className={
            "max-w-md w-full bg-white rounded-lg shadow-md p-6 md:p-8 my-8 transform transition-all duration-500 ease-out will-change-transform " +
            (mounted
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95")
          }
        >
          {showResetPasswordForm ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                Reset Password
              </h1>

              {resetMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleResetPassword}>
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
                  disabled={resetLoading}
                  className="w-full bg-blue-900 text-white py-2 md:py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 font-medium text-sm md:text-base"
                >
                  {resetLoading ? "Mengubah..." : "Ubah Password"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                <button
                  onClick={() => {
                    setShowResetPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetError("");
                    setResetMessage("");
                    if (window.history && window.history.replaceState) {
                      window.history.replaceState(null, "", window.location.pathname);
                    }
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Kembali ke Login
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                Selamat Datang
              </h1>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Silakan masukkan email dan password untuk masuk.
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                  {resetMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                    required
                  />
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <div />
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-2 md:py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 font-medium text-sm md:text-base"
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Daftar di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
            </p>

            {forgotMessage && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="email@domain.com"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotEmail("");
                    setForgotError("");
                    setForgotMessage("");
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                  {forgotLoading ? "Mengirim..." : "Kirim Link Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
