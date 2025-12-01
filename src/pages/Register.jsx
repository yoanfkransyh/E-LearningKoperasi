import React, { useState, useEffect } from "react";
import { Link} from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signUp } = useAuth();

  useEffect(() => {
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
    setSuccess(false);

    const result = await signUp(email, password, fullName);

    if (result?.error) {
      setError(result.error.message || String(result.error));
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-gray-50 flex items-center justify-center px-4 py-24 md:py-32">
        <div
          className={
            "max-w-md w-full bg-white rounded-lg shadow-md p-6 md:p-8 my-8 transform transition-all duration-500 ease-out will-change-transform " +
            (mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95")
          }
        >
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Daftar Akun
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
                Silakan isi form dibawah untuk membuat akun.
              </p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
              <strong>Registrasi berhasil!</strong>
              <br />
              Silakan cek email Anda dan klik link konfirmasi untuk mengaktifkan
              akun.
              <br />
              <span className="text-xs">
                Setelah konfirmasi, Anda bisa login dengan akun tersebut.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                required
              />
            </div>

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
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-2 md:py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 font-medium text-sm md:text-base"
            >
              {loading ? "Loading..." : "Daftar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;