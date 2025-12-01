import React, { useEffect, useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100,
    height: 56.25,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [originalImageSrc, setOriginalImageSrc] = useState(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);
  const [isCropChanged, setIsCropChanged] = useState(false);
  // delete confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCourse, setConfirmCourse] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // notification state
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("success"); // success | error | info
  const [notifProgress, setNotifProgress] = useState(100); // percent remaining
  const notifTimer = useRef(null);
  const progressTimer = useRef(null);

  const clearNotifTimers = () => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  const showNotification = (message, type = "success", duration = 4000) => {
    clearNotifTimers();
    setNotifMessage(message);
    setNotifType(type);
    setNotifProgress(100);
    setNotifVisible(true);

    // animate progress from 100 -> 0
    const stepMs = 50;
    const step = (stepMs / duration) * 100;
    progressTimer.current = setInterval(() => {
      setNotifProgress((p) => {
        const next = p - step;
        if (next <= 0) {
          clearNotifTimers();
          setNotifVisible(false);
          return 0;
        }
        return next;
      });
    }, stepMs);

    notifTimer.current = setTimeout(() => {
      clearNotifTimers();
      setNotifVisible(false);
    }, duration);
  };

  // cleanup notif timers on unmount
  useEffect(() => {
    return () => clearNotifTimers();
  }, []);

  const imgRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // fetch online users (last_active within last 5 minutes), fallback to total profiles if filter not available
  const fetchOnlineUsers = async () => {
    try {
      setOnlineLoading(true);
      const threshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      // try to get users with last_active >= threshold
      let { data, error } = await supabase
        .from("profiles")
        .select("id")
        .gte("last_active", threshold);

      if (error) {
        // if query failed (maybe column doesn't exist), fallback to counting all profiles
        const fallback = await supabase.from("profiles").select("id");
        if (fallback.error) throw fallback.error;
        setOnlineUsers(fallback.data?.length || 0);
      } else {
        setOnlineUsers(data?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching online users:", err);
    } finally {
      setOnlineLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    const id = setInterval(fetchOnlineUsers, 30000); // poll setiap 30s
    return () => clearInterval(id);
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pdfUrl = editingCourse?.pdf_url || "";
      let imageUrl = editingCourse?.image_url || "";

      if (pdfFile) {
        const fileExt = pdfFile.name.split(".").pop();
        const fileName = `${formData.slug}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("course-materials")
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("course-materials").getPublicUrl(fileName);

        pdfUrl = publicUrl;
      }

      if (imageFile) {
        if (editingCourse?.image_url) {
          try {
            const url = new URL(editingCourse.image_url);
            const pathParts = url.pathname.split("/");
            const oldFileName = pathParts[pathParts.length - 1];
            await supabase.storage
              .from("course-thumbnails")
              .remove([oldFileName]);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${formData.slug}-thumbnail-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update({
            ...formData,
            pdf_url: pdfUrl,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCourse.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert({
          ...formData,
          pdf_url: pdfUrl,
          image_url: imageUrl,
        });

        if (error) throw error;
      }

      // show success notification for create/update
      showNotification(editingCourse ? "Kursus berhasil diperbarui." : "Kursus berhasil ditambahkan.", "success");
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ slug: "", title: "", description: "" });
      setPdfFile(null);
      setImageFile(null);
      setCroppedImageBlob(null);
      setIsCropChanged(false);
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      showNotification(error.message || "Gagal menyimpan kursus", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      slug: course.slug,
      title: course.title,
      description: course.description,
    });
    setCroppedImageBlob(null);
    setIsCropChanged(false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImageSrc(reader.result);
        setCrop({
          unit: "%",
          width: 80,
          height: 45,
          x: 10,
          y: 27.5,
        });
        setCompletedCrop({
          unit: "%",
          width: 80,
          height: 45,
          x: 10,
          y: 27.5,
        });
        setIsCropChanged(false);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const actualCropWidth = crop.width * scaleX;
    const actualCropHeight = crop.height * scaleY;
    const actualCropX = crop.x * scaleX;
    const actualCropY = crop.y * scaleY;

    const targetWidth = 400;
    const targetHeight = 225;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      actualCropX,
      actualCropY,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (!isCropChanged) {
      alert("Silakan sesuaikan posisi crop terlebih dahulu");
      return;
    }

    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );

      const file = new File(
        [croppedImageBlob],
        `cropped-image-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      setImageFile(file);
      setCroppedImageBlob(croppedImageBlob);
      setShowCropModal(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageSrc(null);
    setIsCropChanged(false);
    setCrop({
      unit: "%",
      width: 100,
      height: 56.25,
      x: 0,
      y: 0,
    });
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
    setIsCropChanged(true);
  };

  // actual delete (no prompt here)
  const handleDelete = async (id) => {
    try {
      const { data: courseData, error: fetchError } = await supabase
        .from("courses")
        .select("pdf_url, image_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error: deleteError } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      if (courseData?.pdf_url) {
        try {
          const url = new URL(courseData.pdf_url);
          const pathParts = url.pathname.split("/");
          const fileName = pathParts[pathParts.length - 1];

          await supabase.storage.from("course-materials").remove([fileName]);
        } catch (error) {
          console.error("Error deleting PDF:", error);
        }
      }

      if (courseData?.image_url) {
        try {
          const url = new URL(courseData.image_url);
          const pathParts = url.pathname.split("/");
          const fileName = pathParts[pathParts.length - 1];

          await supabase.storage.from("course-thumbnails").remove([fileName]);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }

      fetchCourses();
      showNotification("Kursus berhasil dihapus.", "success");
      // close confirm modal if open
      setConfirmOpen(false);
      setConfirmCourse(null);
      setConfirmLoading(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      showNotification(error.message || "Gagal menghapus kursus", "error");
      setConfirmLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Centered Toast Notification (enhanced) */}
      <div
        aria-hidden={!notifVisible}
        className={`fixed top-24 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-300 pointer-events-none ${
          notifVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="pointer-events-auto w-[360px] md:w-[520px]">
          <div className="bg-linear-to-r from-white/80 via-slate-50 to-white/80 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
                notifType === "success" ? "bg-linear-to-tr from-green-100 to-green-50 text-green-700" :
                notifType === "error" ? "bg-linear-to-tr from-red-100 to-red-50 text-red-700" :
                "bg-linear-to-tr from-sky-100 to-sky-50 text-sky-700"
              }`}>
                {notifType === "success" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : notifType === "error" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01"/></svg>
                )}
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {notifType === "success" ? "Berhasil" : notifType === "error" ? "Gagal" : "Info"}
                </div>
                <div className="text-xs md:text-sm text-slate-700/90 mt-1">
                  {notifMessage}
                </div>
              </div>

              <div className="self-start">
                <button
                  onClick={() => { clearNotifTimers(); setNotifVisible(false); }}
                  aria-label="Tutup notifikasi"
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* progress bar */}
            <div className="h-1 bg-slate-100">
              <div
                className={`h-full ${notifType === "success" ? "bg-green-500" : notifType === "error" ? "bg-red-500" : "bg-sky-500"} transition-all duration-200`}
                style={{ width: `${notifProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <Navbar />
      <main className="grow bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Kelola kursus dan materi pembelajaran
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 hover:text-blue-800 mt-2 text-sm font-medium"
                >
                  ← Kembali ke Beranda
                </button>
              </div>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setFormData({ slug: "", title: "", description: "" });
                  setPdfFile(null);
                  setImageFile(null);
                  setCroppedImageBlob(null);
                  setIsCropChanged(false);
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 shadow-sm"
              >
                + Tambah Kursus Baru
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Kursus
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Kursus Aktif
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 21v-2c0-2.21-4.03-4-8-4s-8 1.79-8 4v2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pengguna Terdaftar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {onlineLoading ? "..." : onlineUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Daftar Kursus
            </h2>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-gray-500">
                  Belum ada kursus. Tambahkan kursus pertama Anda!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200"
                  >
                    {/* Course Image */}
                    <div className="h-48 bg-gray-100 relative">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Slug: {course.slug}</span>
                        <span>
                          {new Date(course.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfirmCourse(course);
                            setConfirmOpen(true);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                        >
                          Hapus
                        </button>
                      </div>

                      {/* View Course Button */}
                      <div className="mt-2">
                        <button
                          onClick={() => navigate(`/kursus/${course.slug}`)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                        >
                          Lihat Kursus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50 p-4 mt-10">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? "Edit Kursus" : "Tambah Kursus Baru"}
              </h2>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => {
                        const inputValue = e.target.value.replace(/\s/g, "");
                        setFormData({ ...formData, slug: inputValue });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: belajar-html"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Spasi tidak diperbolehkan. Gunakan tanda hubung (-) atau
                      underscore (_) untuk pemisah kata.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Kursus *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan judul kursus"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File PDF
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {editingCourse && !pdfFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Biarkan kosong jika tidak ingin mengubah PDF
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Masukkan deskripsi kursus"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Thumbnail
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">
                        Gambar akan di-crop ke rasio 16:9 setelah dipilih
                      </p>
                    </div>
                  </div>

                  {/* Current Image Preview (for edit) */}
                  {editingCourse?.image_url && !croppedImageBlob && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Saat Ini
                      </label>
                      <img
                        src={editingCourse.image_url}
                        alt="Current thumbnail"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Cropped Image Preview */}
                  {croppedImageBlob && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Baru (Hasil Crop)
                      </label>
                      <img
                        src={URL.createObjectURL(croppedImageBlob)}
                        alt="Cropped preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan Kursus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Crop Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Crop Gambar Thumbnail
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sesuaikan area yang ingin ditampilkan sebagai thumbnail (rasio
                16:9)
              </p>
            </div>

            {/* Crop Content */}
            <div className="p-4">
              <div className="flex justify-center bg-gray-100 rounded-lg p-2">
                {originalImageSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={16 / 9}
                    className="max-w-full"
                    minWidth={50}
                    minHeight={28}
                  >
                    <img
                      ref={imgRef}
                      src={originalImageSrc}
                      alt="Crop preview"
                      className="max-w-full max-h-[400px] object-contain"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  </ReactCrop>
                )}
              </div>

              {/* Crop Status */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Status Crop:
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isCropChanged
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {isCropChanged
                      ? "Siap untuk disimpan"
                      : "Gerakkan crop area"}
                  </span>
                </div>
              </div>
            </div>

            {/* Crop Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!isCropChanged}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCropChanged ? "Terapkan Crop" : "Gerakkan Crop Dulu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmOpen && confirmCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-white bg-opacity-100 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-none w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M6.938 4h10.124a2 2 0 012 2v12a2 2 0 01-2 2H6.938a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Hapus Kursus</h3>
                <p className="text-sm text-gray-600 mt-1">Anda yakin ingin menghapus kursus <strong>{confirmCourse.title}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmCourse(null);
                }}
                className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setConfirmLoading(true);
                  await handleDelete(confirmCourse.id);
                }}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-md text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {confirmLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
