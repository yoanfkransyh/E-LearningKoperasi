/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const PageProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
  });

  // Email input (only used to request supabase to send verification)
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone number and OTP states
  const [phone, setPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const otpCode = otpDigits.join("");
  const otpRefs = useRef([]); // refs for each digit input
  const [pendingPhone, setPendingPhone] = useState("");

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
      });
      // profile no longer stores email column — use auth user email for initial value
      setEmail(user?.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!croppedAreaPixels || !selectedImage) return;

    try {
      const croppedImageBlob = await getCroppedImg(
        selectedImage,
        croppedAreaPixels
      );
      setCroppedImageBlob(croppedImageBlob);
      setShowCropModal(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    setCroppedImageBlob(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const uploadProfilePicture = async (imageBlob) => {
    if (!user) return null;

    try {
      if (profile?.avatar_url) {
        try {
          const oldUrl = new URL(profile.avatar_url);
          const oldFileName = oldUrl.pathname.split("/").pop();
          await supabase.storage.from("profile-pictures").remove([oldFileName]);
        } catch (urlError) {
          console.log("Could not parse old image URL for deletion");
        }
      }

      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, imageBlob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      let avatarUrl = profile?.avatar_url;

      if (croppedImageBlob) {
        avatarUrl = await uploadProfilePicture(croppedImageBlob);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage("Profil berhasil diperbarui!");

      await updateProfile();
      setCroppedImageBlob(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      setError("Mohon isi semua field password");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (passwords.new.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      setMessage("Password berhasil diubah!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailVerification = async () => {
    if (!email || !user) return;
    if (email === user.email) {
      setMessage("Email sama dengan email saat ini.");
      return;
    }

    setEmailLoading(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      // Supabase will send verification email to the new address
      setMessage(`Link verifikasi telah dikirim ke ${email}. Silakan cek kotak masuk untuk memverifikasi.`);
    } catch (err) {
      console.error("Error updating email:", err);
      setError(err.message || "Gagal mengirim verifikasi email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError("Masukkan nomor HP yang valid (min 10 digit)");
      return;
    }

    // Format phone: pastikan diawali 62 (Indonesia)
    let formattedPhone = phone.replace(/\D/g, ""); // hapus non-digit
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("62")) {
      formattedPhone = "62" + formattedPhone;
    }

    setPhoneLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPendingPhone(formattedPhone);
        setShowOtpModal(true);
        // reset OTP digits
        setOtpDigits(Array(6).fill(""));
        // focus first after next tick
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        setMessage(`Kode OTP telah dikirim ke WhatsApp ${formattedPhone}`);
      } else {
        throw new Error(data.error || data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Gagal mengirim OTP. Pastikan backend sudah berjalan.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setOtpLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: pendingPhone, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update phone di database profiles
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ phone: pendingPhone, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (updateError) throw updateError;

        await updateProfile();
        setShowOtpModal(false);
        setOtpDigits(Array(6).fill(""));
        setPendingPhone("");
        setMessage("Nomor HP berhasil diverifikasi dan disimpan!");
      } else {
        throw new Error(data.message || "Kode OTP tidak valid atau kadaluarsa");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Gagal memverifikasi OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="text-lg">Memuat profil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="grow pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8">
          {/* Header profil */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                {croppedImageBlob ? (
                  <img
                    src={URL.createObjectURL(croppedImageBlob)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white font-bold text-xl">
                    {profile.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {profile.full_name || "User"}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b mb-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profil")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profil"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "password"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Ganti Password
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "profil" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor HP (WhatsApp)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pr-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="08123456789 atau 628123456789"
                    />
                    <button
                      onClick={handleSendOtp}
                      disabled={phoneLoading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                    >
                      {phoneLoading ? "Mengirim..." : "Kirim OTP"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nomor akan diverifikasi via WhatsApp OTP
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@domain.com"
                    />
                    <button
                      onClick={handleSendEmailVerification}
                      disabled={emailLoading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      {emailLoading ? "Mengirim..." : "Kirim Verifikasi"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Mengganti email akan mengirim link verifikasi ke alamat baru.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Mengubah..." : "Ubah Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Crop Modal */}
      {showCropModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Crop Foto Profil
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sesuaikan posisi dan ukuran foto profil Anda
              </p>
            </div>

            <div className="p-6">
              <div
                className="relative bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: "300px" }}
              >
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Drag gambar untuk memposisikan</li>
                  <li>• Gunakan slider zoom untuk memperbesar/kecil</li>
                  <li>• Hasil akan berbentuk bulat dengan ukuran 200x200px</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleCropCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleCropComplete}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Verifikasi OTP</h2>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan kode OTP 6 digit yang telah dikirim ke WhatsApp Anda.
            </p>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-6 gap-2 mb-4">
              {otpDigits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...otpDigits];
                    next[idx] = val;
                    setOtpDigits(next);
                    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      if (otpDigits[idx]) {
                        const next = [...otpDigits];
                        next[idx] = "";
                        setOtpDigits(next);
                      } else if (idx > 0) {
                        otpRefs.current[idx - 1]?.focus();
                        const next = [...otpDigits];
                        next[idx - 1] = "";
                        setOtpDigits(next);
                      }
                    } else if (e.key === "ArrowLeft" && idx > 0) {
                      otpRefs.current[idx - 1]?.focus();
                    } else if (e.key === "ArrowRight" && idx < 5) {
                      otpRefs.current[idx + 1]?.focus();
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md text-center text-lg"
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpDigits(Array(6).fill(""));
                  setPendingPhone("");
                }}
                className="px-4 py-2 border rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpCode.length !== 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {otpLoading ? "Memverifikasi..." : "Verifikasi"}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Tidak menerima kode?{" "}
              <button
                onClick={() => {
                  handleSendOtp();
                  setOtpDigits(Array(6).fill(""));
                }}
                disabled={phoneLoading}
                className="text-blue-600 hover:underline"
              >
                Kirim ulang
              </button>
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PageProfile;
