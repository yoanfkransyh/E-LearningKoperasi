/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (type === "signup" && token) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) {
            setStatus("error");
            setMessage("Link konfirmasi tidak valid atau sudah kadaluarsa");
          } else {
            setStatus("success");
            setMessage("Email berhasil dikonfirmasi! Silakan login.");
            setTimeout(() => navigate("/login"), 3000);
          }
        } catch (error) {
          setStatus("error");
          setMessage("Terjadi kesalahan saat konfirmasi email");
        }
      } else {
        setStatus("error");
        setMessage("Link konfirmasi tidak valid");
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow bg-gray-50 flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Konfirmasi Email</h1>

          {status === "loading" && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Sedang memproses konfirmasi...</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 17"
                  />
                </svg>
              </div>
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Anda akan diarahkan ke halaman login...
              </p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{message}</p>
              <button
                onClick={() => navigate("/register")}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Daftar Ulang
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmEmail;
